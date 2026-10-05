import { type Context } from "elysia";
import { sql } from "@/config/db";
import { NotFoundError, BadRequestError, UnauthorizedError } from "@/utils/error";

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

    ctx.set.status = 200
    return {
      token,
      user: { id: user.id, name: user.name, username: user.username, email: user.email }
    };
  },

  async logout(ctx: Context) {
    // ctx.cookie.infokes_auth_token.remove();

    ctx.set.status = 200;

    return {
      success: true,
      message: 'Logged out successfully. Secure session profile tokens cleared.'
    }
  },

  async getUser(ctx: Context<{ params: { id: string }}>) {
    const { params } = ctx;
    const [user] = await sql`
      SELECT name, email from infokes.users WHERE id = ${params.id} 
    `;

    if (!user) throw new NotFoundError('Users not found.');
    return user;
  },

  async updatePassword(ctx: Context) {
    const { old_password, new_password } = ctx.body as { old_password: string; new_password: string };
    const { user } = ctx as any;

    const [existingUser] = await sql`
      SELECT password_hash FROM infokes.users WHERE id = ${user.id}
    `;
    if (!existingUser) {
      throw new UnauthorizedError('User session is no longer valid.');
    }

    const isOldPasswordValid = await Bun.password.verify(old_password, existingUser.password_hash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedError('Old password is incorrect.');
    }

    const newPasswordHash = await Bun.password.hash(new_password, { algorithm: 'bcrypt', cost: 10 });
    await sql`
      UPDATE infokes.users
      SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    ctx.set.status = 200;
    return {
      success: true,
      message: 'Password updated successfully.'
    };
  }
};
