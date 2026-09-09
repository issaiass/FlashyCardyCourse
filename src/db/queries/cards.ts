import { db } from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateCardInput, UpdateCardInput } from '@/lib/validations';

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
    .orderBy(cardsTable.position);
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
  // First verify the user owns the deck
  const [deckOwnership] = await db.select({ id: decksTable.id })
    .from(decksTable)
    .where(and(
      eq(decksTable.id, parseInt(deckId)),
      eq(decksTable.userId, userId)
    ));
  
  if (!deckOwnership) {
    throw new Error('Deck not found or access denied');
  }
  
  // Get the next position if not provided
  let position = data.position;
  if (!position) {
    const [lastCard] = await db.select({ position: cardsTable.position })
      .from(cardsTable)
      .where(eq(cardsTable.deckId, parseInt(deckId)))
      .orderBy(desc(cardsTable.position))
      .limit(1);
    
    position = lastCard ? lastCard.position + 1 : 1;
  }
  
  const [newCard] = await db.insert(cardsTable)
    .values({
      ...data,
      deckId: parseInt(deckId),
      position
    })
    .returning();
  
  return newCard;
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