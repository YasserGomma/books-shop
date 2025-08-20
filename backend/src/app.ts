import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { env } from './config/env';
import { connectRedis } from './config/redis';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:4000', 'http://localhost:8000', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

// Import routes
import authRoutes from './features/auth/auth.routes';
import booksRoutes from './features/books/books.routes';
import categoriesRoutes from './features/categories/categories.routes';
import usersRoutes from './features/users/users.routes';

// API routes
app.get(`${env.API_PREFIX}`, (c) => {
  return c.json({ 
    message: 'Books Shop API', 
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: `${env.API_PREFIX}/auth`,
      books: `${env.API_PREFIX}/books`,
      myBooks: `${env.API_PREFIX}/books/my`,
      categories: `${env.API_PREFIX}/categories`,
      tags: `${env.API_PREFIX}/books/tags`,
      users: `${env.API_PREFIX}/users`,
    }
  });
});

// Register routes
app.route(`${env.API_PREFIX}/auth`, authRoutes);
app.route(`${env.API_PREFIX}/books`, booksRoutes);
app.route(`${env.API_PREFIX}/categories`, categoriesRoutes);
app.route(`${env.API_PREFIX}/users`, usersRoutes);

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    console.log(`🚀 Server is running on port ${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📚 API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
    
    serve({
      fetch: app.fetch,
      port: env.PORT,
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();