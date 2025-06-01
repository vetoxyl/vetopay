const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const walletService = require('../services/wallet.service');
const auditService = require('../services/audit.service');
const emailService = require('../services/email.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await userService.getUserById(userId);
    const wallet = await walletService.getWalletByUserId(userId);

    res.json({
      success: true,
      data: {
        ...user,
        wallet: {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          status: wallet.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const updatedUser = await userService.updateUser(userId, updateData);

    // Log audit
    await auditService.log({
      userId,
      action: 'PROFILE_UPDATED',
      entity: 'User',
      entityId: userId,
      metadata: updateData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await userService.getUserByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userService.updateUser(userId, { password: hashedPassword });

    // Send email notification
    await emailService.sendPasswordChangedEmail(user.email, user.firstName);

    // Log audit
    await auditService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, isActive, search } = req.query;

    const filters = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && { search }),
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };

    const result = await userService.getAllUsers(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const wallet = await walletService.getWalletByUserId(id).catch(() => null);

    res.json({
      success: true,
      data: {
        ...user,
        wallet: wallet ? {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          status: wallet.status,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Prevent self-suspension
    if (id === adminId) {
      throw new AppError('Cannot suspend your own account', 400);
    }

    // Suspend user
    await userService.deleteUser(id);

    // Suspend wallet
    const wallet = await walletService.getWalletByUserId(id);
    if (wallet) {
      await walletService.suspendWallet(wallet.id);
    }

    // Log audit
    await auditService.log({
      userId: adminId,
      action: 'USER_SUSPENDED',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Activate user
    await userService.activateUser(id);

    // Activate wallet
    const wallet = await walletService.getWalletByUserId(id);
    if (wallet) {
      await walletService.activateWallet(wallet.id);
    }

    // Log audit
    await auditService.log({
      userId: adminId,
      action: 'USER_ACTIVATED',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'User activated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
}; 