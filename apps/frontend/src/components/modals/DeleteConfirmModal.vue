<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/utils/api'
import type { Node } from '@/types/node'

const props = defineProps<{
  isOpen: boolean
  node: Node | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted', node: Node): void
}>()

const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleConfirm(): Promise<void> {
  if (!props.node) return

  error.value = null
  isLoading.value = true

  try {
    const { error: apiError } = await api.api.nodes({ id: props.node.id }).delete()

    if (apiError) {
      error.value = typeof apiError === 'object' && apiError !== null && 'message' in apiError
        ? String(apiError.message)
        : 'Failed to delete item.'
      return
    }

    emit('deleted', props.node)
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
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
      <h2 class="mb-2 text-xl font-semibold text-gray-900">Confirm Delete</h2>
      <p class="mb-4 text-gray-600">
        Are you sure you want to delete <strong class="text-gray-900">{{ node?.name }}</strong>?
        This action cannot be undone.
      </p>

      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isLoading"
          class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
          @click="handleConfirm"
        >
          {{ isLoading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>
