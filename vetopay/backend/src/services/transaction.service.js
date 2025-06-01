const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const walletService = require('./wallet.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const auditService = require('./audit.service');

const prisma = new PrismaClient();

const createTransaction = async (senderId, receiverEmail, amount, description, currency = 'USD') => {
  try {
    // Get sender's wallet
    const senderWallet = await walletService.getWalletByUserId(senderId);
    
    // Check if sender's wallet is active
    if (senderWallet.status !== 'ACTIVE') {
      throw new AppError('Your wallet is not active', 403);
    }

    // Check sufficient balance
    const hasBalance = await walletService.checkBalance(senderWallet.id, amount);
    if (!hasBalance) {
      throw new AppError('Insufficient funds', 400);
    }

    // Get receiver's user and wallet
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
      include: { wallet: true },
    });

    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }

    if (!receiver.wallet) {
      throw new AppError('Receiver does not have a wallet', 400);
    }

    if (receiver.wallet.status !== 'ACTIVE') {
      throw new AppError('Receiver wallet is not active', 400);
    }

    // Prevent self-transfer
    if (senderWallet.userId === receiver.id) {
      throw new AppError('Cannot transfer to yourself', 400);
    }

    // Create transaction with atomic balance updates
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          senderWalletId: senderWallet.id,
          receiverWalletId: receiver.wallet.id,
          amount: amount,
          currency: currency,
          status: 'PENDING',
          description: description,
          reference: uuidv4(),
        },
      });

      // Update sender's balance
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Update receiver's balance
      await tx.wallet.update({
        where: { id: receiver.wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Update transaction status to completed
      const completedTransaction = await tx.transaction.update({
        where: { id: newTransaction.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          senderWallet: {
            include: {
              user: {
                select: {
                  id: true,
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
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return completedTransaction;
    });

    // Send notifications
    await Promise.all([
      // Send email to sender
      emailService.sendTransactionEmail(
        transaction.senderWallet.user.email,
        transaction.senderWallet.user.firstName,
        'sent',
        {
          amount: transaction.amount,
          currency: transaction.currency,
          receiverName: `${transaction.receiverWallet.user.firstName} ${transaction.receiverWallet.user.lastName}`,
          reference: transaction.reference,
          description: transaction.description,
          createdAt: transaction.createdAt,
        }
      ),
      // Send email to receiver
      emailService.sendTransactionEmail(
        transaction.receiverWallet.user.email,
        transaction.receiverWallet.user.firstName,
        'received',
        {
          amount: transaction.amount,
          currency: transaction.currency,
          senderName: `${transaction.senderWallet.user.firstName} ${transaction.senderWallet.user.lastName}`,
          reference: transaction.reference,
          description: transaction.description,
          createdAt: transaction.createdAt,
        }
      ),
      // Create in-app notifications
      notificationService.createNotification(
        transaction.senderWallet.userId,
        'TRANSACTION',
        'Payment Sent',
        `You sent ${transaction.currency} ${transaction.amount} to ${transaction.receiverWallet.user.firstName}`,
        { transactionId: transaction.id }
      ),
      notificationService.createNotification(
        transaction.receiverWallet.userId,
        'TRANSACTION',
        'Payment Received',
        `You received ${transaction.currency} ${transaction.amount} from ${transaction.senderWallet.user.firstName}`,
        { transactionId: transaction.id }
      ),
      // Log audit
      auditService.log({
        userId: senderId,
        action: 'TRANSACTION_CREATED',
        entity: 'Transaction',
        entityId: transaction.id,
        metadata: {
          amount: transaction.amount,
          currency: transaction.currency,
          receiver: receiverEmail,
        },
      }),
    ]).catch(error => {
      logger.error(`Error sending transaction notifications: ${error.message}`);
    });

    logger.info(`Transaction created: ${transaction.reference} - ${currency} ${amount} from ${senderId} to ${receiver.id}`);
    return transaction;
  } catch (error) {
    logger.error(`Error creating transaction: ${error.message}`);
    throw error;
  }
};

const getTransactionById = async (transactionId, userId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      senderWallet: {
        include: {
          user: {
            select: {
              id: true,
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
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Check if user has access to this transaction
  if (userId && 
      transaction.senderWallet.userId !== userId && 
      transaction.receiverWallet.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  return transaction;
};

const getUserTransactions = async (userId, filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // Get user's wallet
  const wallet = await walletService.getWalletByUserId(userId);

  const where = {};

  // Filter by transaction type
  if (filters.type === 'sent') {
    where.senderWalletId = wallet.id;
  } else if (filters.type === 'received') {
    where.receiverWalletId = wallet.id;
  } else {
    where.OR = [
      { senderWalletId: wallet.id },
      { receiverWalletId: wallet.id },
    ];
  }

  // Additional filters
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      include: {
        senderWallet: {
          include: {
            user: {
              select: {
                id: true,
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
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getAllTransactions = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.minAmount || filters.maxAmount) {
    where.amount = {};
    if (filters.minAmount) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount) {
      where.amount.lte = filters.maxAmount;
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      include: {
        senderWallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        receiverWallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getTransactionStats = async (walletId, period = 'month') => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  const [sent, received] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        senderWalletId: walletId,
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: {
        receiverWalletId: walletId,
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return {
    period,
    sent: {
      total: sent._sum.amount || 0,
      count: sent._count.id,
    },
    received: {
      total: received._sum.amount || 0,
      count: received._count.id,
    },
  };
};

module.exports = {
  createTransaction,
  getTransactionById,
  getUserTransactions,
  getAllTransactions,
  getTransactionStats,
}; 