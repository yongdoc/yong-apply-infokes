import { describe, test, expect } from 'bun:test';
import { getSliceBetween } from './slice';

describe('getSliceBetween', () => {
  test('returns text between start and end markers', () => {
    expect(getSliceBetween('hello [world]!', '[', ']')).toBe('world');
  });

  test('returns empty string when start marker is missing', () => {
    expect(getSliceBetween('hello world!', '[', ']')).toBe('');
  });

  test('returns empty string when end marker is missing', () => {
    expect(getSliceBetween('hello [world', '[', ']')).toBe('');
  });

  test('handles multi-character markers', () => {
    expect(getSliceBetween('start <!--content--> end', '<!--', '-->')).toBe('content');
  });
});
