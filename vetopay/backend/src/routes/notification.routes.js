const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [TRANSACTION, SYSTEM, SECURITY, ACCOUNT]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [UNREAD, READ]
 *         readAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UNREAD, READ]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [TRANSACTION, SYSTEM, SECURITY, ACCOUNT]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification details
 */
router.get('/:id', authenticate, notificationController.getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/mark-all-read', authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/send-system:
 *   post:
 *     summary: Send system notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userFilter:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [USER, VENDOR, ADMIN]
 *                   isActive:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: System notification sent
 */
router.post(
  '/send-system',
  authenticate,
  authorize('ADMIN'),
  notificationController.sendSystemNotification
);

module.exports = router; 