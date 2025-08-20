import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodSchema, ZodError } from 'zod';

export const validateJson = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedData', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new HTTPException(400, {
          message: 'Validation failed',
          cause: { errors },
        });
      }
      
      throw new HTTPException(400, {
        message: 'Invalid JSON data',
      });
    }
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      c.set('validatedQuery', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new HTTPException(400, {
          message: 'Invalid query parameters',
          cause: { errors },
        });
      }
      
      throw new HTTPException(400, {
        message: 'Invalid query parameters',
      });
    }
  };
};