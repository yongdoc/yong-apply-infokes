<script setup lang="ts">
import { ref, watch } from 'vue'
import { authStore } from '@/stores/auth-store'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      localError.value = null
      authStore.clearError()
    }
  }
)

async function handleSubmit(): Promise<void> {
  localError.value = null
  authStore.clearError()

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'New passwords do not match.'
    return
  }

  const success = await authStore.updatePassword(oldPassword.value, newPassword.value)
  if (success) {
    emit('updated')
    emit('close')
  }
}

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h2 class="mb-4 text-xl font-semibold text-gray-900">Update Password</h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Old Password</label>
          <input
            v-model="oldPassword"
            type="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <p v-if="localError" class="text-sm text-red-600">{{ localError }}</p>
        <p v-else-if="authStore.state.error" class="text-sm text-red-600">
          {{ authStore.state.error }}
        </p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="authStore.state.isLoading"
            class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {{ authStore.state.isLoading ? 'Updating...' : 'Update' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
