import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import {
  createCardsForUserDeck,
  createDeckForUser,
  deleteUserDeck,
  getDeckWithCards,
  getUserDecks,
} from './db/queries';
import { decksTable, cardsTable } from './db/schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
const demoUserId = 'user_clerk_123';

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

  const createdDeck = await createDeckForUser(demoUserId, {
    title: 'Basic Indonesian Vocabulary',
    description: 'Learn common Indonesian words and phrases',
  });
  console.log('New deck created:', createdDeck);

  const indonesianCards = [
    {
      front: 'Dog',
      back: 'Anjing',
    },
    {
      front: 'Cat',
      back: 'Kucing',
    },
    {
      front: 'Hello',
      back: 'Halo',
    },
  ];

  await createCardsForUserDeck(String(createdDeck.id), demoUserId, indonesianCards);
  console.log('Indonesian vocabulary cards created!');

  const createdHistoryDeck = await createDeckForUser(demoUserId, {
    title: 'British History Quiz',
    description: 'Test your knowledge of important British historical events',
  });
  console.log('History deck created:', createdHistoryDeck);

  const historyCards = [
    {
      front: 'When was the Battle of Hastings?',
      back: '1066',
    },
    {
      front: 'Who was the first Tudor monarch?',
      back: 'Henry VII',
    },
  ];

  await createCardsForUserDeck(String(createdHistoryDeck.id), demoUserId, historyCards);
  console.log('History cards created!');

  const userDecks = await getUserDecks(demoUserId);
  console.log('User decks:', userDecks);

  const deckWithCards = await getDeckWithCards(String(createdDeck.id), demoUserId);
  console.log('Owned deck with cards:', deckWithCards);

  const deckCardQuery = await db
    .select({
      deckId: decksTable.id,
      deckTitle: decksTable.title,
      cardId: cardsTable.id,
      cardFront: cardsTable.front,
      cardBack: cardsTable.back,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, demoUserId));

  console.log('User-scoped deck-card join:', deckCardQuery);

  await deleteUserDeck(String(createdDeck.id), demoUserId);
  await deleteUserDeck(String(createdHistoryDeck.id), demoUserId);
  console.log('Example data cleaned up!');
}

main();
