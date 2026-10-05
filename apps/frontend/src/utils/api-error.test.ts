import { describe, it, expect } from 'vitest';
import { extractApiErrorMessage } from './api-error';

describe('extractApiErrorMessage', () => {
  it('returns the message from an Eden error shape', () => {
    const error = {
      value: {
        message: 'Invalid credentials.',
      },
    };

    expect(extractApiErrorMessage(error, 'fallback')).toBe('Invalid credentials.');
  });

  it('joins message arrays with semicolons', () => {
    const error = {
      value: {
        message: ['Email is required.', 'Password is too short.'],
      },
    };

    expect(extractApiErrorMessage(error, 'fallback')).toBe('Email is required.; Password is too short.');
  });

  it('falls back to top-level message if value is absent', () => {
    const error = {
      message: 'Network error.',
    };

    expect(extractApiErrorMessage(error, 'fallback')).toBe('Network error.');
  });

  it('returns the fallback for non-object input', () => {
    expect(extractApiErrorMessage('raw string', 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when no message is found', () => {
    expect(extractApiErrorMessage({ value: { code: 500 } }, 'fallback')).toBe('fallback');
  });
});
