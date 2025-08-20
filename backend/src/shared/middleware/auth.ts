import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyToken } from '../utils/jwt';
import { AuthService } from '../../features/auth/auth.service';
import { AuthUser } from '../types';
import { env } from '../../config/env';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    // Development bypass: allow mock tokens for testing
    if (env.NODE_ENV === 'development' && authHeader?.includes('mock-token-for-admin')) {
      // Use admin user for development
      const adminUser: AuthUser = {
        id: '40faae6a-bddf-49a3-a8dc-9defdb39309c',
        username: 'admin',
        email: 'admin@books.com',
        firstName: 'Admin',
        lastName: 'User',
      };
      
      c.set('user', adminUser);
      await next();
      return;
    }
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const payload = verifyToken(token);
    
    // Validate token against Redis
    const isValidToken = await AuthService.validateToken(token, payload.userId);
    if (!isValidToken) {
      throw new HTTPException(401, {
        message: 'Invalid or expired token',
      });
    }

    // Get current user data
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      throw new HTTPException(401, {
        message: 'User not found',
      });
    }

    // Set user in context
    c.set('user', user);
    
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(401, {
      message: 'Authentication failed',
    });
  }
};