import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FolderTreeItem from './FolderTreeItem.vue';
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

describe('FolderTreeItem', () => {
  it('renders the folder name', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder,
        selectedId: null,
        expandedIds: new Set<string>(),
      },
    });

    expect(wrapper.text()).toContain('Root');
  });

  it('emits select when the row is clicked', async () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder,
        selectedId: null,
        expandedIds: new Set<string>(),
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')?.[0]).toEqual([folder]);
  });

  it('emits toggle when the expand chevron is clicked', async () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder,
        selectedId: null,
        expandedIds: new Set<string>(),
      },
    });

    await wrapper.findAll('button').at(1)?.trigger('click');

    expect(wrapper.emitted('toggle')).toHaveLength(1);
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['f1']);
  });

  it('renders children when expanded', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder,
        selectedId: null,
        expandedIds: new Set<string>(['f1']),
      },
    });

    expect(wrapper.text()).toContain('Child');
  });

  it('applies selected styling when selectedId matches', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder,
        selectedId: 'f1',
        expandedIds: new Set<string>(),
      },
    });

    expect(wrapper.find('button').classes()).toContain('bg-purple-100');
  });
});
