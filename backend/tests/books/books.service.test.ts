import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BooksService } from '../../src/features/books/books.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  db: {
    query: {
      books: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    transaction: vi.fn(),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      })),
    })),
  },
}));

describe('BooksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('createBook', () => {
    it('should create a new book successfully', async () => {
      const mockBook = {
        id: 'book-1',
        title: 'Test Book',
        description: 'Test Description',
        price: '19.99',
        authorId: 'user-1',
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBookWithDetails = {
        ...mockBook,
        author: {
          id: 'user-1',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        category: {
          id: 'cat-1',
          name: 'Fiction',
          description: 'Fiction books',
        },
        tags: [],
      };

      const createData = {
        title: 'Test Book',
        description: 'Test Description',
        price: 19.99,
        categoryId: 'cat-1',
        tags: [],
      };

      const { db } = await import('../../src/config/database');
      
      // Mock transaction
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        // Mock insert returning
        const mockInsertChain = {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockBook]),
          }),
        };
        
        const mockTx = {
          insert: vi.fn().mockReturnValue(mockInsertChain),
        };
        
        return callback(mockTx);
      });
      
      vi.mocked(db.transaction).mockImplementation(mockTransaction);
      
      // Mock getBookById to return the book with details
      vi.spyOn(BooksService, 'getBookById').mockResolvedValue(mockBookWithDetails);

      const result = await BooksService.createBook('user-1', createData);

      expect(result).toEqual(mockBookWithDetails);
    });
  });

  describe('getBookById', () => {
    it('should return book with details', async () => {
      const mockBookWithDetails = {
        id: 'book-1',
        title: 'Test Book',
        description: 'Test Description',
        price: '19.99',
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 'user-1',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        category: {
          id: 'cat-1',
          name: 'Fiction',
          description: 'Fiction books',
        },
        bookTags: [],
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.books.findFirst).mockResolvedValue(mockBookWithDetails as any);

      const result = await BooksService.getBookById('book-1');

      expect(result.id).toBe('book-1');
      expect(result.title).toBe('Test Book');
      expect(result.author).toEqual(mockBookWithDetails.author);
      expect(result.category).toEqual(mockBookWithDetails.category);
    });

    it('should throw error for non-existent book', async () => {
      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.books.findFirst).mockResolvedValue(null);

      await expect(BooksService.getBookById('non-existent'))
        .rejects.toThrow('Book not found');
    });
  });

  describe('getAllBooks', () => {
    it('should return paginated books', async () => {
      const mockBooks = [
        {
          id: 'book-1',
          title: 'Test Book 1',
          description: 'Description 1',
          price: '19.99',
          thumbnail: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: 'user-1',
            username: 'user1',
            firstName: 'User',
            lastName: 'One',
          },
          category: {
            id: 'cat-1',
            name: 'Fiction',
            description: 'Fiction books',
          },
          bookTags: [],
        },
      ];

      const query = {
        page: 1,
        limit: 10,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      const { db } = await import('../../src/config/database');
      // Mock the count query to return 1
      const mockCountQuery = vi.fn().mockResolvedValue([{ count: 1 }]);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockCountQuery,
        }),
      } as any);
      vi.mocked(db.query.books.findMany).mockResolvedValue(mockBooks as any);

      const result = await BooksService.getAllBooks(query);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const mockBook = {
        id: 'book-1',
        authorId: 'user-1',
        title: 'Original Title',
      };

      const updatedData = {
        title: 'Updated Title',
        price: 29.99,
      };

      const mockUpdatedBook = {
        id: 'book-1',
        title: 'Updated Title',
        description: 'Test Description',
        price: '29.99',
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 'user-1',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        category: {
          id: 'cat-1',
          name: 'Fiction',
          description: 'Fiction books',
        },
        tags: [],
      };

      const { db } = await import('../../src/config/database');
      
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        const mockTx = {
          query: {
            books: {
              findFirst: vi.fn().mockResolvedValue(mockBook),
            },
          },
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn(),
            }),
          }),
        };
        
        return callback(mockTx);
      });
      
      vi.mocked(db.transaction).mockImplementation(mockTransaction);
      vi.spyOn(BooksService, 'getBookById').mockResolvedValue(mockUpdatedBook);

      const result = await BooksService.updateBook('book-1', 'user-1', updatedData);

      expect(result.title).toBe('Updated Title');
    });

    it('should throw error when trying to update non-owned book', async () => {
      const mockBook = {
        id: 'book-1',
        authorId: 'other-user',
        title: 'Original Title',
      };

      const updatedData = {
        title: 'Updated Title',
      };

      const { db } = await import('../../src/config/database');
      
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        const mockTx = {
          query: {
            books: {
              findFirst: vi.fn().mockResolvedValue(mockBook),
            },
          },
        };
        
        return callback(mockTx);
      });
      
      vi.mocked(db.transaction).mockImplementation(mockTransaction);

      await expect(BooksService.updateBook('book-1', 'user-1', updatedData))
        .rejects.toThrow('You can only edit your own books');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const mockBook = {
        id: 'book-1',
        authorId: 'user-1',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.books.findFirst).mockResolvedValue(mockBook as any);
      
      const mockDeleteChain = {
        where: vi.fn(),
      };
      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      await expect(BooksService.deleteBook('book-1', 'user-1')).resolves.not.toThrow();
    });

    it('should throw error when trying to delete non-owned book', async () => {
      const mockBook = {
        id: 'book-1',
        authorId: 'other-user',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.books.findFirst).mockResolvedValue(mockBook as any);

      await expect(BooksService.deleteBook('book-1', 'user-1'))
        .rejects.toThrow('You can only delete your own books');
    });
  });
});