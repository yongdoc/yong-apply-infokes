import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { nodeRoutes } from '@/routes/node';
import { NotFoundError, BadRequestError, UnauthorizedError } from '@/utils/error';
import { getSliceBetween } from '@/utils/slice';
import { authRoutes } from './routes/auth';

export const app = new Elysia()
  .error({
    NOT_FOUND: NotFoundError,
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return { success: false, message: error.message };
      case 'BAD_REQUEST':
        set.status = 400;
        return { success: false, error: 'BAD_REQUEST', message: error.message };
      case 'UNAUTHORIZED':
        set.status = 401;
        return { success: false, error: 'UNAUTHORIZED', message: error.message };
      case 'VALIDATION':
        set.status = 422;
        // straight forward take from message for invalid input requirement schema
        return { success: false, message: getSliceBetween(error.message, `message": "`, `",`)};
      default:
        set.status = 500;
        return { success: false, message: 'Internal Server Error'};
    }
  })
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(authRoutes)
  .use(nodeRoutes);
