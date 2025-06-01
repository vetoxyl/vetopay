const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

const createWallet = async (userId) => {
  try {
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'USD',
        status: 'ACTIVE',
      },
    });

    logger.info(`Wallet created for user: ${userId}`);
    return wallet;
  } catch (error) {
    logger.error(`Error creating wallet for user ${userId}: ${error.message}`);
    throw error;
  }
};

const getWalletByUserId = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
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
  });

  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  return wallet;
};

const getWalletById = async (id) => {
  const wallet = await prisma.wallet.findUnique({
    where: { id },
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
  });

  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  return wallet;
};

const updateWalletBalance = async (walletId, amount, operation = 'add') => {
  const wallet = await getWalletById(walletId);
  
  let newBalance;
  if (operation === 'add') {
    newBalance = parseFloat(wallet.balance) + amount;
  } else if (operation === 'subtract') {
    newBalance = parseFloat(wallet.balance) - amount;
    if (newBalance < 0) {
      throw new AppError('Insufficient funds', 400);
    }
  } else {
    throw new AppError('Invalid operation', 400);
  }

  const updatedWallet = await prisma.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance },
  });

  logger.info(`Wallet ${walletId} balance updated: ${operation} ${amount}. New balance: ${newBalance}`);
  return updatedWallet;
};

const checkBalance = async (walletId, amount) => {
  const wallet = await getWalletById(walletId);
  return parseFloat(wallet.balance) >= amount;
};

const suspendWallet = async (walletId) => {
  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: { status: 'SUSPENDED' },
  });

  logger.warn(`Wallet ${walletId} suspended`);
  return wallet;
};

const activateWallet = async (walletId) => {
  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: { status: 'ACTIVE' },
  });

  logger.info(`Wallet ${walletId} activated`);
  return wallet;
};

const freezeWallet = async (walletId) => {
  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: { status: 'FROZEN' },
  });

  logger.warn(`Wallet ${walletId} frozen`);
  return wallet;
};

const getWalletTransactions = async (walletId, filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { senderWalletId: walletId },
      { receiverWalletId: walletId },
    ],
  };

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

const getAllWallets = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
  }

  const [wallets, total] = await Promise.all([
    prisma.wallet.findMany({
      where,
      skip,
      take: limit,
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wallet.count({ where }),
  ]);

  return {
    wallets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createWallet,
  getWalletByUserId,
  getWalletById,
  updateWalletBalance,
  checkBalance,
  suspendWallet,
  activateWallet,
  freezeWallet,
  getWalletTransactions,
  getAllWallets,
}; 