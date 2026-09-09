# Database Setup & Example Data

This guide helps you set up your Neon database and populate it with example flashcard decks.

## Prerequisites

1. **Neon Database**: Make sure you have a Neon project set up
2. **Environment Variables**: You need your DATABASE_URL configured

## Setup Steps

### 1. Configure Environment Variables

Create a `.env.local` file in your project root with your Neon database URL:

```bash
DATABASE_URL="your_neon_database_url_here"
```

You can find your DATABASE_URL in your Neon dashboard under Connection Details.

### 2. Push Database Schema

First, push your database schema to Neon:

```bash
npm run db:push
```

### 3. Populate Example Data

Run the script to add example decks for the specified user:

```bash
npm run db:populate
```

This will create:

## Example Decks Created

### 📚 Spanish Learning Deck
- **Title**: "Learn Spanish - Basic Vocabulary"
- **Description**: "Essential Spanish words and phrases for beginners learning from English"
- **Cards**: 15 cards with English words and their Spanish translations
- **Examples**: Hello → Hola, Thank you → Gracias, Water → Agua, etc.

### 📚 British History Deck
- **Title**: "British History - Key Facts"
- **Description**: "Important events, dates, and figures in British history"
- **Cards**: 15 cards with historical questions and detailed answers
- **Examples**: Norman Conquest date, Tudor monarchs, English Civil War, etc.

## User Information

Both decks are created for user ID: `user_3J4AqVWGO4b7DiVFcsHZGTm7Yye`

## Verification

After running the population script, you can:

1. **Use Drizzle Studio** to view the data:
   ```bash
   npm run db:studio
   ```

2. **Check your application** - the decks should appear for the specified user

## Troubleshooting

- **Database connection errors**: Verify your DATABASE_URL is correct
- **Permission errors**: Ensure your Neon database allows connections
- **Duplicate data**: The script will fail if you try to run it multiple times (this is expected behavior to prevent duplicates)

## Additional Notes

- Cards are positioned sequentially (position 1, 2, 3, etc.)
- All cards include creation timestamps
- The decks are linked to the specified user ID via Clerk authentication
- Database operations follow the security patterns defined in your project rules