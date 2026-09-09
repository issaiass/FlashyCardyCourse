import { z } from 'zod';

// Deck validation schemas
export const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional().nullable(),
});

export const updateDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().optional().nullable(),
});

// Card validation schemas
export const createCardSchema = z.object({
  front: z.string().min(1, 'Front text is required'),
  back: z.string().min(1, 'Back text is required'),
  position: z.number().int().min(0).optional(),
});

export const updateCardSchema = z.object({
  front: z.string().min(1, 'Front text is required').optional(),
  back: z.string().min(1, 'Back text is required').optional(),
  position: z.number().int().min(0).optional(),
});

// TypeScript types from Zod schemas
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;