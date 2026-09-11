'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { countCardsForUserDeck, createCardForDeck, deleteUserCard, updateUserCard } from '@/db/queries/cards';
import { FREE_CARD_LIMIT } from '@/lib/billing';
import {
  createCardSchema,
  deleteCardSchema,
  updateCardSchema,
  type CreateCardInput,
  type DeleteCardInput,
  type UpdateCardInput,
} from '@/lib/validations';

export async function createCard(deckId: string, data: CreateCardInput) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const isPaid = has({ plan: 'paid_user' });
    if (!isPaid) {
      const cardCount = await countCardsForUserDeck(deckId, userId);
      if (cardCount >= FREE_CARD_LIMIT) {
        return {
          success: false,
          error: `Free plan is limited to ${FREE_CARD_LIMIT} cards per deck. Upgrade to add more.`,
        };
      }
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

export async function updateCard(cardId: string, deckId: string, data: UpdateCardInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = updateCardSchema.parse(data);
    const updatedCard = await updateUserCard(cardId, userId, validatedData);

    if (!updatedCard) {
      throw new Error('Resource not found');
    }

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true, card: updatedCard };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      };
    }
    if (error instanceof Error) {
      if (error.message === 'Card not found or access denied') {
        return { success: false, error: 'Resource not found' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update card' };
  }
}

export async function deleteCard(data: DeleteCardInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const { cardId, deckId } = deleteCardSchema.parse(data);
    await deleteUserCard(cardId, userId);

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
      if (error.message === 'Card not found or access denied') {
        return { success: false, error: 'Resource not found' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete card' };
  }
}
