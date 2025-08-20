import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Context } from 'hono';
import { AuthController } from '../../src/features/auth/auth.controller';
import { AuthService } from '../../src/features/auth/auth.service';

// Mock dependencies
vi.mock('../../src/features/auth/auth.service');

describe('AuthController', () => {
  let mockContext: Partial<Context>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContext = {
      req: {
        query: vi.fn(),
      } as any,
      get: vi.fn(),
      json: vi.fn(),
    };
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockRegisterData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockResult = {
        user: {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        token: 'mock-jwt-token',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockRegisterData);
      vi.mocked(AuthService.register).mockResolvedValue(mockResult);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.register(mockContext as Context);

      expect(AuthService.register).toHaveBeenCalledWith(mockRegisterData);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockResult,
      }, 201);
    });

    it('should handle registration error', async () => {
      const mockRegisterData = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockRegisterData);
      vi.mocked(AuthService.register).mockRejectedValue(new Error('Email already exists'));

      await expect(AuthController.register(mockContext as Context))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockLoginData = {
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        token: 'mock-jwt-token',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockLoginData);
      vi.mocked(AuthService.login).mockResolvedValue(mockResult);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.login(mockContext as Context);

      expect(AuthService.login).toHaveBeenCalledWith(mockLoginData);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult,
      });
    });

    it('should handle login error', async () => {
      const mockLoginData = {
        usernameOrEmail: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockLoginData);
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Invalid credentials'));

      await expect(AuthController.login(mockContext as Context))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(AuthService.logout).mockResolvedValue();
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.logout(mockContext as Context);

      expect(AuthService.logout).toHaveBeenCalledWith('user-1');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password successfully', async () => {
      const mockForgotData = {
        email: 'test@example.com',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockForgotData);
      vi.mocked(AuthService.forgotPassword).mockResolvedValue();
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.forgotPassword(mockContext as Context);

      expect(AuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP sent successfully. Use OTP: 123456',
      });
    });

    it('should handle forgot password error', async () => {
      const mockForgotData = {
        email: 'nonexistent@example.com',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockForgotData);
      vi.mocked(AuthService.forgotPassword).mockRejectedValue(new Error('Email not found'));

      await expect(AuthController.forgotPassword(mockContext as Context))
        .rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResetData = {
        otp: '123456',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const email = 'test@example.com';

      vi.mocked(mockContext.get).mockReturnValue(mockResetData);
      vi.mocked(mockContext.req!.query).mockReturnValue(email);
      vi.mocked(AuthService.resetPassword).mockResolvedValue();
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.resetPassword(mockContext as Context);

      expect(AuthService.resetPassword).toHaveBeenCalledWith(email, '123456', 'newpassword123');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
      });
    });

    it('should throw error for missing email query parameter', async () => {
      const mockResetData = {
        otp: '123456',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockResetData);
      vi.mocked(mockContext.req!.query).mockReturnValue(undefined);

      await expect(AuthController.resetPassword(mockContext as Context))
        .rejects.toThrow('Email query parameter is required');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.getCurrentUser(mockContext as Context);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'User retrieved successfully',
        data: mockUser,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUpdateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUpdatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockUpdateData); // Second call for validated data
      
      vi.mocked(AuthService.updateProfile).mockResolvedValue(mockUpdatedUser);
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.updateProfile(mockContext as Context);

      expect(AuthService.updateProfile).toHaveBeenCalledWith('user-1', mockUpdateData);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: mockUpdatedUser,
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockPasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockPasswordData); // Second call for validated data
      
      vi.mocked(AuthService.changePassword).mockResolvedValue();
      vi.mocked(mockContext.json).mockReturnValue({} as any);

      await AuthController.changePassword(mockContext as Context);

      expect(AuthService.changePassword).toHaveBeenCalledWith('user-1', 'oldpassword123', 'newpassword123');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    });

    it('should handle change password error', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockPasswordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      vi.mocked(mockContext.get)
        .mockReturnValueOnce(mockUser) // First call for user
        .mockReturnValueOnce(mockPasswordData); // Second call for validated data
      
      vi.mocked(AuthService.changePassword).mockRejectedValue(new Error('Current password is incorrect'));

      await expect(AuthController.changePassword(mockContext as Context))
        .rejects.toThrow('Current password is incorrect');
    });
  });
});