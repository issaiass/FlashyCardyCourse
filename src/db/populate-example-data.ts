import 'dotenv/config';
import { config } from 'dotenv';
import { db } from './index';
import { decksTable, cardsTable } from './schema';

// Load environment variables
config({ path: '.env.local' });

const USER_ID = 'user_3J4AqVWGO4b7DiVFcsHZGTm7Yye';

async function populateExampleData() {
  try {
    console.log('Starting to populate example data...');

    // Create the Spanish Learning Deck
    console.log('Creating Spanish Learning deck...');
    const [spanishDeck] = await db.insert(decksTable).values({
      userId: USER_ID,
      title: 'Learn Spanish - Basic Vocabulary',
      description: 'Essential Spanish words and phrases for beginners learning from English'
    }).returning();

    // Spanish vocabulary cards
    const spanishCards = [
      { front: 'Hello', back: 'Hola' },
      { front: 'Thank you', back: 'Gracias' },
      { front: 'Please', back: 'Por favor' },
      { front: 'Goodbye', back: 'Adiós' },
      { front: 'Good morning', back: 'Buenos días' },
      { front: 'Good night', back: 'Buenas noches' },
      { front: 'Water', back: 'Agua' },
      { front: 'Food', back: 'Comida' },
      { front: 'House', back: 'Casa' },
      { front: 'Family', back: 'Familia' },
      { front: 'Friend', back: 'Amigo/Amiga' },
      { front: 'Love', back: 'Amor' },
      { front: 'Time', back: 'Tiempo' },
      { front: 'Money', back: 'Dinero' },
      { front: 'Beautiful', back: 'Hermoso/Hermosa' }
    ];

    // Insert Spanish cards
    console.log('Adding Spanish vocabulary cards...');
    for (let i = 0; i < spanishCards.length; i++) {
      await db.insert(cardsTable).values({
        deckId: spanishDeck.id,
        front: spanishCards[i].front,
        back: spanishCards[i].back,
        position: i + 1
      });
    }

    // Create the British History Deck
    console.log('Creating British History deck...');
    const [historyDeck] = await db.insert(decksTable).values({
      userId: USER_ID,
      title: 'British History - Key Facts',
      description: 'Important events, dates, and figures in British history'
    }).returning();

    // British history Q&A cards
    const historyCards = [
      { 
        front: 'In what year did the Norman Conquest occur?', 
        back: '1066 - William the Conqueror defeated King Harold II at the Battle of Hastings' 
      },
      { 
        front: 'Who was the first Tudor monarch?', 
        back: 'Henry VII, who became king in 1485 after defeating Richard III at the Battle of Bosworth' 
      },
      { 
        front: 'What was the name of the document signed by King John in 1215?', 
        back: 'Magna Carta - a charter that limited the king\'s power and established certain legal rights' 
      },
      { 
        front: 'During which years did the English Civil War take place?', 
        back: '1642-1651 - a series of conflicts between Parliamentarians and Royalists' 
      },
      { 
        front: 'Who was executed in 1649 during the English Civil War?', 
        back: 'King Charles I - he was tried for treason and executed by Parliament' 
      },
      { 
        front: 'What event occurred in London in 1666?', 
        back: 'The Great Fire of London - it destroyed much of medieval London but led to rebuilding' 
      },
      { 
        front: 'Who was the monarch during the defeat of the Spanish Armada?', 
        back: 'Elizabeth I - the Spanish Armada was defeated in 1588' 
      },
      { 
        front: 'What was the name of the period when Britain had no monarchy?', 
        back: 'The Commonwealth or Interregnum (1649-1660), led by Oliver Cromwell' 
      },
      { 
        front: 'In what year did the Act of Union join England and Scotland?', 
        back: '1707 - creating the Kingdom of Great Britain' 
      },
      { 
        front: 'Who was known as the "Iron Lady"?', 
        back: 'Margaret Thatcher - Britain\'s first female Prime Minister (1979-1990)' 
      },
      { 
        front: 'What was the name of Britain\'s first black female MP?', 
        back: 'Diane Abbott - elected in 1987' 
      },
      { 
        front: 'During which monarch\'s reign did Britain lose the American colonies?', 
        back: 'George III - the American Revolution ended with independence in 1783' 
      },
      { 
        front: 'What was the Domesday Book?', 
        back: 'A survey of England ordered by William the Conqueror in 1086 to record land ownership' 
      },
      { 
        front: 'Who led Britain during most of World War II?', 
        back: 'Winston Churchill - Prime Minister from 1940-1945 and again 1951-1955' 
      },
      { 
        front: 'What was the name of the British monarchy\'s German house name before 1917?', 
        back: 'House of Saxe-Coburg and Gotha - changed to Windsor due to anti-German sentiment in WWI' 
      }
    ];

    // Insert history cards
    console.log('Adding British History cards...');
    for (let i = 0; i < historyCards.length; i++) {
      await db.insert(cardsTable).values({
        deckId: historyDeck.id,
        front: historyCards[i].front,
        back: historyCards[i].back,
        position: i + 1
      });
    }

    console.log('✅ Successfully populated example data!');
    console.log(`📚 Created deck: "${spanishDeck.title}" with ${spanishCards.length} cards`);
    console.log(`📚 Created deck: "${historyDeck.title}" with ${historyCards.length} cards`);
    console.log(`👤 All decks created for user: ${USER_ID}`);
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  populateExampleData()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { populateExampleData };