const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Validation schemas
const transferSchema = z.object({
  toUserId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().optional()
});

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      balance: wallet.balance,
      currency: wallet.currency
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Error fetching wallet balance' });
  }
});

// Transfer funds
router.post('/transfer', authenticateToken, validateRequest(transferSchema), async (req, res) => {
  try {
    const { toUserId, amount, description } = req.body;
    const fromUserId = req.user.userId;

    // Check if sender has sufficient balance
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: fromUserId }
    });

    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: toUserId }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Perform transfer in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type: 'TRANSFER',
          status: 'PENDING',
          fromUserId,
          toUserId,
          description
        }
      });

      // Update sender's balance
      await prisma.wallet.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: amount } }
      });

      // Update recipient's balance
      await prisma.wallet.update({
        where: { userId: toUserId },
        data: { balance: { increment: amount } }
      });

      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      // Create notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: fromUserId,
            title: 'Transfer Sent',
            message: `You sent ${amount} ${senderWallet.currency} to ${recipient.firstName} ${recipient.lastName}`
          },
          {
            userId: toUserId,
            title: 'Transfer Received',
            message: `You received ${amount} ${senderWallet.currency} from ${req.user.firstName} ${req.user.lastName}`
          }
        ]
      });

      return transaction;
    });

    res.json({
      message: 'Transfer successful',
      transaction: result
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Error processing transfer' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: req.user.userId },
          { toUserId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        toUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Error fetching transaction history' });
  }
});

module.exports = router; 