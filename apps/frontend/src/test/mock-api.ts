import { vi } from 'vitest';

export interface MockApi {
  api: {
    auth: {
      login: { post: ReturnType<typeof vi.fn> };
      register: { post: ReturnType<typeof vi.fn> };
      password: { put: ReturnType<typeof vi.fn> };
    };
    nodes: {
      get: ReturnType<typeof vi.fn>;
      post: ReturnType<typeof vi.fn>;
      folder: { get: ReturnType<typeof vi.fn> };
    } & ((id: string) => {
      children: { get: ReturnType<typeof vi.fn> };
      put: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    });
  };
}

export function createMockApi(): MockApi {
  const nodeHandlers = {
    children: { get: vi.fn() },
    put: vi.fn(),
    delete: vi.fn(),
  };

  const nodes = Object.assign(
    (_id: string) => nodeHandlers,
    {
      get: vi.fn(),
      post: vi.fn(),
      folder: { get: vi.fn() },
    }
  );

  return {
    api: {
      auth: {
        login: { post: vi.fn() },
        register: { post: vi.fn() },
        password: { put: vi.fn() },
      },
      nodes,
    },
  };
}
