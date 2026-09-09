import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { 
  createDeck, 
  createCardsForDeck, 
  getAllDecks, 
  getAllCards, 
  getDeckWithCards,
  deleteCardsByDeckId,
  deleteDeckById
} from './db/queries';
import { decksTable, cardsTable } from './db/schema';
import * as schema from './db/schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

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
  const indonesianDeckData = {
    userId: 'user_clerk_123', // This would come from Clerk in a real app
    title: 'Basic Indonesian Vocabulary',
    description: 'Learn common Indonesian words and phrases',
  };

  const createdDeck = await createDeck(indonesianDeckData);
  console.log('New deck created:', createdDeck);

  // Add some cards to the Indonesian deck
  const indonesianCards = [
    {
      front: 'Dog',
      back: 'Anjing',
      position: 1,
    },
    {
      front: 'Cat',
      back: 'Kucing',
      position: 2,
    },
    {
      front: 'Hello',
      back: 'Halo',
      position: 3,
    },
  ];

  await createCardsForDeck(createdDeck.id, indonesianCards);
  console.log('Indonesian vocabulary cards created!');

  // Example: Create a deck for British history
  const historyDeckData = {
    userId: 'user_clerk_123',
    title: 'British History Quiz',
    description: 'Test your knowledge of important British historical events',
  };

  const createdHistoryDeck = await createDeck(historyDeckData);
  console.log('History deck created:', createdHistoryDeck);

  // Add history cards
  const historyCards = [
    {
      front: 'When was the Battle of Hastings?',
      back: '1066',
      position: 1,
    },
    {
      front: 'Who was the first Tudor monarch?',
      back: 'Henry VII',
      position: 2,
    },
  ];

  await createCardsForDeck(createdHistoryDeck.id, historyCards);
  console.log('History cards created!');

  // Query all decks
  const allDecks = await getAllDecks();
  console.log('All decks:', allDecks);

  // Query all cards
  const allCards = await getAllCards();
  console.log('All cards:', allCards);

  // Show deck and card relationships using manual join query
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

  // Clean up example data (optional - remove this in production)
  await deleteCardsByDeckId(createdDeck.id);
  await deleteCardsByDeckId(createdHistoryDeck.id);
  await deleteDeckById(createdDeck.id);
  await deleteDeckById(createdHistoryDeck.id);
  console.log('Example data cleaned up!');
}

main();