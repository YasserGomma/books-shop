import { Hono } from 'hono';
import { BooksController, TagsController } from './books.controller';
import { authMiddleware, validateJson, validateQuery } from '../../shared/middleware';
import { localeMiddleware } from '../../shared/middleware/locale';
import { 
  createBookSchema, 
  updateBookSchema, 
  booksQuerySchema,
  createTagSchema 
} from './books.validation';

const books = new Hono();

// === MULTILINGUAL ROUTES (must come BEFORE /:id route) ===

// Apply locale middleware to all localized routes
books.use('/localized/*', localeMiddleware);

// Public multilingual routes
books.get('/localized', validateQuery(booksQuerySchema), BooksController.getLocalizedBooks);
books.get('/localized/:id', BooksController.getLocalizedBookById);

// Protected multilingual routes
books.use('/multilingual/*', authMiddleware, localeMiddleware);

books.post('/multilingual', validateJson(createBookSchema), BooksController.createMultilingualBook);
books.put('/multilingual/:id', validateJson(updateBookSchema), BooksController.updateMultilingualBook);

// Tags routes
books.get('/tags', TagsController.getAllTags);
books.post('/tags', validateJson(createTagSchema), TagsController.createTag);

// Protected routes - My Books (require authentication)
books.use('/my/*', authMiddleware);

books.get('/my', validateQuery(booksQuerySchema), BooksController.getMyBooks);
books.post('/my', validateJson(createBookSchema), BooksController.createBook);
books.put('/my/:id', validateJson(updateBookSchema), BooksController.updateBook);
books.delete('/my/:id', BooksController.deleteBook);

// Public routes - Books Shop (must come AFTER specific routes)
books.get('/', validateQuery(booksQuerySchema), BooksController.getAllBooks);
books.get('/:id', BooksController.getBookById);

export default books;