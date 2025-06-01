const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         suspended:
 *                           type: integer
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         volume:
 *                           type: number
 *                         pending:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                     wallets:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalBalance:
 *                           type: number
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
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
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/system-health:
 *   get:
 *     summary: Get system health status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 */
router.get('/system-health', adminController.getSystemHealth);

/**
 * @swagger
 * /api/admin/reports/transactions:
 *   get:
 *     summary: Generate transaction report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Transaction report
 */
router.get('/reports/transactions', adminController.getTransactionReport);

/**
 * @swagger
 * /api/admin/maintenance/cleanup:
 *   post:
 *     summary: Run cleanup tasks
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cleanupOldAuditLogs:
 *                 type: boolean
 *               cleanupOldNotifications:
 *                 type: boolean
 *               cleanupExpiredTokens:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cleanup results
 */
router.post('/maintenance/cleanup', adminController.runCleanup);

/**
 * @swagger
 * /api/admin/seed:
 *   post:
 *     summary: Seed initial admin user (only works if no admin exists)
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Admin user created
 *       409:
 *         description: Admin user already exists
 */
router.post('/seed', adminController.seedAdmin);

module.exports = router; 