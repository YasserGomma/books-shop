import { eq, or } from 'drizzle-orm';
import { db } from '../../config/database';
import { redis } from '../../config/redis';
import { users } from '../../db/schema';
import { hashPassword, comparePassword, generateToken } from '../../shared/utils';
import type { RegisterInput, LoginInput, AuthUser, JWTPayload } from '../../shared/types';

export class AuthService {
  private static TOKEN_PREFIX = 'auth_token:';
  private static OTP_PREFIX = 'otp:';
  private static TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
  private static OTP_EXPIRY = 15 * 60; // 15 minutes in seconds

  static async register(data: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: or(
        eq(users.email, data.email),
        eq(users.username, data.username)
      ),
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === data.username) {
        throw new Error('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    });

    // Generate token
    const payload: JWTPayload = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    const token = generateToken(payload);

    // Store token in Redis
    await redis.setEx(
      `${this.TOKEN_PREFIX}${newUser.id}`,
      this.TOKEN_EXPIRY,
      token
    );

    return {
      user: newUser,
      token,
    };
  }

  static async login(data: LoginInput): Promise<{ user: AuthUser; token: string }> {
    // Find user by username or email
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.email, data.usernameOrEmail),
        eq(users.username, data.usernameOrEmail)
      ),
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = generateToken(payload);

    // Store token in Redis
    await redis.setEx(
      `${this.TOKEN_PREFIX}${user.id}`,
      this.TOKEN_EXPIRY,
      token
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  static async logout(userId: string): Promise<void> {
    await redis.del(`${this.TOKEN_PREFIX}${userId}`);
  }

  static async validateToken(token: string, userId: string): Promise<boolean> {
    try {
      const storedToken = await redis.get(`${this.TOKEN_PREFIX}${userId}`);
      return storedToken === token;
    } catch (error) {
      return false;
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('Email not found');
    }

    // Store OTP in Redis (static OTP: 123456)
    const otp = '123456';
    await redis.setEx(
      `${this.OTP_PREFIX}${email}`,
      this.OTP_EXPIRY,
      otp
    );
  }

  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    // Verify OTP
    const storedOTP = await redis.get(`${this.OTP_PREFIX}${email}`);
    if (!storedOTP || storedOTP !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Clear OTP from Redis
    await redis.del(`${this.OTP_PREFIX}${email}`);

    // Clear existing auth token
    await redis.del(`${this.TOKEN_PREFIX}${user.id}`);
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return user || null;
  }

  static async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string }
  ): Promise<AuthUser> {
    // Check if email is being updated and already exists
    if (data.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    const [updatedUser] = await db.update(users)
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
      });

    return updatedUser;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Clear existing auth token to force re-login
    await redis.del(`${this.TOKEN_PREFIX}${userId}`);
  }
}