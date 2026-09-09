'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createCardForDeck } from '@/db/queries/cards';
import { createCardSchema, type CreateCardInput } from '@/lib/validations';

export async function createCard(deckId: string, data: CreateCardInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = createCardSchema.parse(data);
    const newCard = await createCardForDeck(deckId, userId, validatedData);

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true, card: newCard };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create card' };
  }
}
