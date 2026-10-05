import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import MoveNodeModal from './MoveNodeModal.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const folders: Node[] = [
  { id: 'f1', name: 'Root', type: 'folder', parent_id: null },
  { id: 'f2', name: 'Other', type: 'folder', parent_id: null },
];

const movingNode: Node = folders[0];

describe('MoveNodeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and renders folders when opened', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(MoveNodeModal, {
      props: { isOpen: false, node: movingNode },
    });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    expect(wrapper.text()).toContain('Root');
    expect(wrapper.text()).toContain('Other');
  });

  it('selects root as destination', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(MoveNodeModal, {
      props: { isOpen: false, node: movingNode },
    });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    const rootButton = wrapper.findAll('button').find((btn) => btn.text() === 'Root (no parent)');
    await rootButton?.trigger('click');

    expect(rootButton?.classes()).toContain('bg-purple-100');
  });

  it('disables the node being moved', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });

    const wrapper = mount(MoveNodeModal, {
      props: { isOpen: false, node: movingNode },
    });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    const rootFolderButton = wrapper.findAll('button').find((btn) => btn.text().includes('Root') && !btn.text().includes('(no parent)'));
    expect(rootFolderButton?.attributes('disabled')).toBeDefined();
    expect(rootFolderButton?.element.parentElement?.className).toContain('opacity-50');
  });

  it('calls the move API and emits moved/close', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });
    mockApi.api.nodes('f1').put.mockResolvedValue({
      data: { ...movingNode, parent_id: 'f2' },
      error: null,
    });

    const wrapper = mount(MoveNodeModal, {
      props: { isOpen: false, node: movingNode },
    });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    const otherButton = wrapper.findAll('button').find((btn) => btn.text().includes('Other'));
    await otherButton?.trigger('click');

    const moveButton = wrapper.findAll('button').find((btn) => btn.text() === 'Move');
    await moveButton?.trigger('click');
    await flushPromises();

    expect(mockApi.api.nodes('f1').put).toHaveBeenCalledWith({ parent_id: 'f2' });
    expect(wrapper.emitted('moved')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays API errors without emitting moved', async () => {
    mockApi.api.nodes.folder.get.mockResolvedValue({ data: folders, error: null });
    mockApi.api.nodes('f1').put.mockResolvedValue({
      data: null,
      error: { value: { message: 'Move failed.' } },
    });

    const wrapper = mount(MoveNodeModal, {
      props: { isOpen: false, node: movingNode },
    });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    const otherButton = wrapper.findAll('button').find((btn) => btn.text().includes('Other'));
    await otherButton?.trigger('click');

    const moveButton = wrapper.findAll('button').find((btn) => btn.text() === 'Move');
    await moveButton?.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Move failed.');
    expect(wrapper.emitted('moved')).toBeUndefined();
  });
});
