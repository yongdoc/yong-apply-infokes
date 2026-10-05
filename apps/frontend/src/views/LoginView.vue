<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth-store'
import RegisterModal from '@/components/auth/RegisterModal.vue'

const router = useRouter()

const identifier = ref('')
const password = ref('')
const isRegisterModalOpen = ref(false)

async function handleLogin(): Promise<void> {
  authStore.clearError()
  const success = await authStore.login(identifier.value, password.value)
  if (success) {
    void router.push('/')
  }
}

function openRegisterModal(): void {
  authStore.clearError()
  isRegisterModalOpen.value = true
}

function closeRegisterModal(): void {
  isRegisterModalOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p class="mt-1 text-sm text-gray-600">Sign in to manage your folders</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Username or Email</label>
          <input
            v-model="identifier"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <p v-if="authStore.state.error" class="text-sm text-red-600">
          {{ authStore.state.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.state.isLoading"
          class="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {{ authStore.state.isLoading ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">Don't have an account?</p>
        <button
          type="button"
          class="mt-1 font-medium text-purple-600 hover:text-purple-700"
          @click="openRegisterModal"
        >
          Register
        </button>
      </div>
    </div>

    <RegisterModal :is-open="isRegisterModalOpen" @close="closeRegisterModal" />
  </div>
</template>
