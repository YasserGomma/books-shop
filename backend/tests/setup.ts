import { beforeAll, afterAll, vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Redis for testing
const mockRedis = {
  connect: vi.fn().mockResolvedValue(undefined),
  setEx: vi.fn().mockResolvedValue('OK'),
  get: vi.fn().mockResolvedValue(null),
  del: vi.fn().mockResolvedValue(1),
  on: vi.fn(),
};

// Mock Redis client
vi.mock('../src/config/redis', () => ({
  redis: mockRedis,
  connectRedis: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/books_shop_test';
  process.env.REDIS_URL = 'redis://localhost:6379';
});

afterAll(async () => {
  // Cleanup after tests
});