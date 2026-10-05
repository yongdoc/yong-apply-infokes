import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import CreateNodeModal from './CreateNodeModal.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

describe('CreateNodeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: false, parentId: null },
    });

    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('renders the create form when open', () => {
    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: true, parentId: null },
    });

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.text()).toContain('Create Root Folder');
  });

  it('creates a root folder', async () => {
    const created: Node = {
      id: 'n1',
      name: 'New Folder',
      type: 'folder',
      parent_id: null,
    };
    mockApi.api.nodes.post.mockResolvedValue({ data: created, error: null });

    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: true, parentId: null },
    });

    await wrapper.find('input[type="text"]').setValue('New Folder');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.nodes.post).toHaveBeenCalledWith({
      name: 'New Folder',
      type: 'folder',
    });
    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('creates a file under a parent folder', async () => {
    const created: Node = {
      id: 'n2',
      name: 'file.txt',
      type: 'file',
      parent_id: 'p1',
      file_size_bytes: 100,
      mime_type: 'text/plain',
    };
    mockApi.api.nodes.post.mockResolvedValue({ data: created, error: null });

    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: true, parentId: 'p1' },
    });

    await wrapper.find('input[type="text"]').setValue('file.txt');
    await wrapper.find('select').setValue('file');
    const inputs = wrapper.findAll('input[type="number"], input[type="text"]');
    // inputs: name, size, mime
    await inputs[1]?.setValue(100);
    await inputs[2]?.setValue('text/plain');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.nodes.post).toHaveBeenCalledWith({
      name: 'file.txt',
      type: 'file',
      parent_id: 'p1',
      file_size_bytes: 100,
      mime_type: 'text/plain',
    });
  });

  it('displays API errors without emitting created', async () => {
    mockApi.api.nodes.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Name already used.' } },
    });

    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: true, parentId: null },
    });

    await wrapper.find('input[type="text"]').setValue('Duplicate');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Name already used.');
    expect(wrapper.emitted('created')).toBeUndefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(CreateNodeModal, {
      props: { isOpen: true, parentId: null },
    });

    await wrapper.findAll('button').at(0)?.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
