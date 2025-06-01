const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const walletService = require('../services/wallet.service');
const emailService = require('../services/email.service');
const auditService = require('../services/audit.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'USER' } = req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    // Create wallet for user
    await walletService.createWallet(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user.id);

    // Save refresh token
    await authService.saveRefreshToken(user.id, refreshToken);

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    // Log audit
    await auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user.id);

    // Save refresh token
    await authService.saveRefreshToken(user.id, refreshToken);

    // Log audit
    await auditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const storedToken = await authService.getRefreshToken(refreshToken);
    if (!storedToken || storedToken.userId !== decoded.userId) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await authService.generateTokens(decoded.userId);

    // Delete old refresh token and save new one
    await authService.deleteRefreshToken(refreshToken);
    await authService.saveRefreshToken(decoded.userId, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Delete all refresh tokens for the user
        await authService.deleteUserRefreshTokens(decoded.userId);
        
        // Log audit
        await auditService.log({
          userId: decoded.userId,
          action: 'USER_LOGOUT',
          entity: 'User',
          entityId: decoded.userId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      } catch (error) {
        // Token might be invalid, but we still want to respond with success
        logger.warn('Invalid token on logout attempt');
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Get user
    const user = await userService.getUserByEmail(email);
    
    // Don't reveal if user exists or not
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token (you might want to add these fields to the User model)
    await userService.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry,
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    // Log audit
    await auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await userService.getUserByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await userService.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, user.firstName);

    // Log audit
    await auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
}; 