import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateDeckInput, UpdateDeckInput } from '@/lib/validations';

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

/**
 * Get all decks (no user filter) - for system operations only
 */
export async function getAllDecks() {
  return await db.select()
    .from(decksTable)
    .orderBy(desc(decksTable.createdAt));
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

/**
 * Create a deck with a specific user ID (for seeding/testing)
 */
export async function createDeck(deckData: typeof decksTable.$inferInsert) {
  const [newDeck] = await db.insert(decksTable)
    .values(deckData)
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

/**
 * Delete deck by ID (no user filter) - for system operations only
 */
export async function deleteDeckById(deckId: number) {
  await db.delete(decksTable)
    .where(eq(decksTable.id, deckId));
}