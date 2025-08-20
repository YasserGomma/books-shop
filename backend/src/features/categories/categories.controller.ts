import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { CategoriesService } from './categories.service';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.validation';

export class CategoriesController {
  static async getAllCategories(c: Context) {
    try {
      const searchTerm = c.req.query('search');
      
      let categories;
      if (searchTerm) {
        categories = await CategoriesService.searchCategories(searchTerm);
      } else {
        categories = await CategoriesService.getAllCategories();
      }
      
      return c.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Failed to retrieve categories',
      });
    }
  }

  static async getCategoryById(c: Context) {
    try {
      const categoryId = c.req.param('id');
      
      if (!categoryId) {
        throw new HTTPException(400, {
          message: 'Category ID is required',
        });
      }

      const category = await CategoriesService.getCategoryById(categoryId);
      
      return c.json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Category not found') {
        throw new HTTPException(404, {
          message: 'Category not found',
        });
      }
      
      throw new HTTPException(500, {
        message: 'Failed to retrieve category',
      });
    }
  }

  static async createCategory(c: Context) {
    try {
      const data = c.get('validatedData') as CreateCategoryInput;
      const category = await CategoriesService.createCategory(data);
      
      return c.json({
        success: true,
        message: 'Category created successfully',
        data: category,
      }, 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category name already exists') {
        throw new HTTPException(400, {
          message: 'Category name already exists',
        });
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  }

  static async updateCategory(c: Context) {
    try {
      const categoryId = c.req.param('id');
      const data = c.get('validatedData') as UpdateCategoryInput;
      
      if (!categoryId) {
        throw new HTTPException(400, {
          message: 'Category ID is required',
        });
      }

      const category = await CategoriesService.updateCategory(categoryId, data);
      
      return c.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          throw new HTTPException(404, {
            message: 'Category not found',
          });
        }
        if (error.message === 'Category name already exists') {
          throw new HTTPException(400, {
            message: 'Category name already exists',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to update category',
      });
    }
  }

  static async deleteCategory(c: Context) {
    try {
      const categoryId = c.req.param('id');
      
      if (!categoryId) {
        throw new HTTPException(400, {
          message: 'Category ID is required',
        });
      }

      await CategoriesService.deleteCategory(categoryId);
      
      return c.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          throw new HTTPException(404, {
            message: 'Category not found',
          });
        }
        if (error.message.includes('Cannot delete category that has books')) {
          throw new HTTPException(400, {
            message: 'Cannot delete category that has books. Please reassign or delete books first.',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  }
}