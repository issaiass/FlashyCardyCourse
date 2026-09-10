'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createDeckForUser, deleteUserDeck, updateUserDeck } from '@/db/queries/decks';
import {
  createDeckSchema,
  deleteDeckSchema,
  updateDeckSchema,
  type CreateDeckInput,
  type DeleteDeckInput,
  type UpdateDeckInput,
} from '@/lib/validations';

export async function createDeck(data: CreateDeckInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = createDeckSchema.parse(data);
    const newDeck = await createDeckForUser(userId, validatedData);

    revalidatePath('/dashboard');

    return { success: true, deck: newDeck };
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
    return { success: false, error: 'Failed to create deck' };
  }
}

export async function updateDeck(deckId: string, data: UpdateDeckInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = updateDeckSchema.parse(data);
    const updatedDeck = await updateUserDeck(deckId, userId, validatedData);

    if (!updatedDeck) {
      throw new Error('Resource not found');
    }

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true, deck: updatedDeck };
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
    return { success: false, error: 'Failed to update deck' };
  }
}

export async function deleteDeck(data: DeleteDeckInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const { deckId } = deleteDeckSchema.parse(data);
    await deleteUserDeck(deckId, userId);

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      };
    }
    if (error instanceof Error) {
      if (error.message === 'Deck not found or access denied') {
        return { success: false, error: 'Resource not found' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete deck' };
  }
}