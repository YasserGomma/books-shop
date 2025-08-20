import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(8, 'JWT Secret must be at least 8 characters'),
  API_PREFIX: z.string().default('/api'),
});

type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = parseEnv();