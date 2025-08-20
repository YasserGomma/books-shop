import { createClient } from 'redis';
import { env } from './env';

let redis: ReturnType<typeof createClient> | null = null;
let redisEnabled = false;

export const connectRedis = async () => {
  try {
    redis = createClient({
      url: env.REDIS_URL,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisEnabled = false;
    });

    await redis.connect();
    redisEnabled = true;
    console.log('Connected to Redis');
  } catch (error) {
    console.warn('Redis connection failed, continuing without Redis:', error.message);
    redisEnabled = false;
    redis = null;
  }
};

export { redis, redisEnabled };
export type RedisClient = typeof redis;