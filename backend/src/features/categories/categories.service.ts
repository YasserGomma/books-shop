import { eq, asc, ilike } from 'drizzle-orm';
import { db } from '../../config/database';
import { categories, books } from '../../db/schema';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.validation';

export class CategoriesService {
  static async getAllCategories() {
    return await db.query.categories.findMany({
      orderBy: [asc(categories.name)],
    });
  }

  static async getCategoryById(categoryId: string) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  static async createCategory(data: CreateCategoryInput) {
    // Check if category name already exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.name, data.name),
    });

    if (existingCategory) {
      throw new Error('Category name already exists');
    }

    const [newCategory] = await db.insert(categories).values(data).returning();
    return newCategory;
  }

  static async updateCategory(categoryId: string, data: UpdateCategoryInput) {
    // Check if category exists
    const existingCategory = await this.getCategoryById(categoryId);

    // Check if new name already exists (if name is being updated)
    if (data.name && data.name !== existingCategory.name) {
      const categoryWithName = await db.query.categories.findFirst({
        where: eq(categories.name, data.name),
      });

      if (categoryWithName) {
        throw new Error('Category name already exists');
      }
    }

    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, categoryId))
      .returning();

    return updatedCategory;
  }

  static async deleteCategory(categoryId: string) {
    // Check if category exists
    await this.getCategoryById(categoryId);

    // Check if category has books
    const booksWithCategory = await db.query.books.findFirst({
      where: eq(books.categoryId, categoryId),
    });

    if (booksWithCategory) {
      throw new Error('Cannot delete category that has books. Please reassign or delete books first.');
    }

    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  static async searchCategories(searchTerm: string) {
    return await db.query.categories.findMany({
      where: ilike(categories.name, `%${searchTerm}%`),
      orderBy: [asc(categories.name)],
    });
  }
}