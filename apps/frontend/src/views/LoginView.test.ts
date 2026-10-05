import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMockApi } from '@/test/mock-api';
import { flushPromises } from '@/test/flush-promises';
import LoginView from '@/views/LoginView.vue';

vi.mock('@/utils/api', () => ({ api: createMockApi() }));
vi.mock('vue-router', () => {
  const push = vi.fn();
  return {
    useRouter: () => ({ push }),
    createRouter: vi.fn(),
    createWebHistory: vi.fn(),
  };
});

import { api } from '@/utils/api';
import { useRouter } from 'vue-router';
import { authStore } from '@/stores/auth-store';

const mockApi = api as unknown as ReturnType<typeof createMockApi>;
const { push: routerPush } = useRouter() as unknown as { push: ReturnType<typeof vi.fn> };

describe('LoginView', () => {
  beforeEach(() => {
    authStore.logout();
    authStore.clearError();
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    const wrapper = mount(LoginView);

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.text()).toContain('Welcome back');
  });

  it('logs in and redirects to home on success', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: { id: 'u1', name: 'Alice', username: 'alice', email: 'alice@example.com' },
      },
      error: null,
    });

    const wrapper = mount(LoginView);
    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('alice');
    await inputs[1]?.setValue('secret123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockApi.api.auth.login.post).toHaveBeenCalledWith({
      identifier: 'alice',
      password: 'secret123',
    });
    expect(routerPush).toHaveBeenCalledWith('/');
    expect(authStore.state.token).toBe('jwt-token');
  });

  it('displays an error message on login failure', async () => {
    mockApi.api.auth.login.post.mockResolvedValue({
      data: null,
      error: { value: { message: 'Invalid credentials.' } },
    });

    const wrapper = mount(LoginView);
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Invalid credentials.');
  });

  it('opens the register modal when register button is clicked', async () => {
    const wrapper = mount(LoginView);

    const registerButton = wrapper.findAll('button').find((btn) => btn.text() === 'Register');
    await registerButton?.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Create an account');
  });
});
