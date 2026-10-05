import { describe, it, expect } from 'vitest';
import { getAuthToken } from './api';

describe('api helpers', () => {
  it('returns null when no token is stored', () => {
    localStorage.removeItem('infokes_token');

    expect(getAuthToken()).toBeNull();
  });

  it('returns the stored token', () => {
    localStorage.setItem('infokes_token', 'my-token');

    expect(getAuthToken()).toBe('my-token');
  });
});
