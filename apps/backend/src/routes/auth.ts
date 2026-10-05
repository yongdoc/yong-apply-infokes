import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthController } from '@/controllers/auth';
import { UnauthorizedError } from '@/utils/error';
import { RegisterSchema, LoginSchema, UpdatePasswordSchema } from '@/schemas/auth';

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_infokes_key_2026",
    }),
  )
  // Public routes — no authentication required
  .post('/register', AuthController.register, RegisterSchema)
  .post('/login', AuthController.login, LoginSchema)
  .post('/logout', AuthController.logout)
  // Protected routes — require valid Bearer token
  .derive(async ({ headers, jwt }) => {
    const auth = headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedError('Unauthorized.');
    }

    try {
      const user = await jwt.verify(auth.split(" ")[1]);
      if (!user) {
        throw new UnauthorizedError('Session expired.');
      }
      return { user };
    } catch {
      throw new UnauthorizedError('Invalid token.');
    }
  })
  .put('/password', AuthController.updatePassword, UpdatePasswordSchema);
