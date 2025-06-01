const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['USER', 'VENDOR', 'ADMIN']).optional()
});

// Get all users
router.get('/users', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true,
            currency: true
          }
        }
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Update user status
router.patch('/users/:userId', authenticateToken, authorizeRole(['ADMIN']), validateRequest(updateUserSchema), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATE',
        userId: req.user.userId,
        details: {
          updatedUser: user.id,
          changes: { isActive, role }
        }
      }
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Get all transactions
router.get('/transactions', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        fromUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        toUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// Get system statistics
router.get('/stats', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED'
        }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTransactions,
        totalVolume: totalVolume._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Get audit logs
router.get('/audit-logs', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
});

module.exports = router; 