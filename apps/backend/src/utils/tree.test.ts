import { describe, test, expect } from 'bun:test';
import { buildTree, type Node } from './tree';

describe('buildTree', () => {
  test('returns empty array for empty input', () => {
    expect(buildTree([])).toEqual([]);
  });

  test('places root nodes at top level', () => {
    const nodes: Node[] = [
      { id: '1', name: 'A', type: 'folder', parent_id: null },
      { id: '2', name: 'B', type: 'file', parent_id: null },
    ];

    const tree = buildTree(nodes);

    expect(tree).toHaveLength(2);
    expect(tree[0]?.id).toBe('1');
    expect(tree[1]?.id).toBe('2');
  });

  test('nests children under their parent', () => {
    const nodes: Node[] = [
      { id: '1', name: 'Parent', type: 'folder', parent_id: null },
      { id: '2', name: 'Child', type: 'file', parent_id: '1' },
    ];

    const tree = buildTree(nodes);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children?.[0]?.id).toBe('2');
  });

  test('supports multiple nesting levels', () => {
    const nodes: Node[] = [
      { id: '1', name: 'Root', type: 'folder', parent_id: null },
      { id: '2', name: 'Mid', type: 'folder', parent_id: '1' },
      { id: '3', name: 'Leaf', type: 'file', parent_id: '2' },
    ];

    const tree = buildTree(nodes);

    expect(tree[0]?.children?.[0]?.children?.[0]?.id).toBe('3');
  });

  test('orphaned children are promoted to root when parent is missing', () => {
    const nodes: Node[] = [
      { id: '2', name: 'Orphan', type: 'file', parent_id: 'missing' },
    ];

    const tree = buildTree(nodes);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.id).toBe('2');
  });

  test('preserves node fields on cloned objects', () => {
    const nodes: Node[] = [
      {
        id: '1',
        name: 'File',
        type: 'file',
        parent_id: null,
        file_size_bytes: 1024,
        mime_type: 'text/plain',
      },
    ];

    const tree = buildTree(nodes);

    expect(tree[0]).toMatchObject({
      id: '1',
      name: 'File',
      type: 'file',
      file_size_bytes: 1024,
      mime_type: 'text/plain',
    });
  });
});
