import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/features/auth/auth.service';
import { hashPassword, comparePassword } from '../../src/shared/utils/password';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
      }),
    }),
  },
}));

vi.mock('../../src/shared/utils/password');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // Mock that user doesn't exist
      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);
      
      // Mock password hashing
      vi.mocked(hashPassword).mockResolvedValue('hashedpassword');
      
      // Mock database insertion
      const mockInsertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser]),
        }),
      };
      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await AuthService.register(registerData);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error if email already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'otheruser',
      };

      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(existingUser as any);

      await expect(AuthService.register(registerData)).rejects.toThrow('Email already exists');
    });

    it('should throw error if username already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'other@example.com',
        username: 'testuser',
      };

      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(existingUser as any);

      await expect(AuthService.register(registerData)).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
      };

      const loginData = {
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(true);

      const result = await AuthService.login(loginData);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.token).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const loginData = {
        usernameOrEmail: 'test@example.com',
        password: 'wrongpassword',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('forgotPassword', () => {
    it('should store OTP for valid email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

      await expect(AuthService.forgotPassword('test@example.com')).resolves.not.toThrow();
    });

    it('should throw error for invalid email', async () => {
      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

      await expect(AuthService.forgotPassword('invalid@example.com')).rejects.toThrow('Email not found');
    });
  });
});