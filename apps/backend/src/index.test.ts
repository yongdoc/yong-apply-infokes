import { describe, test, expect, mock, spyOn, beforeEach } from 'bun:test';
import { createMockSql } from '@/test-utils/mock-sql';

const mockSql = createMockSql();

mock.module('@/config/db', () => ({ sql: mockSql }));

async function loadApp() {
  const { app } = await import('@/app');
  return app;
}

beforeEach(() => {
  mockSql.clear();
});

async function post(path: string, body: Record<string, unknown>, headers?: Record<string, string>) {
  const app = await loadApp();
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    })
  );
}

async function get(path: string, headers?: Record<string, string>) {
  const app = await loadApp();
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: 'GET',
      headers,
    })
  );
}

async function put(path: string, body: Record<string, unknown>, headers?: Record<string, string>) {
  const app = await loadApp();
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    })
  );
}

describe('route smoke tests', () => {
  test('returns 404 for unknown routes', async () => {
    const response = await get('/api/unknown');

    expect(response.status).toBe(404);
  });

  test('returns 401 when Authorization header is missing', async () => {
    const response = await get('/api/nodes');

    expect(response.status).toBe(401);
  });

  test('returns 401 for an invalid Bearer token', async () => {
    const response = await get('/api/nodes', {
      Authorization: 'Bearer invalid-token',
    });

    expect(response.status).toBe(401);
  });

  test('returns 422 for invalid login payload', async () => {
    const response = await post('/api/auth/login', {});
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });

  test('registers a new user end-to-end', async () => {
    const hashSpy = spyOn(Bun.password, 'hash');
    hashSpy.mockResolvedValue('hashed-password');

    mockSql.pushResult([]);
    mockSql.pushResult([{ id: 'u1', name: 'Alice', username: 'alice', email: 'alice@example.com' }]);

    const response = await post('/api/auth/register', {
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret123',
    });
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(body).toEqual({
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
    });

    hashSpy.mockRestore();
  });

  test('logs in a user end-to-end', async () => {
    const verifySpy = spyOn(Bun.password, 'verify');
    verifySpy.mockResolvedValue(true);

    mockSql.pushResult([
      {
        id: 'u1',
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hashed-password',
      },
    ]);

    const response = await post('/api/auth/login', {
      identifier: 'alice',
      password: 'secret123',
    });
    const body = await response.json() as { token: unknown; user: unknown };

    expect(response.status).toBe(200);
    expect(body.token).toBeDefined();
    expect(body.user).toEqual({
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
    });

    verifySpy.mockRestore();
  });

  test('returns 401 for protected auth route without token', async () => {
    const response = await put('/api/auth/password', {
      old_password: 'old',
      new_password: 'new',
    });

    expect(response.status).toBe(401);
  });

  test('returns 401 for protected auth route with invalid token', async () => {
    const response = await put(
      '/api/auth/password',
      { old_password: 'old', new_password: 'new' },
      { Authorization: 'Bearer invalid-token' }
    );

    expect(response.status).toBe(401);
  });
});
