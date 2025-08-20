import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { BooksService } from './books.service';
import { SupportedLocale } from '../../shared/middleware/locale';
import type { CreateBookInput, UpdateBookInput, BooksQueryInput } from './books.validation';

export class BooksController {
  // Public book endpoints
  static async getAllBooks(c: Context) {
    try {
      const query = c.get('validatedQuery') as BooksQueryInput;
      
      const result = await BooksService.getAllBooks(query);
      
      return c.json({
        success: true,
        message: 'Books retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'Failed to retrieve books',
      });
    }
  }

  static async getBookById(c: Context) {
    try {
      const bookId = c.req.param('id');
      
      if (!bookId) {
        throw new HTTPException(400, {
          message: 'Book ID is required',
        });
      }

      const book = await BooksService.getBookById(bookId);
      
      return c.json({
        success: true,
        message: 'Book retrieved successfully',
        data: book,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Book not found') {
        throw new HTTPException(404, {
          message: 'Book not found',
        });
      }
      
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'Failed to retrieve book',
      });
    }
  }

  // My Books endpoints (authenticated)
  static async getMyBooks(c: Context) {
    try {
      const user = c.get('user');
      const query = c.get('validatedQuery') as BooksQueryInput;
      
      const result = await BooksService.getMyBooks(user.id, query);
      
      return c.json({
        success: true,
        message: 'My books retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'Failed to retrieve your books',
      });
    }
  }

  static async createBook(c: Context) {
    try {
      const user = c.get('user');
      const data = c.get('validatedData') as CreateBookInput;
      
      const book = await BooksService.createBook(user.id, data);
      
      return c.json({
        success: true,
        message: 'Book created successfully',
        data: book,
      }, 201);
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to create book',
      });
    }
  }

  static async updateBook(c: Context) {
    try {
      const user = c.get('user');
      const bookId = c.req.param('id');
      const data = c.get('validatedData') as UpdateBookInput;
      
      if (!bookId) {
        throw new HTTPException(400, {
          message: 'Book ID is required',
        });
      }

      const book = await BooksService.updateBook(bookId, user.id, data);
      
      return c.json({
        success: true,
        message: 'Book updated successfully',
        data: book,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          throw new HTTPException(404, {
            message: 'Book not found',
          });
        }
        if (error.message === 'You can only edit your own books') {
          throw new HTTPException(403, {
            message: 'You can only edit your own books',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to update book',
      });
    }
  }

  static async deleteBook(c: Context) {
    try {
      const user = c.get('user');
      const bookId = c.req.param('id');
      
      if (!bookId) {
        throw new HTTPException(400, {
          message: 'Book ID is required',
        });
      }

      await BooksService.deleteBook(bookId, user.id);
      
      return c.json({
        success: true,
        message: 'Book deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          throw new HTTPException(404, {
            message: 'Book not found',
          });
        }
        if (error.message === 'You can only delete your own books') {
          throw new HTTPException(403, {
            message: 'You can only delete your own books',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to delete book',
      });
    }
  }

  // === MULTILINGUAL ENDPOINTS ===

  /**
   * Get all books with localization support
   * Usage: GET /api/books/localized?lang=ar
   */
  static async getLocalizedBooks(c: Context) {
    try {
      const query = c.get('validatedQuery') as BooksQueryInput;
      const locale = c.get('locale') as SupportedLocale || 'en';
      
      const result = await BooksService.getLocalizedBooks(query, locale);
      
      return c.json({
        success: true,
        message: 'Localized books retrieved successfully',
        data: result.data,
        pagination: result.pagination,
        locale,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'Failed to retrieve localized books',
      });
    }
  }

  /**
   * Get a single book by ID with localization
   * Usage: GET /api/books/localized/:id?lang=ar
   */
  static async getLocalizedBookById(c: Context) {
    try {
      const bookId = c.req.param('id');
      const locale = c.get('locale') as SupportedLocale || 'en';
      
      if (!bookId) {
        throw new HTTPException(400, {
          message: 'Book ID is required',
        });
      }

      const book = await BooksService.getLocalizedBookById(bookId, locale);
      
      return c.json({
        success: true,
        message: 'Localized book retrieved successfully',
        data: book,
        locale,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Book not found') {
        throw new HTTPException(404, {
          message: 'Book not found',
        });
      }
      
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : 'Failed to retrieve localized book',
      });
    }
  }

  /**
   * Create a book with multilingual support
   * Body should include: { title, titleEn, titleAr, description, descriptionEn, descriptionAr, ... }
   */
  static async createMultilingualBook(c: Context) {
    try {
      const user = c.get('user');
      const data = c.get('validatedData') as CreateBookInput & {
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
      };
      
      const book = await BooksService.createMultilingualBook(user.id, data);
      
      return c.json({
        success: true,
        message: 'Multilingual book created successfully',
        data: book,
      }, 201);
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to create multilingual book',
      });
    }
  }

  /**
   * Update a book with multilingual support
   */
  static async updateMultilingualBook(c: Context) {
    try {
      const user = c.get('user');
      const bookId = c.req.param('id');
      const locale = c.get('locale') as SupportedLocale || 'en';
      const data = c.get('validatedData') as UpdateBookInput & {
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
      };
      
      if (!bookId) {
        throw new HTTPException(400, {
          message: 'Book ID is required',
        });
      }

      const book = await BooksService.updateMultilingualBook(bookId, user.id, data, locale);
      
      return c.json({
        success: true,
        message: 'Multilingual book updated successfully',
        data: book,
        locale,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          throw new HTTPException(404, {
            message: 'Book not found',
          });
        }
        if (error.message === 'You can only edit your own books') {
          throw new HTTPException(403, {
            message: 'You can only edit your own books',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to update multilingual book',
      });
    }
  }
}

export class TagsController {
  static async getAllTags(c: Context) {
    try {
      const tags = await BooksService.getAllTags();
      
      return c.json({
        success: true,
        message: 'Tags retrieved successfully',
        data: tags,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Failed to retrieve tags',
      });
    }
  }

  static async createTag(c: Context) {
    try {
      const data = c.get('validatedData');
      const tag = await BooksService.createTag(data);
      
      return c.json({
        success: true,
        message: 'Tag created successfully',
        data: tag,
      }, 201);
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to create tag',
      });
    }
  }
}