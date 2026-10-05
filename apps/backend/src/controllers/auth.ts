import { type Context } from "elysia";
import { sql } from "@/config/db";
import { BadRequestError, UnauthorizedError } from "@/utils/error";

export const AuthController = {
  // REGISTER USER
  async register(ctx: Context) {
    const { name, username, email, password } = ctx.body as any;
    const [existing] = await sql`SELECT id from infokes.users WHERE email = ${email} OR username = ${username}`;
    if (existing) {
      throw new BadRequestError('Username or email address is already registered.');
    }

    const passwordHash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
    const [newUser] = await sql`
      INSERT INTO infokes.users (name, email, username, password_hash)
      VALUES (${name}, ${email}, ${username}, ${passwordHash})
      RETURNING id, name, username, email
    `;

    ctx.set.status = 201;
    return newUser;
  },

  // LOGIN USER
  async login(ctx: Context & { jwt: any }) {
    const { identifier, password } = ctx.body as any;
    const { jwt } = ctx;

    const [user] = await sql`
      SELECT * FROM infokes.users WHERE email = ${identifier} OR username = ${identifier}
    `;
    if (!user || !(await Bun.password.verify(password, user.password_hash))) {
      throw new UnauthorizedError('Invalid credentials. Check your username/email or password.');
    }

    const token = await jwt.sign({ id: user.id, email: user.email, username: user.username });

    ctx.set.status = 201
    return {
      token,
      user: { id: user.id, name: user.name, username: user.username, email: user.email }
    };
  },

  async logout(ctx: Context) {
    // ctx.cookie.infokes_auth_token.remove();

    ctx.set.status = 201;

    return {
      success: true,
      message: 'Logged out successfully. Secure session profile tokens cleared.'
    }
  }
};
