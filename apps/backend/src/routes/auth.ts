import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthController } from '@/controllers/auth';
import { RegisterSchema, LoginSchema } from '@/schemas/auth';

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_infokes_key_2026",
    }),
  )
  .derive(async ({ headers, jwt, set }) => {
    const auth = headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized." };
    }
    const user = await jwt.verify(auth.split(" ")[1]);
    if (!user) {
      set.status = 401;
      return { error: "Session expired." };
    }
    return { user };
  })
  .post('/register', AuthController.register, RegisterSchema)
  .post('/login', AuthController.login, LoginSchema)
  .post('/logout', AuthController.logout);
