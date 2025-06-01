const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const os = require('os');
const auditService = require('../services/audit.service');
const authService = require('../services/auth.service');
const notificationService = require('../services/notification.service');
const userService = require('../services/user.service');
const walletService = require('../services/wallet.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

const getDashboardStats = async (req, res, next) => {
  try {
    // Get user statistics
    const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);

    // Get transaction statistics
    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      transactionVolume,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'FAILED' } }),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    // Get wallet statistics
    const [totalWallets, walletBalance] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
    ]);

    // Get recent activity
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        senderWallet: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        receiverWallet: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        transactions: {
          total: totalTransactions,
          volume: transactionVolume._sum.amount || 0,
          pending: pendingTransactions,
          completed: completedTransactions,
          failed: failedTransactions,
        },
        wallets: {
          total: totalWallets,
          totalBalance: walletBalance._sum.balance || 0,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, userId, action, entity, entityId, startDate, endDate } = req.query;

    const filters = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    };

    const result = await auditService.getAuditLogs(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSystemHealth = async (req, res, next) => {
  try {
    // Database health check
    const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // CPU usage
    const cpus = os.cpus();
    const cpuUsage = cpus.map((cpu, index) => ({
      core: index,
      model: cpu.model,
      speed: cpu.speed,
      times: cpu.times,
    }));

    // Uptime
    const uptime = process.uptime();

    res.json({
      success: true,
      data: {
        status: dbHealth ? 'healthy' : 'unhealthy',
        database: {
          connected: dbHealth,
        },
        memory: {
          used: memoryUsage,
          system: {
            total: totalMemory,
            free: freeMemory,
            used: totalMemory - freeMemory,
            percentUsed: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2),
          },
        },
        cpu: {
          cores: cpus.length,
          usage: cpuUsage,
        },
        uptime: {
          seconds: uptime,
          formatted: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        },
        environment: {
          node: process.version,
          platform: os.platform(),
          env: process.env.NODE_ENV,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        senderWallet: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        receiverWallet: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const summary = {
      totalTransactions: transactions.length,
      totalVolume: transactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      byStatus: {
        pending: transactions.filter(t => t.status === 'PENDING').length,
        completed: transactions.filter(t => t.status === 'COMPLETED').length,
        failed: transactions.filter(t => t.status === 'FAILED').length,
        cancelled: transactions.filter(t => t.status === 'CANCELLED').length,
      },
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Transaction ID',
        'Reference',
        'Sender Email',
        'Receiver Email',
        'Amount',
        'Currency',
        'Status',
        'Created At',
        'Completed At',
      ].join(',');

      const csvRows = transactions.map(t => [
        t.id,
        t.reference,
        t.senderWallet.user.email,
        t.receiverWallet.user.email,
        t.amount,
        t.currency,
        t.status,
        t.createdAt,
        t.completedAt || '',
      ].join(','));

      const csv = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions-${startDate}-${endDate}.csv`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: {
          summary,
          transactions,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const runCleanup = async (req, res, next) => {
  try {
    const {
      cleanupOldAuditLogs = false,
      cleanupOldNotifications = false,
      cleanupExpiredTokens = false,
    } = req.body;

    const results = {};

    if (cleanupOldAuditLogs) {
      const auditResult = await auditService.deleteOldAuditLogs(90);
      results.auditLogs = {
        deleted: auditResult.count,
        message: `Deleted ${auditResult.count} audit logs older than 90 days`,
      };
    }

    if (cleanupOldNotifications) {
      const notificationResult = await notificationService.deleteOldNotifications(30);
      results.notifications = {
        deleted: notificationResult.count,
        message: `Deleted ${notificationResult.count} read notifications older than 30 days`,
      };
    }

    if (cleanupExpiredTokens) {
      const tokenResult = await authService.deleteExpiredRefreshTokens();
      results.tokens = {
        deleted: tokenResult.count,
        message: `Deleted ${tokenResult.count} expired refresh tokens`,
      };
    }

    // Log audit
    await auditService.log({
      userId: req.user.id,
      action: 'MAINTENANCE_CLEANUP',
      entity: 'System',
      metadata: results,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const seedAdmin = async (req, res, next) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin user already exists',
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPassword123!', 10);
    
    const admin = await userService.createUser({
      email: process.env.ADMIN_EMAIL || 'admin@vetopay.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    });

    // Create wallet for admin
    await walletService.createWallet(admin.id);

    logger.info(`Admin user created: ${admin.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
  getSystemHealth,
  getTransactionReport,
  runCleanup,
  seedAdmin,
}; 