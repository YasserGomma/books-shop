import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Context } from 'hono';
import { BooksController } from '../../src/features/books/books.controller';
import { BooksService } from '../../src/features/books/books.service';

// Mock dependencies
vi.mock('../../src/features/books/books.service');

describe('BooksController', () => {
  let mockContext: Partial<Context>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContext = {
      req: {
        param: vi.fn(),
        query: vi.fn(),
      } as any,
      get: vi.fn(),
      json: vi.fn(),
    };
  });

  describe('getAllBooks', () => {
    it('should return all books successfully', async () => {
      const mockBooks = [
        {
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
          tags: [],
        },
      ];

      const mockResult = {
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      const mockQuery = {
        page: 1,
        limit: 10,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      vi.mocked(mockContext.get).mockReturnValue(mockQuery);
      vi.mocked(BooksService.getAllBooks).mockResolvedValue(mockResult);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.getAllBooks(mockContext as Context);

      expect(BooksService.getAllBooks).toHaveBeenCalledWith(mockQuery);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Books retrieved successfully',
        data: mockBooks,
        pagination: mockResult.pagination,
      });
    });
  });

  describe('getBookById', () => {
    it('should return book by id successfully', async () => {
      const mockBook = {
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
        tags: [],
      };

      vi.mocked(mockContext.req!.param).mockReturnValue('book-1');
      vi.mocked(BooksService.getBookById).mockResolvedValue(mockBook);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.getBookById(mockContext as Context);

      expect(BooksService.getBookById).toHaveBeenCalledWith('book-1');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book retrieved successfully',
        data: mockBook,
      });
    });

    it('should throw HTTPException for missing book id', async () => {
      vi.mocked(mockContext.req!.param).mockReturnValue(undefined);

      await expect(BooksController.getBookById(mockContext as Context))
        .rejects.toThrow('Book ID is required');
    });
  });

  describe('getMyBooks', () => {
    it('should return user books successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockBooks = [
        {
          id: 'book-1',
          title: 'My Test Book',
          description: 'Test Description',
          price: '19.99',
          thumbnail: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: mockUser,
          category: {
            id: 'cat-1',
            name: 'Fiction',
            description: 'Fiction books',
          },
          tags: [],
        },
      ];

      const mockResult = {
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      const mockQuery = {
        page: 1,
        limit: 10,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockQuery); // Second call for query
      
      vi.mocked(BooksService.getMyBooks).mockResolvedValue(mockResult);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.getMyBooks(mockContext as Context);

      expect(BooksService.getMyBooks).toHaveBeenCalledWith('user-1', mockQuery);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'My books retrieved successfully',
        data: mockBooks,
        pagination: mockResult.pagination,
      });
    });
  });

  describe('createBook', () => {
    it('should create book successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockBookData = {
        title: 'New Book',
        description: 'New Description',
        price: 29.99,
        categoryId: 'cat-1',
      };

      const mockCreatedBook = {
        id: 'book-2',
        ...mockBookData,
        price: '29.99',
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
        category: {
          id: 'cat-1',
          name: 'Fiction',
          description: 'Fiction books',
        },
        tags: [],
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockBookData); // Second call for validated data
      
      vi.mocked(BooksService.createBook).mockResolvedValue(mockCreatedBook);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.createBook(mockContext as Context);

      expect(BooksService.createBook).toHaveBeenCalledWith('user-1', mockBookData);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book created successfully',
        data: mockCreatedBook,
      }, 201);
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUpdateData = {
        title: 'Updated Title',
        price: 39.99,
      };

      const mockUpdatedBook = {
        id: 'book-1',
        title: 'Updated Title',
        description: 'Test Description',
        price: '39.99',
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
        category: {
          id: 'cat-1',
          name: 'Fiction',
          description: 'Fiction books',
        },
        tags: [],
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockUpdateData); // Second call for validated data
      
      vi.mocked(mockContext.req!.param).mockReturnValue('book-1');
      vi.mocked(BooksService.updateBook).mockResolvedValue(mockUpdatedBook);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.updateBook(mockContext as Context);

      expect(BooksService.updateBook).toHaveBeenCalledWith('book-1', 'user-1', mockUpdateData);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book updated successfully',
        data: mockUpdatedBook,
      });
    });

    it('should throw HTTPException for missing book id', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req!.param).mockReturnValue(undefined);

      await expect(BooksController.updateBook(mockContext as Context))
        .rejects.toThrow('Book ID is required');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req!.param).mockReturnValue('book-1');
      vi.mocked(BooksService.deleteBook).mockResolvedValue();
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await BooksController.deleteBook(mockContext as Context);

      expect(BooksService.deleteBook).toHaveBeenCalledWith('book-1', 'user-1');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book deleted successfully',
      });
    });

    it('should throw HTTPException for missing book id', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req!.param).mockReturnValue(undefined);

      await expect(BooksController.deleteBook(mockContext as Context))
        .rejects.toThrow('Book ID is required');
    });
  });
});