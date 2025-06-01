const walletService = require('../services/wallet.service');
const auditService = require('../services/audit.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const getMyWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletByUserId(userId);

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

const getWalletTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, status, startDate, endDate } = req.query;

    const wallet = await walletService.getWalletByUserId(userId);

    const filters = {
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };

    const result = await walletService.getWalletTransactions(
      wallet.id,
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

const getAllWallets = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const filters = {
      ...(status && { status }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await walletService.getAllWallets(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWalletById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wallet = await walletService.getWalletById(id);

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

const suspendWallet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const wallet = await walletService.suspendWallet(id);

    // Log audit
    await auditService.log({
      userId: adminId,
      action: 'WALLET_SUSPENDED',
      entity: 'Wallet',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Wallet suspended successfully',
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

const activateWallet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const wallet = await walletService.activateWallet(id);

    // Log audit
    await auditService.log({
      userId: adminId,
      action: 'WALLET_ACTIVATED',
      entity: 'Wallet',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Wallet activated successfully',
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

const freezeWallet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const wallet = await walletService.freezeWallet(id);

    // Log audit
    await auditService.log({
      userId: adminId,
      action: 'WALLET_FROZEN',
      entity: 'Wallet',
      entityId: id,
      metadata: { reason: req.body.reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Wallet frozen successfully',
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWallet,
  getWalletTransactions,
  getAllWallets,
  getWalletById,
  suspendWallet,
  activateWallet,
  freezeWallet,
}; 