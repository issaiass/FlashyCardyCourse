'use server';

import { auth } from '@clerk/nextjs/server';
import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { countCardsForUserDeck, createCardForDeck, createCardsForUserDeck, deleteUserCard, deleteUserCards, updateUserCard } from '@/db/queries/cards';
import { getUserDeckById } from '@/db/queries/decks';
import { AI_GENERATED_CARD_COUNT, FREE_CARD_LIMIT } from '@/lib/billing';
import {
  createCardSchema,
  deleteCardSchema,
  deleteCardsSchema,
  generateCardsWithAISchema,
  updateCardSchema,
  type CreateCardInput,
  type DeleteCardInput,
  type DeleteCardsInput,
  type GenerateCardsWithAIInput,
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

export async function generateCardsWithAI(data: GenerateCardsWithAIInput) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const canUseAi =
      has({ feature: 'ai_flashcard_generation' }) || has({ plan: 'paid_user' });
    if (!canUseAi) {
      throw new Error('Feature not available');
    }

    const { deckId } = generateCardsWithAISchema.parse(data);
    const deck = await getUserDeckById(deckId, userId);
    if (!deck) {
      throw new Error('Resource not found');
    }

    const title = deck.title.trim();
    const description = deck.description?.trim() ?? '';
    if (!title || !description) {
      throw new Error('Add a title and description to this deck before generating cards with AI.');
    }

    const cardCount = AI_GENERATED_CARD_COUNT;

    const { output } = await generateText({
      model: openai('gpt-5-nano'),
      output: Output.object({
        schema: z.object({
          cards: z
            .array(
              z.object({
                front: z.string().min(1),
                back: z.string().min(1),
              }),
            )
            .length(cardCount),
        }),
      }),
      prompt: `Generate exactly ${cardCount} unique flashcards for this deck.

Use only the deck title and description as context. Infer subject, scope, difficulty, and the most useful front/back format from that text alone. Do not assume a topic, language, exam, or card style that the title and description do not support. Do not invent or reuse card content that is not implied by this context.

Deck title: ${title}
Deck description: ${description}

Each card must be study-ready:
- Front: one cue the learner sees first (term, prompt, or question) in the format the context implies.
- Back: the matching recall target (definition, answer, or equivalent). Keep it concise and complete. Add a brief explanation only when it helps recall.
- Stay within the stated subject. Do not pad with unrelated examples.
- Do not number cards, wrap the entire front or back in quotation marks, or use markdown.`,
    });

    if (!output?.cards) {
      throw new Error('Failed to generate cards');
    }

    const newCards = await createCardsForUserDeck(deckId, userId, output.cards);

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true, cards: newCards };
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
    return { success: false, error: 'Failed to generate cards' };
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

export async function deleteCards(data: DeleteCardsInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const { cardIds, deckId } = deleteCardsSchema.parse(data);
    const deletedCount = await deleteUserCards(cardIds, deckId, userId);

    revalidatePath('/dashboard');
    revalidatePath(`/decks/${deckId}`);

    return { success: true, deletedCount };
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
    return { success: false, error: 'Failed to delete cards' };
  }
}
