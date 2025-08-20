import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { UsersService } from './users.service';
import type { GetUsersQueryInput, UpdateUserInput } from './users.validation';

export class UsersController {
  static async getCurrentUserProfile(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user) {
        throw new HTTPException(401, {
          message: 'User not authenticated',
        });
      }

      // Get full user profile using the user ID
      const fullProfile = await UsersService.getUserById(user.id);
      
      if (!fullProfile) {
        throw new HTTPException(404, {
          message: 'User profile not found',
        });
      }
      
      return c.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: fullProfile,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      throw new HTTPException(500, {
        message: 'Failed to retrieve user profile',
      });
    }
  }

  static async getAllUsers(c: Context) {
    try {
      const query = c.get('validatedQuery') as GetUsersQueryInput;
      
      const result = await UsersService.getAllUsers(query);
      
      return c.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Failed to retrieve users',
      });
    }
  }

  static async getUserById(c: Context) {
    try {
      const userId = c.req.param('id');
      
      if (!userId) {
        throw new HTTPException(400, {
          message: 'User ID is required',
        });
      }

      const user = await UsersService.getUserById(userId);
      
      if (!user) {
        throw new HTTPException(404, {
          message: 'User not found',
        });
      }
      
      return c.json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      throw new HTTPException(500, {
        message: 'Failed to retrieve user',
      });
    }
  }

  static async updateUser(c: Context) {
    try {
      const userId = c.req.param('id');
      const data = c.get('validatedData') as UpdateUserInput;
      
      if (!userId) {
        throw new HTTPException(400, {
          message: 'User ID is required',
        });
      }

      const user = await UsersService.updateUser(userId, data);
      
      return c.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          throw new HTTPException(404, {
            message: 'User not found',
          });
        }
        if (error.message === 'Email already exists') {
          throw new HTTPException(400, {
            message: 'Email already exists',
          });
        }
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  static async deleteUser(c: Context) {
    try {
      const userId = c.req.param('id');
      
      if (!userId) {
        throw new HTTPException(400, {
          message: 'User ID is required',
        });
      }

      await UsersService.deleteUser(userId);
      
      return c.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new HTTPException(404, {
          message: 'User not found',
        });
      }
      
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to delete user',
      });
    }
  }

  static async getUserStats(c: Context) {
    try {
      const userId = c.req.param('id');
      
      if (!userId) {
        throw new HTTPException(400, {
          message: 'User ID is required',
        });
      }

      const stats = await UsersService.getUserStats(userId);
      
      return c.json({
        success: true,
        message: 'User stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new HTTPException(404, {
          message: 'User not found',
        });
      }
      
      throw new HTTPException(500, {
        message: 'Failed to retrieve user stats',
      });
    }
  }
}