const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
        status: 'UNREAD',
      },
    });

    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const result = await prisma.notification.createMany({
      data: notifications.map(n => ({
        ...n,
        status: 'UNREAD',
      })),
    });

    logger.info(`${result.count} bulk notifications created`);
    return result;
  } catch (error) {
    logger.error(`Error creating bulk notifications: ${error.message}`);
    throw error;
  }
};

const getUserNotifications = async (userId, filters = {}, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
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

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getNotificationById = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new Error('Access denied');
  }

  return notification;
};

const markAsRead = async (notificationId, userId) => {
  const notification = await getNotificationById(notificationId, userId);

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  return updated;
};

const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      status: 'UNREAD',
    },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  logger.info(`${result.count} notifications marked as read for user ${userId}`);
  return result;
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await getNotificationById(notificationId, userId);

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  logger.info(`Notification ${notificationId} deleted by user ${userId}`);
};

const deleteOldNotifications = async (daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      status: 'READ',
    },
  });

  logger.info(`Deleted ${result.count} old notifications`);
  return result;
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      status: 'UNREAD',
    },
  });

  return count;
};

const sendSystemNotification = async (title, message, userFilter = {}) => {
  // Get all users based on filter
  const users = await prisma.user.findMany({
    where: userFilter,
    select: { id: true },
  });

  const notifications = users.map(user => ({
    userId: user.id,
    type: 'SYSTEM',
    title,
    message,
  }));

  return await createBulkNotifications(notifications);
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteOldNotifications,
  getUnreadCount,
  sendSystemNotification,
}; 