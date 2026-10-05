import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MoveNodeTreeItem from './MoveNodeTreeItem.vue';
import type { Node } from '@/types/node';

const folder: Node = {
  id: 'f1',
  name: 'Root',
  type: 'folder',
  parent_id: null,
  children: [
    { id: 'f2', name: 'Child', type: 'folder', parent_id: 'f1' },
  ],
};

describe('MoveNodeTreeItem', () => {
  it('renders the folder name', () => {
    const wrapper = mount(MoveNodeTreeItem, {
      props: {
        folder,
        selectedFolderId: null,
        expandedIds: new Set<string>(),
        isSelectable: () => true,
      },
    });

    expect(wrapper.text()).toContain('Root');
  });

  it('emits select with the folder id when clicked', async () => {
    const wrapper = mount(MoveNodeTreeItem, {
      props: {
        folder,
        selectedFolderId: null,
        expandedIds: new Set<string>(),
        isSelectable: () => true,
      },
    });

    const selectButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await selectButton?.trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')?.[0]).toEqual(['f1']);
  });

  it('does not emit select when folder is not selectable', async () => {
    const wrapper = mount(MoveNodeTreeItem, {
      props: {
        folder,
        selectedFolderId: null,
        expandedIds: new Set<string>(),
        isSelectable: () => false,
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('renders children when expanded', () => {
    const wrapper = mount(MoveNodeTreeItem, {
      props: {
        folder,
        selectedFolderId: null,
        expandedIds: new Set<string>(['f1']),
        isSelectable: () => true,
      },
    });

    expect(wrapper.text()).toContain('Child');
  });

  it('applies selected styling when selectedFolderId matches', () => {
    const wrapper = mount(MoveNodeTreeItem, {
      props: {
        folder,
        selectedFolderId: 'f1',
        expandedIds: new Set<string>(),
        isSelectable: () => true,
      },
    });

    const selectButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    expect(selectButton?.classes()).toContain('bg-purple-100');
  });
});
