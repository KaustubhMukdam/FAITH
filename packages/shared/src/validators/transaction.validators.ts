import { z } from 'zod';
import { TransactionType, TransactionCategory, PaymentMode } from '../types/transaction.types';

export const TransactionCreateSchema = z.object({
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  paymentMode: z.nativeEnum(PaymentMode),
  date: z.coerce.date(),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  merchant: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
});

export const TransactionUpdateSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(500).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  date: z.coerce.date().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  merchant: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
});

export const TransactionFiltersSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
