'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createDeckForUser } from '@/db/queries/decks';
import { createDeckSchema, type CreateDeckInput } from '@/lib/validations';

export async function createDeck(data: CreateDeckInput) {
  try {
    // Get current user
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Validate input with Zod
    const validatedData = createDeckSchema.parse(data);

    // Create deck using query helper
    const newDeck = await createDeckForUser(userId, validatedData);

    // Revalidate dashboard to show the new deck
    revalidatePath('/dashboard');

    return { success: true, deck: newDeck };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create deck' };
  }
}