import { Hono } from 'hono';
import { UsersController } from './users.controller';
import { authMiddleware, validateJson, validateQuery } from '../../shared/middleware';
import { getUsersQuerySchema, updateUserSchema } from './users.validation';

const users = new Hono();

// Protected user profile routes
users.use('/profile', authMiddleware);
users.get('/profile', UsersController.getCurrentUserProfile);
users.put('/profile', validateJson(updateUserSchema), UsersController.updateCurrentUserProfile);

// Admin routes (require authentication for now - TODO: add admin middleware)
users.use('/', authMiddleware);
users.get('/', validateQuery(getUsersQuerySchema), UsersController.getAllUsers);
users.get('/:id', UsersController.getUserById);
users.put('/:id', validateJson(updateUserSchema), UsersController.updateUser);
users.delete('/:id', UsersController.deleteUser);
users.get('/:id/stats', UsersController.getUserStats);

export default users;