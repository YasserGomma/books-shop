import { eq, or, ilike, asc, count } from 'drizzle-orm';
import { db } from '../../config/database';
import { users, books } from '../../db/schema';
import { createPaginationResult } from '../../shared/utils';
import type { GetUsersQueryInput, UpdateUserInput } from './users.validation';
import type { PaginationResult } from '../../shared/types';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UsersService {
  static async getAllUsers(query: GetUsersQueryInput): Promise<PaginationResult<UserProfile>> {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      );
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined);
    
    const total = totalResult.count;

    // Get users with pagination
    const userList = await db.query.users.findMany({
      where: whereConditions.length > 0 ? whereConditions[0] : undefined,
      orderBy: [asc(users.createdAt)],
      limit: limit,
      offset: offset,
      columns: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createPaginationResult(userList, page, limit, total);
  }

  static async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user || null;
  }

  static async updateUser(userId: string, data: UpdateUserInput): Promise<UserProfile> {
    // Check if user exists
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email is being updated and already exists
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (userWithEmail && userWithEmail.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  }

  static async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Delete user (cascade should handle related data)
    await db.delete(users).where(eq(users.id, userId));
  }

  static async getUserStats(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's book count
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.authorId, userId));

    return {
      user,
      stats: {
        totalBooks: bookCount.count,
        joinedDate: user.createdAt,
        lastUpdated: user.updatedAt,
      },
    };
  }
}