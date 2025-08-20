import { eq, and, ilike, asc, desc, gte, lte, count } from 'drizzle-orm';
import { db } from '../../config/database';
import { books, bookTags, users, categories, tags } from '../../db/schema';
import { createPaginationResult } from '../../shared/utils';
import { I18nService, LocalizedBook } from '../../shared/utils/i18n';
import { SupportedLocale } from '../../shared/middleware/locale';
import type { CreateBookInput, UpdateBookInput, BooksQueryInput } from './books.validation';
import type { PaginationResult } from '../../shared/types';

export interface BookWithDetails {
  id: string;
  title: string;
  description: string | null;
  price: string;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

export class BooksService {
  static async createBook(authorId: string, data: CreateBookInput): Promise<BookWithDetails> {
    return await db.transaction(async (tx) => {
      // Create the book
      const [newBook] = await tx.insert(books).values({
        ...data,
        authorId,
        price: data.price.toString(),
      }).returning();

      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        const bookTagsData = data.tags.map(tagId => ({
          bookId: newBook.id,
          tagId,
        }));
        await tx.insert(bookTags).values(bookTagsData);
      }

      // Return the book with details
      return await this.getBookById(newBook.id);
    });
  }

  static async getBookById(bookId: string): Promise<BookWithDetails> {
    const bookWithDetails = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
        bookTags: {
          with: {
            tag: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!bookWithDetails) {
      throw new Error('Book not found');
    }

    return {
      id: bookWithDetails.id,
      title: bookWithDetails.title,
      description: bookWithDetails.description,
      price: bookWithDetails.price,
      thumbnail: bookWithDetails.thumbnail,
      createdAt: bookWithDetails.createdAt,
      updatedAt: bookWithDetails.updatedAt,
      author: bookWithDetails.author,
      category: bookWithDetails.category,
      tags: bookWithDetails.bookTags.map(bt => bt.tag),
    };
  }

  static async getAllBooks(query: BooksQueryInput): Promise<PaginationResult<BookWithDetails>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'title', 
      sortOrder = 'asc',
      categoryId,
      minPrice,
      maxPrice 
    } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(ilike(books.title, `%${search}%`));
    }
    
    if (categoryId) {
      whereConditions.push(eq(books.categoryId, categoryId));
    }
    
    if (minPrice !== undefined) {
      whereConditions.push(gte(books.price, minPrice.toString()));
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(lte(books.price, maxPrice.toString()));
    }

    // Build order by
    const sortField = sortBy === 'title' ? books.title : 
                     sortBy === 'price' ? books.price : books.createdAt;
    const orderBy = sortOrder === 'desc' ? desc(sortField) : asc(sortField);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(books)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalResult.count;

    // Get books with pagination
    const booksWithDetails = await db.query.books.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [orderBy],
      limit: limit,
      offset: offset,
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
        bookTags: {
          with: {
            tag: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedBooks: BookWithDetails[] = booksWithDetails.map(book => ({
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      thumbnail: book.thumbnail,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      author: book.author,
      category: book.category,
      tags: book.bookTags.map(bt => bt.tag),
    }));

    return createPaginationResult(formattedBooks, page, limit, total);
  }

  static async getMyBooks(
    authorId: string, 
    query: BooksQueryInput
  ): Promise<PaginationResult<BookWithDetails>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'title', 
      sortOrder = 'asc',
      categoryId,
      minPrice,
      maxPrice 
    } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions (always include authorId)
    const whereConditions = [eq(books.authorId, authorId)];
    
    if (search) {
      whereConditions.push(ilike(books.title, `%${search}%`));
    }
    
    if (categoryId) {
      whereConditions.push(eq(books.categoryId, categoryId));
    }
    
    if (minPrice !== undefined) {
      whereConditions.push(gte(books.price, minPrice.toString()));
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(lte(books.price, maxPrice.toString()));
    }

    // Build order by
    const sortField = sortBy === 'title' ? books.title : 
                     sortBy === 'price' ? books.price : books.createdAt;
    const orderBy = sortOrder === 'desc' ? desc(sortField) : asc(sortField);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(books)
      .where(and(...whereConditions));
    
    const total = totalResult.count;

    // Get books with pagination
    const booksWithDetails = await db.query.books.findMany({
      where: and(...whereConditions),
      orderBy: [orderBy],
      limit: limit,
      offset: offset,
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
        bookTags: {
          with: {
            tag: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedBooks: BookWithDetails[] = booksWithDetails.map(book => ({
      id: book.id,
      title: book.title,
      description: book.description,
      price: book.price,
      thumbnail: book.thumbnail,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      author: book.author,
      category: book.category,
      tags: book.bookTags.map(bt => bt.tag),
    }));

    return createPaginationResult(formattedBooks, page, limit, total);
  }

  static async updateBook(
    bookId: string, 
    authorId: string, 
    data: UpdateBookInput
  ): Promise<BookWithDetails> {
    return await db.transaction(async (tx) => {
      // Check if book exists and user owns it
      const existingBook = await tx.query.books.findFirst({
        where: eq(books.id, bookId),
      });

      if (!existingBook) {
        throw new Error('Book not found');
      }

      if (existingBook.authorId !== authorId) {
        throw new Error('You can only edit your own books');
      }

      // Update the book
      const updateData: any = { ...data };
      if (updateData.price !== undefined) {
        updateData.price = updateData.price.toString();
      }
      updateData.updatedAt = new Date();

      await tx.update(books)
        .set(updateData)
        .where(eq(books.id, bookId));

      // Update tags if provided
      if (data.tags !== undefined) {
        // Remove existing tags
        await tx.delete(bookTags).where(eq(bookTags.bookId, bookId));
        
        // Add new tags
        if (data.tags.length > 0) {
          const bookTagsData = data.tags.map(tagId => ({
            bookId,
            tagId,
          }));
          await tx.insert(bookTags).values(bookTagsData);
        }
      }

      // Return updated book with details
      return await this.getBookById(bookId);
    });
  }

  static async deleteBook(bookId: string, authorId: string): Promise<void> {
    const existingBook = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!existingBook) {
      throw new Error('Book not found');
    }

    if (existingBook.authorId !== authorId) {
      throw new Error('You can only delete your own books');
    }

    // Delete book (cascade will handle bookTags)
    await db.delete(books).where(eq(books.id, bookId));
  }

  static async checkBookOwnership(bookId: string, authorId: string): Promise<boolean> {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { authorId: true },
    });

    return book?.authorId === authorId;
  }

  // Category management
  static async getAllCategories() {
    return await db.query.categories.findMany({
      orderBy: [asc(categories.name)],
    });
  }

  static async createCategory(data: { name: string; description?: string }) {
    const [newCategory] = await db.insert(categories).values(data).returning();
    return newCategory;
  }

  // Tag management
  static async getAllTags() {
    return await db.query.tags.findMany({
      orderBy: [asc(tags.name)],
    });
  }

  static async createTag(data: { name: string }) {
    const [newTag] = await db.insert(tags).values(data).returning();
    return newTag;
  }

  // === MULTILINGUAL METHODS ===

  /**
   * Get all books with localization support
   */
  static async getLocalizedBooks(
    query: BooksQueryInput,
    locale: SupportedLocale = 'en'
  ): Promise<PaginationResult<LocalizedBook>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'title', 
      sortOrder = 'asc',
      categoryId,
      minPrice,
      maxPrice 
    } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      // Search in both title and translated titles
      whereConditions.push(
        ilike(books.title, `%${search}%`)
        // TODO: Add JSON search for titleTranslations when needed
      );
    }
    
    if (categoryId) {
      whereConditions.push(eq(books.categoryId, categoryId));
    }
    
    if (minPrice !== undefined) {
      whereConditions.push(gte(books.price, minPrice.toString()));
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(lte(books.price, maxPrice.toString()));
    }

    // Build order by
    const sortField = sortBy === 'title' ? books.title : 
                     sortBy === 'price' ? books.price : books.createdAt;
    const orderBy = sortOrder === 'desc' ? desc(sortField) : asc(sortField);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(books)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalResult.count;

    // Get books with translations
    const rawBooks = await db.query.books.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [orderBy],
      limit: limit,
      offset: offset,
      columns: {
        id: true,
        title: true,
        description: true,
        titleTranslations: true,
        descriptionTranslations: true,
        price: true,
        thumbnail: true,
        authorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Localize the books
    const localizedBooks = rawBooks.map(book => 
      I18nService.localizeBook(book, locale)
    );

    return createPaginationResult(localizedBooks, page, limit, total);
  }

  /**
   * Get a single book by ID with localization
   */
  static async getLocalizedBookById(
    bookId: string, 
    locale: SupportedLocale = 'en'
  ): Promise<LocalizedBook> {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        title: true,
        description: true,
        titleTranslations: true,
        descriptionTranslations: true,
        price: true,
        thumbnail: true,
        authorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    return I18nService.localizeBook(book, locale);
  }

  /**
   * Create a book with multilingual support
   */
  static async createMultilingualBook(
    authorId: string, 
    data: CreateBookInput & {
      titleEn?: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
    }
  ): Promise<LocalizedBook> {
    const multilingualData = I18nService.prepareMultilingualInput(data);
    
    const [newBook] = await db.insert(books).values({
      ...data,
      ...multilingualData,
      authorId,
      price: data.price.toString(),
    }).returning();

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      const bookTagsData = data.tags.map(tagId => ({
        bookId: newBook.id,
        tagId,
      }));
      await db.insert(bookTags).values(bookTagsData);
    }

    return I18nService.localizeBook(newBook, 'en');
  }

  /**
   * Update a book with multilingual support
   */
  static async updateMultilingualBook(
    bookId: string,
    authorId: string,
    data: UpdateBookInput & {
      titleEn?: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
    },
    locale: SupportedLocale = 'en'
  ): Promise<LocalizedBook> {
    return await db.transaction(async (tx) => {
      // Check ownership
      const existingBook = await tx.query.books.findFirst({
        where: eq(books.id, bookId),
      });

      if (!existingBook) {
        throw new Error('Book not found');
      }

      if (existingBook.authorId !== authorId) {
        throw new Error('You can only edit your own books');
      }

      // Prepare multilingual data
      const multilingualData = I18nService.prepareMultilingualInput(data);
      
      // Update the book
      const updateData: any = { ...data, ...multilingualData };
      if (updateData.price !== undefined) {
        updateData.price = updateData.price.toString();
      }
      updateData.updatedAt = new Date();

      await tx.update(books)
        .set(updateData)
        .where(eq(books.id, bookId));

      // Update tags if provided
      if (data.tags !== undefined) {
        await tx.delete(bookTags).where(eq(bookTags.bookId, bookId));
        
        if (data.tags.length > 0) {
          const bookTagsData = data.tags.map(tagId => ({
            bookId,
            tagId,
          }));
          await tx.insert(bookTags).values(bookTagsData);
        }
      }

      // Return localized book
      return await this.getLocalizedBookById(bookId, locale);
    });
  }
}