import { db } from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import type { CreateCardInput, UpdateCardInput } from '@/lib/validations';

const RESOURCE_NOT_FOUND = 'Resource not found';

function logOwnershipDenial(operation: string, details: Record<string, unknown>) {
  console.error(`Security: ${operation} denied`, details);
}

function ownedCardIdsForUser(cardId: number, userId: string) {
  return db
    .select({ id: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
}

async function getOwnedDeckId(deckId: number, userId: string) {
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));

  return deck?.id ?? null;
}

async function getOwnedDeckCardMeta(deckId: number, userId: string) {
  return await db
    .select({
      position: cardsTable.position,
      title: cardsTable.title,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.deckId, deckId),
      eq(decksTable.userId, userId)
    ));
}

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
 * Count cards in a deck owned by a user
 */
export async function countCardsForUserDeck(deckId: string, userId: string): Promise<number> {
  const [result] = await db.select({
    count: sql<number>`count(${cardsTable.id})`.as('count'),
  })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.deckId, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ));

  return Number(result?.count ?? 0);
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

// CREATE OPERATIONS

/**
 * Create a new card for a deck (with user ownership verification)
 */
export async function createCardForDeck(deckId: string, userId: string, data: CreateCardInput) {
  try {
    const parsedDeckId = parseInt(deckId);

    const ownedDeckId = await getOwnedDeckId(parsedDeckId, userId);
    if (!ownedDeckId) {
      logOwnershipDenial('createCardForDeck', { deckId, userId });
      throw new Error(RESOURCE_NOT_FOUND);
    }

    const existingCards = await getOwnedDeckCardMeta(parsedDeckId, userId);

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
    if (error instanceof Error && error.message === RESOURCE_NOT_FOUND) {
      throw error;
    }
    console.error('Database error creating card:', error);
    throw new Error('Failed to create card');
  }
}

/**
 * Create multiple cards for a user-owned deck
 */
export async function createCardsForUserDeck(
  deckId: string,
  userId: string,
  cards: Array<{ front: string; back: string }>
) {
  try {
    const parsedDeckId = parseInt(deckId);

    const ownedDeckId = await getOwnedDeckId(parsedDeckId, userId);
    if (!ownedDeckId) {
      logOwnershipDenial('createCardsForUserDeck', { deckId, userId });
      throw new Error(RESOURCE_NOT_FOUND);
    }

    const existingCards = await getOwnedDeckCardMeta(parsedDeckId, userId);

    let lastPosition = existingCards.reduce(
      (max, card) => (card.position > max ? card.position : max),
      0
    );
    const titles = existingCards.map((card) => card.title);

    const values = cards.map((card) => {
      const title = getNextDefaultCardTitle(titles);
      titles.push(title);
      lastPosition += 1;

      return {
        title,
        front: card.front,
        back: card.back,
        deckId: parsedDeckId,
        position: lastPosition,
      };
    });

    const insertCards = async () => {
      return await db.insert(cardsTable)
        .values(values)
        .returning();
    };

    try {
      return await insertCards();
    } catch (insertError) {
      if (!isCardsPrimaryKeyConflict(insertError)) {
        throw insertError;
      }

      await syncCardsIdSequence();
      return await insertCards();
    }
  } catch (error) {
    if (error instanceof Error && error.message === RESOURCE_NOT_FOUND) {
      throw error;
    }
    console.error('Database error creating cards:', error);
    throw new Error('Failed to create cards');
  }
}

// UPDATE OPERATIONS

/**
 * Update a user's card
 */
export async function updateUserCard(cardId: string, userId: string, data: UpdateCardInput) {
  const parsedCardId = parseInt(cardId);
  const [updatedCard] = await db.update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(inArray(cardsTable.id, ownedCardIdsForUser(parsedCardId, userId)))
    .returning();

  if (!updatedCard) {
    logOwnershipDenial('updateUserCard', { cardId, userId });
    throw new Error(RESOURCE_NOT_FOUND);
  }

  return updatedCard;
}

// DELETE OPERATIONS

/**
 * Delete a user's card
 */
export async function deleteUserCard(cardId: string, userId: string) {
  const parsedCardId = parseInt(cardId);
  const [deletedCard] = await db.delete(cardsTable)
    .where(inArray(cardsTable.id, ownedCardIdsForUser(parsedCardId, userId)))
    .returning({ id: cardsTable.id });

  if (!deletedCard) {
    logOwnershipDenial('deleteUserCard', { cardId, userId });
    throw new Error(RESOURCE_NOT_FOUND);
  }
}

/**
 * Delete selected cards that belong to a user's deck
 */
export async function deleteUserCards(cardIds: string[], deckId: string, userId: string) {
  const uniqueIds = [...new Set(cardIds.map((id) => parseInt(id, 10)))];
  const parsedDeckId = parseInt(deckId);

  const ownedCardIds = db
    .select({ id: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.deckId, parsedDeckId),
      eq(decksTable.userId, userId),
      inArray(cardsTable.id, uniqueIds)
    ));

  const ownedCards = await ownedCardIds;

  if (ownedCards.length !== uniqueIds.length) {
    logOwnershipDenial('deleteUserCards', { deckId, userId });
    throw new Error(RESOURCE_NOT_FOUND);
  }

  await db.delete(cardsTable)
    .where(inArray(cardsTable.id, ownedCardIds));

  return ownedCards.length;
}