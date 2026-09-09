import { db } from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { CreateCardInput, UpdateCardInput } from '@/lib/validations';

function isCardsPrimaryKeyConflict(error: unknown): boolean {
  const candidates = [error];
  if (error instanceof Error && 'cause' in error) {
    candidates.push(error.cause);
  }

  return candidates.some((candidate) => {
    if (!candidate || typeof candidate !== 'object') {
      return false;
    }

    const { code, constraint } = candidate as {
      code?: string;
      constraint?: string;
    };

    return code === '23505' && (!constraint || constraint === 'cards_pkey');
  });
}

async function syncCardsIdSequence() {
  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('cards', 'id'),
      COALESCE((SELECT MAX(${cardsTable.id}) FROM ${cardsTable}), 1),
      true
    )
  `);
}

function getNextDefaultCardTitle(titles: Array<string | null>): string {
  const usedNumbers = new Set<number>();

  for (const title of titles) {
    const match = title?.trim().match(/^Card(\d+)$/);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  }

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `Card${nextNumber}`;
}

// READ OPERATIONS

/**
 * Get all cards for a specific deck (with user ownership verification)
 */
export async function getCardsByDeck(deckId: string, userId: string) {
  return await db.select({
    card: cardsTable,
    deck: {
      id: decksTable.id,
      userId: decksTable.userId,
      title: decksTable.title
    }
  })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.deckId, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Get a single card by ID (with user ownership verification)
 */
export async function getUserCardById(cardId: string, userId: string) {
  const [result] = await db.select({
    card: cardsTable,
    deck: {
      id: decksTable.id,
      userId: decksTable.userId,
      title: decksTable.title
    }
  })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, parseInt(cardId)),
      eq(decksTable.userId, userId)
    ));
  
  return result || null;
}

/**
 * Get all cards (no user filter) - for system operations only
 */
export async function getAllCards() {
  return await db.select()
    .from(cardsTable)
    .orderBy(cardsTable.deckId, cardsTable.position);
}

/**
 * Get cards for a deck (no user filter) - for system operations only
 */
export async function getCardsByDeckId(deckId: number) {
  return await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.position);
}

// CREATE OPERATIONS

/**
 * Create a new card for a deck (with user ownership verification)
 */
export async function createCardForDeck(deckId: string, userId: string, data: CreateCardInput) {
  try {
    const parsedDeckId = parseInt(deckId);

    // First verify the user owns the deck
    const [deckOwnership] = await db.select({ id: decksTable.id })
      .from(decksTable)
      .where(and(
        eq(decksTable.id, parsedDeckId),
        eq(decksTable.userId, userId)
      ));

    if (!deckOwnership) {
      throw new Error('Deck not found or access denied');
    }

    const existingCards = await db.select({
      position: cardsTable.position,
      title: cardsTable.title,
    })
      .from(cardsTable)
      .where(eq(cardsTable.deckId, parsedDeckId));

    // Get the next position if not provided
    let position = data.position;
    if (position === undefined) {
      const lastPosition = existingCards.reduce(
        (max, card) => (card.position > max ? card.position : max),
        0
      );
      position = lastPosition + 1;
    }

    const title = data.title?.trim() || getNextDefaultCardTitle(existingCards.map((card) => card.title));

    const insertCard = async () => {
      const [newCard] = await db.insert(cardsTable)
        .values({
          title,
          front: data.front,
          back: data.back,
          deckId: parsedDeckId,
          position
        })
        .returning();

      return newCard;
    };

    try {
      return await insertCard();
    } catch (insertError) {
      // Identity/serial sequences can fall behind existing IDs after seed data
      // or schema pushes, causing duplicate primary key errors on insert.
      if (!isCardsPrimaryKeyConflict(insertError)) {
        throw insertError;
      }

      await syncCardsIdSequence();
      return await insertCard();
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Deck not found or access denied') {
      throw error;
    }
    console.error('Database error creating card:', error);
    throw new Error('Failed to create card');
  }
}

/**
 * Create a card with specific data (for seeding/testing)
 */
export async function createCard(cardData: typeof cardsTable.$inferInsert) {
  const [newCard] = await db.insert(cardsTable)
    .values(cardData)
    .returning();
  
  return newCard;
}

/**
 * Create multiple cards for a deck (for seeding/testing)
 */
export async function createCardsForDeck(deckId: number, cardsData: Array<Omit<typeof cardsTable.$inferInsert, 'deckId'>>) {
  const cardsWithDeckId = cardsData.map(card => ({
    ...card,
    deckId
  }));
  
  await db.insert(cardsTable)
    .values(cardsWithDeckId);
}

// UPDATE OPERATIONS

/**
 * Update a user's card
 */
export async function updateUserCard(cardId: string, userId: string, data: UpdateCardInput) {
  // First verify the user owns the card through deck ownership
  const ownership = await getUserCardById(cardId, userId);
  if (!ownership) {
    throw new Error('Card not found or access denied');
  }
  
  const [updatedCard] = await db.update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(cardsTable.id, parseInt(cardId)))
    .returning();
  
  return updatedCard || null;
}

// DELETE OPERATIONS

/**
 * Delete a user's card
 */
export async function deleteUserCard(cardId: string, userId: string) {
  // First verify the user owns the card through deck ownership
  const ownership = await getUserCardById(cardId, userId);
  if (!ownership) {
    throw new Error('Card not found or access denied');
  }
  
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, parseInt(cardId)));
}

/**
 * Delete all cards for a specific deck (no user filter) - for system operations only
 */
export async function deleteCardsByDeckId(deckId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}

/**
 * Delete card by ID (no user filter) - for system operations only
 */
export async function deleteCardById(cardId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}