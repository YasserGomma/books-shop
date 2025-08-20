import { pgTable, uuid, varchar, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { bookTags } from './books';

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  // Multilingual fields
  nameTranslations: json('name_translations').$type<{
    en: string;
    ar: string;
  }>(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  bookTags: many(bookTags),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;