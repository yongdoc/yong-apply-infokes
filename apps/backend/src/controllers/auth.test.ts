import { describe, test, expect, mock, spyOn, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { createMockSql } from '@/test-utils/mock-sql';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/utils/error';

const mockSql = createMockSql();

mock.module('@/config/db', () => ({ sql: mockSql }));

async function loadController() {
  const { AuthController } = await import('@/controllers/auth');
  return AuthController;
}

interface FakeContext extends Record<string, unknown> {
  body: Record<string, unknown>;
  params: Record<string, string>;
  set: { status: number };
  headers: Record<string, string>;
  jwt: { sign: (payload: Record<string, unknown>) => Promise<string> };
}

function createContext(overrides: Partial<FakeContext> = {}): Context {
  return {
    body: {},
    params: {},
    set: { status: 0 },
    headers: {},
    jwt: { sign: mock(() => Promise.resolve('jwt-token')) },
    ...overrides,
  } as unknown as Context;
}

function withParams(ctx: Context, id: string): Context<{ params: { id: string } }> {
  return { ...ctx, params: { id } } as unknown as Context<{ params: { id: string } }>;
}

function withPasswordBody(
  ctx: Context,
  body: { old_password: string; new_password: string }
): Context<{ body: { old_password: string; new_password: string } }> {
  return { ...ctx, body } as unknown as Context<{ body: { old_password: string; new_password: string } }>;
}


beforeEach(() => {
  mockSql.clear();
});

describe('AuthController.register', () => {
  test('creates a new user and returns 201', async () => {
    const AuthController = await loadController();
    const createdUser = {
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
    };

    mockSql.pushResult([]);
    const hashSpy = spyOn(Bun.password, 'hash');
    hashSpy.mockResolvedValue('hashed-password');
    mockSql.pushResult([createdUser]);

    const ctx = createContext({
      body: {
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret123',
      },
    });

    const result = await AuthController.register(ctx);

    expect(result).toEqual(createdUser);
    expect(ctx.set.status).toBe(201);
    expect(hashSpy).toHaveBeenCalledWith('secret123', { algorithm: 'bcrypt', cost: 10 });

    hashSpy.mockRestore();
  });

  test('throws BadRequestError when email or username is taken', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([{ id: 'existing' }]);

    const ctx = createContext({
      body: {
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret123',
      },
    });

    await expect(AuthController.register(ctx)).rejects.toThrow(BadRequestError);
  });
});

describe('AuthController.login', () => {
  test('returns token and user on valid credentials', async () => {
    const AuthController = await loadController();
    const storedUser = {
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password_hash: 'hashed',
    };

    mockSql.pushResult([storedUser]);
    const verifySpy = spyOn(Bun.password, 'verify');
    verifySpy.mockResolvedValue(true);

    const ctx = createContext({
      body: { identifier: 'alice', password: 'secret123' },
      jwt: { sign: mock(() => Promise.resolve('signed-token')) },
    });

    const result = await AuthController.login(ctx as unknown as Context & { jwt: { sign: () => Promise<string> } });

    expect(result).toEqual({
      token: 'signed-token',
      user: {
        id: 'u1',
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
      },
    });
    expect(ctx.set.status).toBe(200);
    expect(verifySpy).toHaveBeenCalledWith('secret123', 'hashed');

    verifySpy.mockRestore();
  });

  test('throws UnauthorizedError when user is not found', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext({ body: { identifier: 'missing', password: 'secret123' } });

    await expect(AuthController.login(ctx as unknown as Context & { jwt: { sign: () => Promise<string> } })).rejects.toThrow(UnauthorizedError);
  });

  test('throws UnauthorizedError when password does not match', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([{ id: 'u1', password_hash: 'hashed' }]);
    const verifySpy = spyOn(Bun.password, 'verify');
    verifySpy.mockResolvedValue(false);

    const ctx = createContext({ body: { identifier: 'u1', password: 'wrong' } });

    await expect(AuthController.login(ctx as unknown as Context & { jwt: { sign: () => Promise<string> } })).rejects.toThrow(UnauthorizedError);

    verifySpy.mockRestore();
  });
});

describe('AuthController.logout', () => {
  test('returns success message and 200', async () => {
    const AuthController = await loadController();

    const ctx = createContext();
    const result = await AuthController.logout(ctx);

    expect(result).toEqual({
      success: true,
      message: 'Logged out successfully. Secure session profile tokens cleared.',
    });
    expect(ctx.set.status).toBe(200);
  });
});

describe('AuthController.getUser', () => {
  test('returns public user data when found', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([{ name: 'Alice', email: 'alice@example.com' }]);

    const ctx = createContext({ params: { id: 'u1' } });
    const result = await AuthController.getUser(withParams(ctx, 'u1'));

    expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' });
  });

  test('throws NotFoundError when user does not exist', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext({ params: { id: 'missing' } });

    await expect(AuthController.getUser(withParams(ctx, 'missing'))).rejects.toThrow(NotFoundError);
  });
});

describe('AuthController.updatePassword', () => {
  test('updates password when old password is valid', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([{ password_hash: 'old-hash' }]);
    const verifySpy = spyOn(Bun.password, 'verify');
    verifySpy.mockResolvedValue(true);
    const hashSpy = spyOn(Bun.password, 'hash');
    hashSpy.mockResolvedValue('new-hash');
    mockSql.pushResult([]);

    const ctx = createContext({
      body: { old_password: 'oldpass', new_password: 'newpass' },
      user: { id: 'u1' },
    });

    const result = await AuthController.updatePassword(withPasswordBody(ctx, { old_password: 'oldpass', new_password: 'newpass' }));

    expect(result).toEqual({ success: true, message: 'Password updated successfully.' });
    expect(ctx.set.status).toBe(200);
    expect(hashSpy).toHaveBeenCalledWith('newpass', { algorithm: 'bcrypt', cost: 10 });

    verifySpy.mockRestore();
    hashSpy.mockRestore();
  });

  test('throws UnauthorizedError when user session is invalid', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext({
      body: { old_password: 'oldpass', new_password: 'newpass' },
      user: { id: 'u1' },
    });

    await expect(AuthController.updatePassword(withPasswordBody(ctx, { old_password: 'oldpass', new_password: 'newpass' }))).rejects.toThrow(UnauthorizedError);
  });

  test('throws UnauthorizedError when old password is incorrect', async () => {
    const AuthController = await loadController();

    mockSql.pushResult([{ password_hash: 'old-hash' }]);
    const verifySpy = spyOn(Bun.password, 'verify');
    verifySpy.mockResolvedValue(false);

    const ctx = createContext({
      body: { old_password: 'wrong', new_password: 'newpass' },
      user: { id: 'u1' },
    });

    await expect(AuthController.updatePassword(withPasswordBody(ctx, { old_password: 'wrong', new_password: 'newpass' }))).rejects.toThrow(UnauthorizedError);

    verifySpy.mockRestore();
  });
});
