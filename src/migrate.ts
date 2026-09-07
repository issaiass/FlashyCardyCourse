import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  try {
    console.log('🚀 Starting flashcard schema migration...');
    
    // Execute the complete migration using template literals
    console.log('📋 Creating decks table...');
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
    console.log('✅ Decks table created successfully');
    
    console.log('📋 Creating cards table...');
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
    console.log('✅ Cards table created successfully');
    
    console.log('📋 Creating performance indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(deck_id, position);`;
    console.log('✅ Indexes created successfully');
    
    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   - ✅ Created "decks" table for organizing flashcard collections');
    console.log('   - ✅ Created "cards" table for individual flashcards');
    console.log('   - ✅ Set up foreign key relationship (cards belong to decks)');
    console.log('   - ✅ Added indexes for better query performance');
    console.log('   - ✅ Configured cascade delete (deleting deck removes all cards)');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}