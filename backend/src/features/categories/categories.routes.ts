import { Hono } from 'hono';
import { CategoriesController } from './categories.controller';
import { validateJson } from '../../shared/middleware';
import { createCategorySchema, updateCategorySchema } from './categories.validation';

const categories = new Hono();

// Public routes
categories.get('/', CategoriesController.getAllCategories);
categories.get('/:id', CategoriesController.getCategoryById);

// Admin routes (you can add admin middleware later)
categories.post('/', validateJson(createCategorySchema), CategoriesController.createCategory);
categories.put('/:id', validateJson(updateCategorySchema), CategoriesController.updateCategory);
categories.delete('/:id', CategoriesController.deleteCategory);

export default categories;