import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { nodeRoutes } from '@/routes/node';

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(nodeRoutes)
  .listen(process.env.PORT || 3000);

console.log(`Elysia database tree API listening at http://localhost:${app.server?.port}`);
