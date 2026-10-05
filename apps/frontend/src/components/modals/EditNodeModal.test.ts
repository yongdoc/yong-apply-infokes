import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import EditNodeModal from './EditNodeModal.vue';
import type { Node } from '@/types/node';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

const fileNode: Node = {
  id: 'n1',
  name: 'old.txt',
  type: 'file',
  parent_id: 'p1',
  file_size_bytes: 50,
  mime_type: 'text/plain',
};

describe('EditNodeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const wrapper = mount(EditNodeModal, {
      props: { isOpen: false, node: fileNode },
    });

    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('prefills file fields when opened', async () => {
    const wrapper = mount(EditNodeModal, {
      props: { isOpen: false, node: fileNode },
    });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(wrapper.find<HTMLInputElement>('input[type="text"]').element.value).toBe('old.txt');
  });

  it('submits an update and emits updated/close', async () => {
    const updated: Node = { ...fileNode, name: 'new.txt', file_size_bytes: 100 };
    mockApi.api.nodes('n1').put.mockResolvedValue({ data: updated, error: null });

    const wrapper = mount(EditNodeModal, {
      props: { isOpen: false, node: fileNode },
    });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('new.txt');
    await inputs[1]?.setValue(100);
    await inputs[2]?.setValue('text/plain');
    await nextTick();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.nodes('n1').put).toHaveBeenCalledWith({
      name: 'new.txt',
      file_size_bytes: 100,
      mime_type: 'text/plain',
    });
    expect(wrapper.emitted('updated')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays API errors without emitting updated', async () => {
    mockApi.api.nodes('n1').put.mockResolvedValue({
      data: null,
      error: { value: { message: 'Update failed.' } },
    });

    const wrapper = mount(EditNodeModal, {
      props: { isOpen: false, node: fileNode },
    });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Update failed.');
    expect(wrapper.emitted('updated')).toBeUndefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(EditNodeModal, {
      props: { isOpen: false, node: fileNode },
    });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    await wrapper.findAll('button').at(0)?.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
