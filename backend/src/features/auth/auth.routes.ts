import { Hono } from 'hono';
import { AuthController } from './auth.controller';
import { authMiddleware, validateJson } from '../../shared/middleware';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema 
} from './auth.validation';

const auth = new Hono();

// Public routes
auth.post('/register', validateJson(registerSchema), AuthController.register);
auth.post('/login', validateJson(loginSchema), AuthController.login);
auth.post('/forgot-password', validateJson(forgotPasswordSchema), AuthController.forgotPassword);
auth.post('/reset-password', validateJson(resetPasswordSchema), AuthController.resetPassword);

// Protected routes - Apply auth middleware
auth.use('/logout', authMiddleware);
auth.use('/profile', authMiddleware);
auth.use('/change-password', authMiddleware);
auth.use('/me', authMiddleware);

auth.post('/logout', AuthController.logout);
auth.get('/profile', AuthController.getCurrentUser);
auth.put('/profile', validateJson(updateProfileSchema), AuthController.updateProfile);
auth.put('/change-password', validateJson(changePasswordSchema), AuthController.changePassword);

// Alternative endpoint for getting current user
auth.get('/me', AuthController.getCurrentUser);

export default auth;