import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStore } from '@/stores/auth-store';
import router, { requireAuth, requireGuest } from './index';

const next = vi.fn();

describe('router guards', () => {
  beforeEach(() => {
    authStore.logout();
    authStore.clearError();
    next.mockClear();
  });

  describe('requireAuth', () => {
    it('calls next() when user and token exist', () => {
      localStorage.setItem('infokes_token', 'token');
      localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
      authStore.loadFromStorage();

      requireAuth({} as never, {} as never, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('redirects to /login when not authenticated', () => {
      requireAuth({} as never, {} as never, next);

      expect(next).toHaveBeenCalledWith('/login');
    });
  });

  describe('requireGuest', () => {
    it('redirects to / when already authenticated', () => {
      localStorage.setItem('infokes_token', 'token');
      localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
      authStore.loadFromStorage();

      requireGuest({} as never, {} as never, next);

      expect(next).toHaveBeenCalledWith('/');
    });

    it('calls next() when not authenticated', () => {
      requireGuest({} as never, {} as never, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});

describe('router configuration', () => {
  it('exports a router with the expected routes', () => {
    const routes = router.getRoutes().map((route) => route.path);

    expect(routes).toContain('/login');
    expect(routes).toContain('/');
  });
});
