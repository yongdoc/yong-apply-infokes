import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import RegisterModal from './RegisterModal.vue';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';
import { authStore } from '@/stores/auth-store';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

describe('RegisterModal', () => {
  beforeEach(() => {
    authStore.logout();
    authStore.clearError();
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const wrapper = mount(RegisterModal, { props: { isOpen: false } });
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('renders the registration form when opened', async () => {
    const wrapper = mount(RegisterModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('submits registration and emits registered/close on success', async () => {
    mockApi.api.auth.register.post.mockResolvedValue({ data: {}, error: null });

    const wrapper = mount(RegisterModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('Alice');
    await inputs[1]?.setValue('alice');
    await inputs[2]?.setValue('alice@example.com');
    await inputs[3]?.setValue('secret123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.auth.register.post).toHaveBeenCalledWith({
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret123',
    });
    expect(wrapper.emitted('registered')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays API errors without emitting registered', async () => {
    mockApi.api.auth.register.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Username taken.' } },
    });

    const wrapper = mount(RegisterModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Username taken.');
    expect(wrapper.emitted('registered')).toBeUndefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(RegisterModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    await wrapper.findAll('button').at(0)?.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
