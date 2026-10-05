import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockApi } from '@/test/mock-api';
import Navbar from './Navbar.vue';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));
vi.mock('vue-router', () => {
  const push = vi.fn();
  return {
    useRouter: () => ({ push }),
    createRouter: vi.fn(),
    createWebHistory: vi.fn(),
  };
});

import { useRouter } from 'vue-router';
import { authStore } from '@/stores/auth-store';

const { push: routerPush } = useRouter() as unknown as { push: ReturnType<typeof vi.fn> };

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    authStore.logout();
    authStore.clearError();
    vi.clearAllMocks();
  });

  it('displays the logged-in user name', async () => {
    localStorage.setItem('infokes_token', 'token');
    localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
    authStore.loadFromStorage();

    const wrapper = mount(Navbar);

    expect(wrapper.text()).toContain('Alice');
  });

  it('logs out and redirects to login when logout is clicked', async () => {
    localStorage.setItem('infokes_token', 'token');
    localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
    authStore.loadFromStorage();

    const wrapper = mount(Navbar);
    const logoutButton = wrapper.findAll('button').find((btn) => btn.text() === 'Logout');
    await logoutButton?.trigger('click');

    expect(authStore.state.token).toBeNull();
    expect(authStore.state.user).toBeNull();
    expect(routerPush).toHaveBeenCalledWith('/login');
  });

  it('opens the update password modal', async () => {
    localStorage.setItem('infokes_token', 'token');
    localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
    authStore.loadFromStorage();

    const wrapper = mount(Navbar);
    const updateButton = wrapper.findAll('button').find((btn) => btn.text() === 'Update Password');
    await updateButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Update Password');
  });

  it('closes the update password modal', async () => {
    localStorage.setItem('infokes_token', 'token');
    localStorage.setItem('infokes_user', JSON.stringify({ id: 'u1', name: 'Alice', username: 'alice', email: 'a@b.com' }));
    authStore.loadFromStorage();

    const wrapper = mount(Navbar);
    const updateButton = wrapper.findAll('button').find((btn) => btn.text() === 'Update Password');
    await updateButton?.trigger('click');
    await nextTick();

    const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === 'Cancel');
    await cancelButton?.trigger('click');
    await nextTick();

    expect(wrapper.text()).not.toContain('Old Password');
  });
});
