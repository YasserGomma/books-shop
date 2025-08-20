import { pgTable, uuid, varchar, text, decimal, timestamp, primaryKey, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { categories } from './categories';
import { tags } from './tags';

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  // Multilingual fields - JSON objects with language keys
  titleTranslations: json('title_translations').$type<{
    en: string;
    ar: string;
  }>(),
  descriptionTranslations: json('description_translations').$type<{
    en: string;
    ar: string;
  }>(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  thumbnail: varchar('thumbnail', { length: 500 }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bookTags = pgTable('book_tags', {
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.bookId, table.tagId] }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(users, {
    fields: [books.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  bookTags: many(bookTags),
}));

export const bookTagsRelations = relations(bookTags, ({ one }) => ({
  book: one(books, {
    fields: [bookTags.bookId],
    references: [books.id],
  }),
  tag: one(tags, {
    fields: [bookTags.tagId],
    references: [tags.id],
  }),
}));

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type BookTag = typeof bookTags.$inferSelect;
export type NewBookTag = typeof bookTags.$inferInsert;