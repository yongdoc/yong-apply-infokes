import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import FolderTree from './FolderTree.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const folders: Node[] = [
  {
    id: 'f1',
    name: 'Root',
    type: 'folder',
    parent_id: null,
    children: [
      { id: 'f2', name: 'Child', type: 'folder', parent_id: 'f1' },
    ],
  },
];

describe('FolderTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching folders', async () => {
    mockApi.api.nodes.folder.get.mockReturnValue(new Promise(() => {}));

    const wrapper = mount(FolderTree, { props: { selectedId: null } });
    await nextTick();

    expect(wrapper.text()).toContain('Loading folders');
  });

  it('renders folders after a successful fetch', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(FolderTree, { props: { selectedId: null } });
    await flushPromises();

    expect(wrapper.text()).toContain('Root');
  });

  it('displays an error when the API fails', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({
      data: null,
      error: { value: { message: 'Failed to load folders.' } },
    });

    const wrapper = mount(FolderTree, { props: { selectedId: null } });
    await flushPromises();

    expect(wrapper.text()).toContain('Failed to load folders.');
  });

  it('emits select when a folder is clicked', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(FolderTree, { props: { selectedId: null } });
    await flushPromises();

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')?.[0]).toEqual([folders[0]]);
  });

  it('expands the tree to the selected folder', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(FolderTree, { props: { selectedId: null } });
    await flushPromises();

    await wrapper.setProps({ selectedId: 'f2' });
    await flushPromises();

    expect(wrapper.text()).toContain('Child');
  });
});
