import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Decks table - for organizing flashcards into collections
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cards table - individual flashcards belonging to decks
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer("deck_id").references(() => decksTable.id, { onDelete: 'cascade' }).notNull(),
  title: varchar({ length: 255 }),
  front: text().notNull(), // Front side of the card (question/prompt)
  back: text().notNull(),  // Back side of the card (answer)
  position: integer().default(0).notNull(), // For ordering cards within a deck
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
// Note: Relations are commented out due to compatibility issue with drizzle-kit 1.0.0-rc.4
// The foreign key constraint is already defined in the cardsTable definition above
// export const decksRelations = relations(decksTable, ({ many }) => ({
//   cards: many(cardsTable),
// }));

// export const cardsRelations = relations(cardsTable, ({ one }) => ({
//   deck: one(decksTable, {
//     fields: [cardsTable.deckId],
//     references: [decksTable.id],
//   }),
// }));