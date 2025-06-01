const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    receiverEmail: z.string().email('Invalid receiver email'),
    amount: z.number()
      .positive('Amount must be positive')
      .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
    description: z.string().optional(),
    currency: z.string().default('USD'),
  }),
});

const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    type: z.enum(['sent', 'received', 'all']).optional(),
  }),
});

const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
});

module.exports = {
  createTransactionSchema,
  getTransactionsSchema,
  getTransactionSchema,
}; 