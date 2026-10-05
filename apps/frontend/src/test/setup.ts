import { afterEach } from 'vitest';
import { installMockStorage } from './mock-storage';

installMockStorage();

afterEach(() => {
  localStorage.clear();
});
