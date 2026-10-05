import { describe, test, expect } from 'bun:test';
import { NotFoundError, BadRequestError, UnauthorizedError } from './error';

describe('custom errors', () => {
  test('NotFoundError has correct name and default message', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Resource not found.');
  });

  test('NotFoundError accepts a custom message', () => {
    const error = new NotFoundError('User not found.');

    expect(error.message).toBe('User not found.');
  });

  test('BadRequestError has correct name and message', () => {
    const error = new BadRequestError('Invalid input.');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BadRequestError');
    expect(error.message).toBe('Invalid input.');
  });

  test('UnauthorizedError has correct name and default message', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('Unauthorized access.');
  });

  test('UnauthorizedError accepts a custom message', () => {
    const error = new UnauthorizedError('Session expired.');

    expect(error.message).toBe('Session expired.');
  });
});
