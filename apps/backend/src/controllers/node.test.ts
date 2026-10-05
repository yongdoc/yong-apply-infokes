import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { createMockSql } from '@/test-utils/mock-sql';
import { BadRequestError, NotFoundError } from '@/utils/error';

const mockSql = createMockSql();

mock.module('@/config/db', () => ({ sql: mockSql }));

async function loadController() {
  const { NodeController } = await import('@/controllers/node');
  return NodeController;
}

interface FakeContext extends Record<string, unknown> {
  body: Record<string, unknown>;
  params: Record<string, string>;
  set: { status: number };
  user: { id: string };
}

function createContext(overrides: Partial<FakeContext> = {}): Context {
  return {
    body: {},
    params: {},
    set: { status: 0 },
    user: { id: 'u1' },
    ...overrides,
  } as unknown as Context;
}

function withId(ctx: Context, id: string): Context<{ params: { id: string } }> {
  return { ...ctx, params: { id } } as unknown as Context<{ params: { id: string } }>;
}

type CreateBody = {
  name: string;
  type: 'folder' | 'file';
  parent_id?: string | null;
  file_size_bytes?: number;
  mime_type?: string | null;
};

function withCreateBody(ctx: Context, body: CreateBody): Context<{ body: CreateBody }> {
  return { ...ctx, body } as unknown as Context<{ body: CreateBody }>;
}

function withUpdateBody(
  ctx: Context,
  id: string,
  body: Record<string, unknown>
): Context<{ params: { id: string }; body: Record<string, unknown> }> {
  return { ...ctx, params: { id }, body } as unknown as Context<{ params: { id: string }; body: Record<string, unknown> }>;
}

beforeEach(() => {
  mockSql.clear();
});

describe('NodeController.getAll', () => {
  test('returns a tree of all nodes for the user', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([
      { id: '1', name: 'Root', type: 'folder', parent_id: null },
      { id: '2', name: 'Child', type: 'file', parent_id: '1' },
    ]);

    const ctx = createContext();
    const result = await NodeController.getAll(ctx);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
    expect(result[0]?.children).toHaveLength(1);
    expect(result[0]?.children?.[0]?.id).toBe('2');
  });
});

describe('NodeController.getAllFolder', () => {
  test('returns only folder nodes as a tree', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([
      { id: '1', name: 'Root', type: 'folder', parent_id: null },
      { id: '2', name: 'Nested', type: 'folder', parent_id: '1' },
    ]);

    const ctx = createContext();
    const result = await NodeController.getAllFolder(ctx);

    expect(result).toHaveLength(1);
    expect(result[0]?.children?.[0]?.id).toBe('2');
  });
});

describe('NodeController.getChildren', () => {
  test('returns children when target is a folder', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ type: 'folder' }]);
    mockSql.pushResult([
      { id: '2', name: 'Child', type: 'file', parent_id: '1' },
    ]);

    const ctx = createContext({ params: { id: '1' } });
    const result = await NodeController.getChildren(withId(ctx, '1'));

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  test('throws NotFoundError when folder does not exist', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext({ params: { id: 'missing' } });

    await expect(NodeController.getChildren(withId(ctx, 'missing'))).rejects.toThrow(NotFoundError);
  });

  test('throws BadRequestError when target is a file', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ type: 'file' }]);

    const ctx = createContext({ params: { id: '1' } });

    await expect(NodeController.getChildren(withId(ctx, '1'))).rejects.toThrow(BadRequestError);
  });
});

describe('NodeController.create', () => {
  test('creates a root folder and returns 201', async () => {
    const NodeController = await loadController();
    const createdNode = {
      id: 'n1',
      name: 'Root',
      type: 'folder',
      parent_id: null,
      owner_id: 'u1',
      file_size_bytes: 0,
      mime_type: null,
    };

    mockSql.pushResult([createdNode]);

    const ctx = createContext();

    const result = await NodeController.create(withCreateBody(ctx, { name: 'Root', type: 'folder' }));

    expect(result).toEqual(createdNode);
    expect(ctx.set.status).toBe(201);
  });

  test('creates a file under a parent folder', async () => {
    const NodeController = await loadController();
    const createdNode = {
      id: 'n2',
      name: 'file.txt',
      type: 'file',
      parent_id: 'p1',
      owner_id: 'u1',
      file_size_bytes: 1024,
      mime_type: 'text/plain',
    };

    mockSql.pushResult([{ type: 'folder' }]);
    mockSql.pushResult([createdNode]);

    const ctx = createContext();

    const result = await NodeController.create(
      withCreateBody(ctx, {
        name: 'file.txt',
        type: 'file',
        parent_id: 'p1',
        file_size_bytes: 1024,
        mime_type: 'text/plain',
      })
    );

    expect(result).toEqual(createdNode);
  });

  test('throws NotFoundError when parent does not exist', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext();

    await expect(
      NodeController.create(withCreateBody(ctx, { name: 'Child', type: 'folder', parent_id: 'missing' }))
    ).rejects.toThrow(NotFoundError);
  });

  test('throws BadRequestError when parent is a file', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ type: 'file' }]);

    const ctx = createContext();

    await expect(
      NodeController.create(withCreateBody(ctx, { name: 'Child', type: 'folder', parent_id: 'p1' }))
    ).rejects.toThrow(BadRequestError);
  });
});

describe('NodeController.update', () => {
  test('updates node name and returns 200', async () => {
    const NodeController = await loadController();
    const updatedNode = {
      id: 'n1',
      name: 'Renamed',
      type: 'folder',
      parent_id: null,
    };

    mockSql.pushResult([{ id: 'n1' }]);
    mockSql.pushResult([updatedNode]);

    const ctx = createContext();

    const result = await NodeController.update(withUpdateBody(ctx, 'n1', { name: 'Renamed' }));

    expect(result).toEqual(updatedNode);
    expect(ctx.set.status).toBe(200);
  });

  test('throws BadRequestError when node is assigned as its own parent', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ id: 'n1' }]);

    const ctx = createContext();

    await expect(NodeController.update(withUpdateBody(ctx, 'n1', { parent_id: 'n1' }))).rejects.toThrow(BadRequestError);
  });

  test('throws NotFoundError when node does not exist', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext();

    await expect(NodeController.update(withUpdateBody(ctx, 'missing', { name: 'X' }))).rejects.toThrow(NotFoundError);
  });

  test('throws BadRequestError when new parent is a file', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ id: 'n1' }]);
    mockSql.pushResult([{ type: 'file' }]);

    const ctx = createContext();

    await expect(NodeController.update(withUpdateBody(ctx, 'n1', { parent_id: 'p1' }))).rejects.toThrow(BadRequestError);
  });

  test('returns current node when payload has no meaningful changes', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ id: 'n1' }]);

    const ctx = createContext();

    const result = await NodeController.update(withUpdateBody(ctx, 'n1', {}));

    expect(result).toEqual({ id: 'n1' });
  });
});

describe('NodeController.delete', () => {
  test('deletes a node and returns success', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([{ id: 'n1' }]);

    const ctx = createContext({ params: { id: 'n1' } });
    const result = await NodeController.delete(withId(ctx, 'n1'));

    expect(result).toEqual({
      success: true,
      message: 'Node and its descendants successfully removed.',
    });
  });

  test('throws NotFoundError when node is missing or already deleted', async () => {
    const NodeController = await loadController();

    mockSql.pushResult([]);

    const ctx = createContext({ params: { id: 'missing' } });

    await expect(NodeController.delete(withId(ctx, 'missing'))).rejects.toThrow(NotFoundError);
  });
});
