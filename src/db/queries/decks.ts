import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { CreateDeckInput, UpdateDeckInput } from '@/lib/validations';

// Type for deck with card count
export type DeckWithCardCount = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  cardCount: number;
};

// READ OPERATIONS

/**
 * Get all decks for a specific user
 */
export async function getUserDecks(userId: string) {
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Get all decks for a specific user with card counts
 */
export async function getUserDecksWithCardCounts(userId: string): Promise<DeckWithCardCount[]> {
  const result = await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    userId: decksTable.userId,
    cardCount: sql<number>`count(${cardsTable.id})`.as('cardCount')
  })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(desc(decksTable.createdAt));

  // Convert the count from string to number if needed
  return result.map(deck => ({
    ...deck,
    cardCount: Number(deck.cardCount) || 0
  }));
}

/**
 * Get a single deck by ID for a specific user
 */
export async function getUserDeckById(deckId: string, userId: string) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ));
  
  return deck || null;
}

/**
 * Get a deck with all its cards for a specific user
 */
export async function getDeckWithCards(deckId: string, userId: string) {
  return await db.select({
    deck: decksTable,
    card: cardsTable
  })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(and(
      eq(decksTable.id, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ))
    .orderBy(cardsTable.position);
}

// CREATE OPERATIONS

/**
 * Create a new deck for a user
 */
export async function createDeckForUser(userId: string, data: CreateDeckInput) {
  const [newDeck] = await db.insert(decksTable)
    .values({
      ...data,
      userId,
    })
    .returning();
  
  return newDeck;
}

// UPDATE OPERATIONS

/**
 * Update a user's deck
 */
export async function updateUserDeck(deckId: string, userId: string, data: UpdateDeckInput) {
  const [updatedDeck] = await db.update(decksTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(and(
      eq(decksTable.id, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return updatedDeck || null;
}

// DELETE OPERATIONS

/**
 * Delete a user's deck (cascade deletes cards)
 */
export async function deleteUserDeck(deckId: string, userId: string) {
  await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ));
}