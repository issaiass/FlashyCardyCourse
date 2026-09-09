import { z } from 'zod';

// Deck validation schemas
export const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
});

export const updateDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
});

// Card validation schemas
export const createCardSchema = z.object({
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  position: z.number().int().positive().optional(),
});

export const updateCardSchema = z.object({
  front: z.string().min(1, 'Front content is required').optional(),
  back: z.string().min(1, 'Back content is required').optional(),
  position: z.number().int().positive().optional(),
});

// Type inference from schemas
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;