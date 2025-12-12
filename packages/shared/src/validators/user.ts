import { z } from 'zod';

export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  preferences: z.object({
    currency: z.string().optional(),
    language: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
  }).optional(),
});
