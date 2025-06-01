const transactionService = require('../services/transaction.service');
const walletService = require('../services/wallet.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const createTransaction = async (req, res, next) => {
  try {
    const { receiverEmail, amount, description, currency } = req.body;
    const senderId = req.user.id;

    // Create transaction
    const transaction = await transactionService.createTransaction(
      senderId,
      receiverEmail,
      amount,
      description,
      currency
    );

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, status, type, startDate, endDate } = req.query;

    const filters = {
      ...(status && { status }),
      ...(type && { type }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };

    const result = await transactionService.getUserTransactions(
      userId,
      filters,
      pagination
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await transactionService.getTransactionById(id, userId);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { page, limit, status, minAmount, maxAmount, startDate, endDate } = req.query;

    const filters = {
      ...(status && { status }),
      ...(minAmount && { minAmount: parseFloat(minAmount) }),
      ...(maxAmount && { maxAmount: parseFloat(maxAmount) }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await transactionService.getAllTransactions(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period } = req.query;

    // Get user's wallet
    const wallet = await walletService.getWalletByUserId(userId);

    const stats = await transactionService.getTransactionStats(wallet.id, period);

    res.json({
      success: true,
      data: {
        ...stats,
        currentBalance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  getAllTransactions,
  getTransactionStats,
}; 