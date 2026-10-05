import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import HomeView from '@/views/HomeView.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const rootFolder: Node = {
  id: 'f1',
  name: 'Root',
  type: 'folder',
  parent_id: null,
};

const childFile: Node = {
  id: 'n1',
  name: 'file.txt',
  type: 'file',
  parent_id: 'f1',
  file_size_bytes: 100,
};

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the initial empty state', () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });

    expect(wrapper.text()).toContain('No folder selected');
  });

  it('loads folders and displays the selected folder contents', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [rootFolder], error: null });
    mockApi.api.nodes('f1').children.get.mockResolvedValue({ data: [childFile], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });
    await flushPromises();

    const folderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await folderButton?.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Root');
    expect(wrapper.text()).toContain('file.txt');
  });

  it('opens the create modal with the selected folder as parent', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [rootFolder], error: null });
    mockApi.api.nodes('f1').children.get.mockResolvedValue({ data: [childFile], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });
    await flushPromises();

    const folderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await folderButton?.trigger('click');
    await flushPromises();

    const newItemButton = wrapper.findAll('button').find((btn) => btn.text() === '+ New Item');
    await newItemButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Create New Item');
  });

  it('opens the edit modal from a node action', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [rootFolder], error: null });
    mockApi.api.nodes('f1').children.get.mockResolvedValue({ data: [childFile], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });
    await flushPromises();

    const folderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await folderButton?.trigger('click');
    await flushPromises();

    const editButton = wrapper.findAll('[title="Edit"]').at(1);
    await editButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Edit File');
  });

  it('opens the move modal from a node action', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [rootFolder], error: null });
    mockApi.api.nodes('f1').children.get.mockResolvedValue({ data: [childFile], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });
    await flushPromises();

    const folderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await folderButton?.trigger('click');
    await flushPromises();

    const moveButton = wrapper.findAll('[title="Move"]').at(1);
    await moveButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Move Item');
  });

  it('opens the delete modal from a node action', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: [rootFolder], error: null });
    mockApi.api.nodes('f1').children.get.mockResolvedValue({ data: [childFile], error: null });

    const wrapper = mount(HomeView, {
      global: { stubs: { Navbar: true } },
    });
    await flushPromises();

    const folderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root'));
    await folderButton?.trigger('click');
    await flushPromises();

    const deleteButton = wrapper.findAll('[title="Delete"]').at(1);
    await deleteButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Confirm Delete');
  });
});
