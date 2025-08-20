import { pgTable, uuid, varchar, text, timestamp, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { books } from './books';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  // Multilingual fields
  nameTranslations: json('name_translations').$type<{
    en: string;
    ar: string;
  }>(),
  descriptionTranslations: json('description_translations').$type<{
    en: string;
    ar: string;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;