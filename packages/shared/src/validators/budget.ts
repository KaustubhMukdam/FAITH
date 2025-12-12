import { z } from 'zod';
import { BudgetCategory } from '../types/Budget';

export const BudgetAllocationSchema = z.object({
  category: z.nativeEnum(BudgetCategory),
  allocatedAmount: z.number().positive(),
  rolloverPercentage: z.number().min(0).max(100).default(0),
  alertThreshold: z.number().min(0).max(100).default(85),
});

export const BudgetCreateSchema = z.object({
  userId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  totalAmount: z.number().positive('Total amount must be positive'),
  allocations: z.array(BudgetAllocationSchema).min(1, 'At least one allocation required'),
  rolloverEnabled: z.boolean().default(true),
});
