import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Registration validation schema
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
});

// Fund wallet validation schema
export const fundWalletSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount cannot exceed 1,000,000')
});

// Transfer funds validation schema
export const transferFundsSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  description: z.string().max(200, 'Description cannot exceed 200 characters')
});

// Withdraw funds validation schema
export const withdrawFundsSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  bankAccount: z.string().min(10, 'Invalid bank account number')
}); 