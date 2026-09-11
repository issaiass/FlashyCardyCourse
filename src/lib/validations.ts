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

export const deleteDeckSchema = z.object({
  deckId: z.string().regex(/^\d+$/, 'Invalid deck'),
});

// Card validation schemas
export const createCardSchema = z.object({
  title: z.string().max(255, 'Title must be less than 255 characters').optional().nullable(),
  front: z.string().min(1, 'Front text is required'),
  back: z.string().min(1, 'Back text is required'),
  position: z.number().int().min(0).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().max(255, 'Title must be less than 255 characters').optional().nullable(),
  front: z.string().min(1, 'Front text is required').optional(),
  back: z.string().min(1, 'Back text is required').optional(),
  position: z.number().int().min(0).optional(),
});

export const deleteCardSchema = z.object({
  cardId: z.string().regex(/^\d+$/, 'Invalid card'),
  deckId: z.string().regex(/^\d+$/, 'Invalid deck'),
});

export const deleteCardsSchema = z.object({
  deckId: z.string().regex(/^\d+$/, 'Invalid deck'),
  cardIds: z.array(z.string().regex(/^\d+$/, 'Invalid card')).min(1, 'Select at least one card'),
});

export const generateCardsWithAISchema = z.object({
  deckId: z.string().regex(/^\d+$/, 'Invalid deck'),
});

// TypeScript types from Zod schemas
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
export type DeleteCardsInput = z.infer<typeof deleteCardsSchema>;
export type GenerateCardsWithAIInput = z.infer<typeof generateCardsWithAISchema>;