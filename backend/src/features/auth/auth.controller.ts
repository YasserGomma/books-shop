import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AuthService } from './auth.service';
import type { 
  RegisterInput, 
  LoginInput, 
  ForgotPasswordInput, 
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput 
} from './auth.validation';

export class AuthController {
  static async register(c: Context) {
    try {
      const data = c.get('validatedData') as RegisterInput;
      
      const result = await AuthService.register(data);
      
      return c.json({
        success: true,
        message: 'User registered successfully',
        data: result,
      }, 201);
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  static async login(c: Context) {
    try {
      const data = c.get('validatedData') as LoginInput;
      
      const result = await AuthService.login(data);
      
      return c.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      throw new HTTPException(401, {
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  static async logout(c: Context) {
    try {
      const user = c.get('user');
      
      await AuthService.logout(user.id);
      
      return c.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: 'Logout failed',
      });
    }
  }

  static async forgotPassword(c: Context) {
    try {
      const { email } = c.get('validatedData') as ForgotPasswordInput;
      
      await AuthService.forgotPassword(email);
      
      return c.json({
        success: true,
        message: 'OTP sent successfully. Use OTP: 123456',
      });
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Failed to send OTP',
      });
    }
  }

  static async resetPassword(c: Context) {
    try {
      const { otp, newPassword } = c.get('validatedData') as ResetPasswordInput;
      const email = c.req.query('email');
      
      if (!email) {
        throw new HTTPException(400, {
          message: 'Email query parameter is required',
        });
      }
      
      await AuthService.resetPassword(email, otp, newPassword);
      
      return c.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  }

  static async getCurrentUser(c: Context) {
    const user = c.get('user');
    
    return c.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  }

  static async updateProfile(c: Context) {
    try {
      const user = c.get('user');
      const data = c.get('validatedData') as UpdateProfileInput;
      
      const updatedUser = await AuthService.updateProfile(user.id, data);
      
      return c.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Profile update failed',
      });
    }
  }

  static async changePassword(c: Context) {
    try {
      const user = c.get('user');
      const { currentPassword, newPassword } = c.get('validatedData') as ChangePasswordInput;
      
      await AuthService.changePassword(user.id, currentPassword, newPassword);
      
      return c.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : 'Password change failed',
      });
    }
  }
}