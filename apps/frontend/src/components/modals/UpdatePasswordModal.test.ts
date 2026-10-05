import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import UpdatePasswordModal from '../modals/UpdatePasswordModal.vue';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));

import { api } from '@/utils/api';
import { authStore } from '@/stores/auth-store';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;

describe('UpdatePasswordModal', () => {
  beforeEach(() => {
    authStore.logout();
    authStore.clearError();
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    const wrapper = mount(UpdatePasswordModal, { props: { isOpen: false } });
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('shows a local error when new passwords do not match', async () => {
    const wrapper = mount(UpdatePasswordModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    const inputs = wrapper.findAll('input[type="password"]');
    await inputs[0]?.setValue('oldpass');
    await inputs[1]?.setValue('newpass');
    await inputs[2]?.setValue('different');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('New passwords do not match.');
    expect(mockApi.api.auth.password.put).not.toHaveBeenCalled();
  });

  it('calls updatePassword and emits updated/close on success', async () => {
    mockApi.api.auth.password.put.mockResolvedValue({ data: {}, error: null });

    const wrapper = mount(UpdatePasswordModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    const inputs = wrapper.findAll('input[type="password"]');
    await inputs[0]?.setValue('oldpass');
    await inputs[1]?.setValue('newpass');
    await inputs[2]?.setValue('newpass');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.auth.password.put).toHaveBeenCalledWith({
      old_password: 'oldpass',
      new_password: 'newpass',
    });
    expect(wrapper.emitted('updated')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('displays API errors without emitting updated', async () => {
    mockApi.api.auth.password.put.mockResolvedValue({
      data: null,
      error: { value: { message: 'Old password is incorrect.' } },
    });

    const wrapper = mount(UpdatePasswordModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    const inputs = wrapper.findAll('input[type="password"]');
    await inputs[0]?.setValue('wrong');
    await inputs[1]?.setValue('newpass');
    await inputs[2]?.setValue('newpass');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Old password is incorrect.');
    expect(wrapper.emitted('updated')).toBeUndefined();
  });

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(UpdatePasswordModal, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    await nextTick();

    await wrapper.findAll('button').at(0)?.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
