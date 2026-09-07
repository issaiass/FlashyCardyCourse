import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { decksTable, cardsTable, decksRelations, cardsRelations } from './db/schema';
import * as schema from './db/schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function main() {
  // Create the flashcard tables if they don't exist
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS decks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        position INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Flashcard tables created or already exist!');
  } catch (error) {
    console.log('Error creating tables:', error);
  }

  // Example: Create a deck for learning Indonesian
  const indonesianDeck: typeof decksTable.$inferInsert = {
    userId: 'user_clerk_123', // This would come from Clerk in a real app
    title: 'Basic Indonesian Vocabulary',
    description: 'Learn common Indonesian words and phrases',
  };

  const [createdDeck] = await db.insert(decksTable).values(indonesianDeck).returning();
  console.log('New deck created:', createdDeck);

  // Add some cards to the Indonesian deck
  const indonesianCards: (typeof cardsTable.$inferInsert)[] = [
    {
      deckId: createdDeck.id,
      front: 'Dog',
      back: 'Anjing',
      position: 1,
    },
    {
      deckId: createdDeck.id,
      front: 'Cat',
      back: 'Kucing',
      position: 2,
    },
    {
      deckId: createdDeck.id,
      front: 'Hello',
      back: 'Halo',
      position: 3,
    },
  ];

  await db.insert(cardsTable).values(indonesianCards);
  console.log('Indonesian vocabulary cards created!');

  // Example: Create a deck for British history
  const historyDeck: typeof decksTable.$inferInsert = {
    userId: 'user_clerk_123',
    title: 'British History Quiz',
    description: 'Test your knowledge of important British historical events',
  };

  const [createdHistoryDeck] = await db.insert(decksTable).values(historyDeck).returning();
  console.log('History deck created:', createdHistoryDeck);

  // Add history cards
  const historyCards: (typeof cardsTable.$inferInsert)[] = [
    {
      deckId: createdHistoryDeck.id,
      front: 'When was the Battle of Hastings?',
      back: '1066',
      position: 1,
    },
    {
      deckId: createdHistoryDeck.id,
      front: 'Who was the first Tudor monarch?',
      back: 'Henry VII',
      position: 2,
    },
  ];

  await db.insert(cardsTable).values(historyCards);
  console.log('History cards created!');

  // Query all decks
  const allDecks = await db.select().from(decksTable);
  console.log('All decks:', allDecks);

  // Query all cards
  const allCards = await db.select().from(cardsTable);
  console.log('All cards:', allCards);

  // Query decks with their cards using relational queries
  try {
    const decksWithCards = await db.query.decksTable.findMany({
      with: {
        cards: true,
      },
    });
    console.log('All decks with cards:', JSON.stringify(decksWithCards, null, 2));
  } catch (error) {
    console.log('Relational query not available, using manual join instead');
    
    // Alternative: Manual query to show deck and card relationships
    const deckCardQuery = await db
      .select({
        deckId: decksTable.id,
        deckTitle: decksTable.title,
        cardId: cardsTable.id,
        cardFront: cardsTable.front,
        cardBack: cardsTable.back,
      })
      .from(decksTable)
      .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId));
    
    console.log('Manual deck-card join:', deckCardQuery);
  }

  // Clean up example data (optional - remove this in production)
  await db.delete(cardsTable).where(eq(cardsTable.deckId, createdDeck.id));
  await db.delete(cardsTable).where(eq(cardsTable.deckId, createdHistoryDeck.id));
  await db.delete(decksTable).where(eq(decksTable.id, createdDeck.id));
  await db.delete(decksTable).where(eq(decksTable.id, createdHistoryDeck.id));
  console.log('Example data cleaned up!');
}

main();