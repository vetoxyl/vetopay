const notificationService = require('../services/notification.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const getNotifications = async (req, res, next) => {
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
      limit: parseInt(limit) || 20,
    };

    const result = await notificationService.getUserNotifications(
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

const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.getNotificationById(id, userId);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

const sendSystemNotification = async (req, res, next) => {
  try {
    const { title, message, userFilter } = req.body;

    const result = await notificationService.sendSystemNotification(
      title,
      message,
      userFilter
    );

    logger.info(`System notification sent: ${title} - ${result.count} recipients`);

    res.json({
      success: true,
      message: `System notification sent to ${result.count} users`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendSystemNotification,
}; 