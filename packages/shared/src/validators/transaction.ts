import { z } from 'zod';
import { TransactionCategory, TransactionType, TransactionSource } from '../types/Transaction';

export const TransactionCreateSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  category: z.nativeEnum(TransactionCategory),
  merchant: z.string().optional(),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(TransactionType),
  source: z.nativeEnum(TransactionSource),
  timestamp: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});
