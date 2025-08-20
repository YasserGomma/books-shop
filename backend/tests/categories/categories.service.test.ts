import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesService } from '../../src/features/categories/categories.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  db: {
    query: {
      categories: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      books: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  },
}));

describe('CategoriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Fiction', description: 'Fiction books' },
        { id: 'cat-2', name: 'Non-Fiction', description: 'Non-fiction books' },
      ];

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findMany).mockResolvedValue(mockCategories as any);

      const result = await CategoriesService.getAllCategories();

      expect(result).toEqual(mockCategories);
      expect(db.query.categories.findMany).toHaveBeenCalledWith({
        orderBy: expect.any(Array),
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Fiction',
        description: 'Fiction books',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findFirst).mockResolvedValue(mockCategory as any);

      const result = await CategoriesService.getCategoryById('cat-1');

      expect(result).toEqual(mockCategory);
    });

    it('should throw error for non-existent category', async () => {
      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findFirst).mockResolvedValue(null);

      await expect(CategoriesService.getCategoryById('non-existent'))
        .rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Technology books',
      };

      const mockNewCategory = {
        id: 'cat-3',
        ...categoryData,
        createdAt: new Date(),
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findFirst).mockResolvedValue(null); // No existing category
      
      const mockInsertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewCategory]),
        }),
      };
      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await CategoriesService.createCategory(categoryData);

      expect(result).toEqual(mockNewCategory);
    });

    it('should throw error if category name already exists', async () => {
      const categoryData = {
        name: 'Fiction',
        description: 'Fiction books',
      };

      const existingCategory = {
        id: 'cat-1',
        name: 'Fiction',
        description: 'Existing fiction',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findFirst).mockResolvedValue(existingCategory as any);

      await expect(CategoriesService.createCategory(categoryData))
        .rejects.toThrow('Category name already exists');
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const categoryId = 'cat-1';
      const updateData = { name: 'Updated Fiction' };
      
      const existingCategory = {
        id: categoryId,
        name: 'Fiction',
        description: 'Fiction books',
      };

      const updatedCategory = {
        id: categoryId,
        name: 'Updated Fiction',
        description: 'Fiction books',
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getCategoryById
      vi.spyOn(CategoriesService, 'getCategoryById').mockResolvedValue(existingCategory);
      
      // Mock no duplicate name
      vi.mocked(db.query.categories.findFirst).mockResolvedValue(null);
      
      // Mock update
      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedCategory]),
          }),
        }),
      };
      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const result = await CategoriesService.updateCategory(categoryId, updateData);

      expect(result).toEqual(updatedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const categoryId = 'cat-1';
      const existingCategory = {
        id: categoryId,
        name: 'Fiction',
        description: 'Fiction books',
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getCategoryById
      vi.spyOn(CategoriesService, 'getCategoryById').mockResolvedValue(existingCategory);
      
      // Mock no books in category
      vi.mocked(db.query.books.findFirst).mockResolvedValue(null);
      
      // Mock delete
      const mockDeleteChain = {
        where: vi.fn(),
      };
      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      await expect(CategoriesService.deleteCategory(categoryId)).resolves.not.toThrow();
    });

    it('should throw error when category has books', async () => {
      const categoryId = 'cat-1';
      const existingCategory = {
        id: categoryId,
        name: 'Fiction',
        description: 'Fiction books',
      };

      const bookInCategory = {
        id: 'book-1',
        categoryId: categoryId,
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getCategoryById
      vi.spyOn(CategoriesService, 'getCategoryById').mockResolvedValue(existingCategory);
      
      // Mock books exist in category
      vi.mocked(db.query.books.findFirst).mockResolvedValue(bookInCategory as any);

      await expect(CategoriesService.deleteCategory(categoryId))
        .rejects.toThrow('Cannot delete category that has books');
    });
  });

  describe('searchCategories', () => {
    it('should return categories matching search term', async () => {
      const searchTerm = 'fict';
      const mockCategories = [
        { id: 'cat-1', name: 'Fiction', description: 'Fiction books' },
        { id: 'cat-2', name: 'Science Fiction', description: 'Science fiction books' },
      ];

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.categories.findMany).mockResolvedValue(mockCategories as any);

      const result = await CategoriesService.searchCategories(searchTerm);

      expect(result).toEqual(mockCategories);
    });
  });
});