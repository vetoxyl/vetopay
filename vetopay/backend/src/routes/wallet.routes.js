const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         balance:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, FROZEN]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/wallets/me:
 *   get:
 *     summary: Get current user's wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 */
router.get('/me', authenticate, walletController.getMyWallet);

/**
 * @swagger
 * /api/wallets/me/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Wallets]
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
 *         description: List of transactions
 */
router.get('/me/transactions', authenticate, walletController.getWalletTransactions);

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: Get all wallets (Admin only)
 *     tags: [Wallets]
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
 *           enum: [ACTIVE, SUSPENDED, FROZEN]
 *     responses:
 *       200:
 *         description: List of wallets
 */
router.get('/', authenticate, authorize('ADMIN'), walletController.getAllWallets);

/**
 * @swagger
 * /api/wallets/{id}:
 *   get:
 *     summary: Get wallet by ID (Admin only)
 *     tags: [Wallets]
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
 *         description: Wallet details
 */
router.get('/:id', authenticate, authorize('ADMIN'), walletController.getWalletById);

/**
 * @swagger
 * /api/wallets/{id}/suspend:
 *   post:
 *     summary: Suspend wallet (Admin only)
 *     tags: [Wallets]
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
 *         description: Wallet suspended
 */
router.post('/:id/suspend', authenticate, authorize('ADMIN'), walletController.suspendWallet);

/**
 * @swagger
 * /api/wallets/{id}/activate:
 *   post:
 *     summary: Activate wallet (Admin only)
 *     tags: [Wallets]
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
 *         description: Wallet activated
 */
router.post('/:id/activate', authenticate, authorize('ADMIN'), walletController.activateWallet);

/**
 * @swagger
 * /api/wallets/{id}/freeze:
 *   post:
 *     summary: Freeze wallet (Admin only)
 *     tags: [Wallets]
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
 *         description: Wallet frozen
 */
router.post('/:id/freeze', authenticate, authorize('ADMIN'), walletController.freezeWallet);

module.exports = router; 