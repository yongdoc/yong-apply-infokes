import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import DeleteConfirmModal from './DeleteConfirmModal.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const node: Node = {
  id: 'n1',
  name: 'delete-me.txt',
  type: 'file',
  parent_id: 'p1',
};

describe('DeleteConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: false, node },
    });

    expect(wrapper.text()).not.toContain('Confirm Delete');
  });

  it('renders the node name', () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true, node },
    });

    expect(wrapper.text()).toContain('delete-me.txt');
  });

  it('deletes the node and emits deleted/close on confirm', async () => {
    mockApi.api.nodes('n1').delete.mockResolvedValue({ data: {}, error: null });

    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true, node },
    });

    await wrapper.findAll('button').at(1)?.trigger('click');
    await flushPromises();

    expect(mockApi.api.nodes('n1').delete).toHaveBeenCalled();
    expect(wrapper.emitted('deleted')).toHaveLength(1);
    expect(wrapper.emitted('deleted')?.[0]).toEqual([node]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays API errors without emitting deleted', async () => {
    mockApi.api.nodes('n1').delete.mockResolvedValue({
      data: null,
      error: { value: { message: 'Cannot delete.' } },
    });

    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true, node },
    });

    await wrapper.findAll('button').at(1)?.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Cannot delete.');
    expect(wrapper.emitted('deleted')).toBeUndefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true, node },
    });

    await wrapper.findAll('button').at(0)?.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
