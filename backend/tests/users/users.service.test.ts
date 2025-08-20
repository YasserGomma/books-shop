import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from '../../src/features/users/users.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      books: vi.fn(),
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      })),
    })),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  },
}));

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'user1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const query = {
        page: 1,
        limit: 10,
      };

      const { db } = await import('../../src/config/database');
      // Mock the count query to return 1
      const mockCountQuery = vi.fn().mockResolvedValue([{ count: 1 }]);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockCountQuery,
        }),
      } as any);
      vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers as any);

      const result = await UsersService.getAllUsers(query);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const query = {
        page: 1,
        limit: 10,
        search: 'john',
      };

      const { db } = await import('../../src/config/database');
      // Mock the count query to return 1 for search
      const mockCountQuery = vi.fn().mockResolvedValue([{ count: 1 }]);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockCountQuery,
        }),
      } as any);
      vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers as any);

      const result = await UsersService.getAllUsers(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].username).toBe('johndoe');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

      const result = await UsersService.getUserById('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      const { db } = await import('../../src/config/database');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

      const result = await UsersService.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const existingUser = {
        id: userId,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        firstName: 'Updated',
        lastName: 'Name',
        updatedAt: new Date(),
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getUserById
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(existingUser);
      
      // Mock update
      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      };
      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const result = await UsersService.updateUser(userId, updateData);

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
    });

    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent';
      const updateData = { firstName: 'Updated' };

      // Mock getUserById to return null
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(null);

      await expect(UsersService.updateUser(userId, updateData))
        .rejects.toThrow('User not found');
    });

    it('should throw error if email already exists', async () => {
      const userId = 'user-1';
      const updateData = { email: 'existing@example.com' };

      const existingUser = {
        id: userId,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userWithEmail = {
        id: 'other-user',
        email: 'existing@example.com',
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getUserById
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(existingUser);
      
      // Mock email exists
      vi.mocked(db.query.users.findFirst).mockResolvedValue(userWithEmail as any);

      await expect(UsersService.updateUser(userId, updateData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-1';
      const existingUser = {
        id: userId,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getUserById
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(existingUser);
      
      // Mock delete
      const mockDeleteChain = {
        where: vi.fn(),
      };
      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      await expect(UsersService.deleteUser(userId)).resolves.not.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent';

      // Mock getUserById to return null
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(null);

      await expect(UsersService.deleteUser(userId))
        .rejects.toThrow('User not found');
    });
  });

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db } = await import('../../src/config/database');
      
      // Mock getUserById
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(mockUser);
      
      // Mock book count
      const mockBookCountQuery = vi.fn().mockResolvedValue([{ count: 5 }]);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockBookCountQuery,
        }),
      } as any);

      const result = await UsersService.getUserStats(userId);

      expect(result.user).toEqual(mockUser);
      expect(result.stats.totalBooks).toBe(5);
      expect(result.stats.joinedDate).toBe(mockUser.createdAt);
    });

    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent';

      // Mock getUserById to return null
      vi.spyOn(UsersService, 'getUserById').mockResolvedValue(null);

      await expect(UsersService.getUserStats(userId))
        .rejects.toThrow('User not found');
    });
  });
});