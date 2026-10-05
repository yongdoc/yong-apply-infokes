<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth-store'
import UpdatePasswordModal from '@/components/modals/UpdatePasswordModal.vue'

const router = useRouter()
const isUpdatePasswordOpen = ref(false)

function handleLogout(): void {
  authStore.logout()
  void router.push('/login')
}

function openUpdatePassword(): void {
  isUpdatePasswordOpen.value = true
}

function closeUpdatePassword(): void {
  isUpdatePasswordOpen.value = false
}
</script>

<template>
  <nav class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
    <div class="text-lg font-semibold text-gray-900">Infokes Explorer</div>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600">
        {{ authStore.state.user?.name ?? '' }}
      </span>

      <button
        type="button"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        @click="openUpdatePassword"
      >
        Update Password
      </button>

      <button
        type="button"
        class="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
        @click="handleLogout"
      >
        Logout
      </button>
    </div>
  </nav>

  <UpdatePasswordModal :is-open="isUpdatePasswordOpen" @close="closeUpdatePassword" />
</template>
