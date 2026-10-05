import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockApi } from '@/test/mock-api';
import type { User } from '@/stores/auth-store';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';
import { authStore } from '@/stores/auth-store';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const sampleUser: User = {
  id: 'u1',
  name: 'Alice',
  username: 'alice',
  email: 'alice@example.com',
};

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  authStore.logout();
  authStore.clearError();
  vi.clearAllMocks();
});

describe('authStore.loadFromStorage', () => {
  it('hydrates state from localStorage', () => {
    localStorage.setItem('infokes_token', 'token-123');
    localStorage.setItem('infokes_user', JSON.stringify(sampleUser));

    authStore.loadFromStorage();

    expect(authStore.state.token).toBe('token-123');
    expect(authStore.state.user).toEqual(sampleUser);
  });

  it('clears state when stored user JSON is invalid', () => {
    localStorage.setItem('infokes_token', 'token-123');
    localStorage.setItem('infokes_user', 'not-json');

    authStore.loadFromStorage();

    expect(authStore.state.token).toBeNull();
    expect(authStore.state.user).toBeNull();
  });
});

describe('authStore.login', () => {
  it('returns true and persists user on success', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: { token: 'jwt-token', user: sampleUser },
      error: null,
    });

    const result = await authStore.login('alice', 'secret123');

    expect(result).toBe(true);
    expect(authStore.state.token).toBe('jwt-token');
    expect(authStore.state.user).toEqual(sampleUser);
    expect(localStorage.getItem('infokes_token')).toBe('jwt-token');
  });

  it('returns false and sets error on API error', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Invalid credentials.' } },
    });

    const result = await authStore.login('alice', 'wrong');

    expect(result).toBe(false);
    expect(authStore.state.error).toBe('Invalid credentials.');
    expect(authStore.state.token).toBeNull();
  });

  it('returns false and sets error on thrown exception', async () => {
    mockApi.api.auth.login.post.mockRejectedValue(new Error('Network failure'));

    const result = await authStore.login('alice', 'secret123');

    expect(result).toBe(false);
    expect(authStore.state.error).toBe('Network failure');
  });
});

describe('authStore.register', () => {
  it('returns true on successful registration', async () => {
    mockApi.api.auth.register.post.mockResolvedValue({ data: {}, error: null });

    const result = await authStore.register('Alice', 'alice', 'alice@example.com', 'secret123');

    expect(result).toBe(true);
    expect(mockApi.api.auth.register.post).toHaveBeenCalledWith({
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret123',
    });
  });

  it('returns false and sets error on failure', async () => {
    mockApi.api.auth.register.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Username taken.' } },
    });

    const result = await authStore.register('Alice', 'alice', 'alice@example.com', 'secret123');

    expect(result).toBe(false);
    expect(authStore.state.error).toBe('Username taken.');
  });
});

describe('authStore.logout', () => {
  it('clears token, user and localStorage', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: { token: 'jwt-token', user: sampleUser },
      error: null,
    });
    await authStore.login('alice', 'secret123');

    authStore.logout();

    expect(authStore.state.token).toBeNull();
    expect(authStore.state.user).toBeNull();
    expect(localStorage.getItem('infokes_token')).toBeNull();
  });
});

describe('authStore.updatePassword', () => {
  it('returns true on success', async () => {
    mockApi.api.auth.password.put.mockResolvedValue({ data: {}, error: null });

    const result = await authStore.updatePassword('oldpass', 'newpass');

    expect(result).toBe(true);
    expect(mockApi.api.auth.password.put).toHaveBeenCalledWith({
      old_password: 'oldpass',
      new_password: 'newpass',
    });
  });

  it('returns false and sets error on failure', async () => {
    mockApi.api.auth.password.put.mockResolvedValue({
      data: null,
      error: { value: { message: 'Old password is incorrect.' } },
    });

    const result = await authStore.updatePassword('oldpass', 'newpass');

    expect(result).toBe(false);
    expect(authStore.state.error).toBe('Old password is incorrect.');
  });
});

describe('authStore.clearError', () => {
  it('clears the error state', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Oops.' } },
    });
    await authStore.login('alice', 'wrong');

    authStore.clearError();

    expect(authStore.state.error).toBeNull();
  });
});
