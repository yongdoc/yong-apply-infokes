<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { api } from '@/utils/api'
import { extractApiErrorMessage } from '@/utils/api-error'
import type { Node } from '@/types/node'

const props = defineProps<{
  isOpen: boolean
  parentId: string | null
  defaultType?: 'folder' | 'file'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', node: Node): void
}>()

const name = ref('')
const type = ref<'folder' | 'file'>('folder')
const fileSize = ref<number | null>(null)
const mimeType = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const isRootCreation = computed(() => props.parentId === null)
const isFileType = computed(() => type.value === 'file')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      name.value = ''
      type.value = isRootCreation.value ? 'folder' : (props.defaultType ?? 'folder')
      fileSize.value = null
      mimeType.value = ''
      error.value = null
      isLoading.value = false
    }
  }
)

async function handleSubmit(): Promise<void> {
  error.value = null
  isLoading.value = true

  const payload: {
    name: string
    type: 'folder' | 'file'
    parent_id?: string
    file_size_bytes?: number
    mime_type?: string
  } = {
    name: name.value,
    type: type.value
  }

  if (props.parentId) {
    payload.parent_id = props.parentId
  }

  if (type.value === 'file' && props.parentId) {
    payload.file_size_bytes = fileSize.value ?? 0
    if (mimeType.value.trim()) {
      payload.mime_type = mimeType.value.trim()
    }
  }

  try {
    const { data, error: apiError } = await api.api.nodes.post(payload)

    if (apiError) {
      error.value = extractApiErrorMessage(apiError, 'Failed to create item.')
      return
    }

    if (data) {
      emit('created', data as unknown as Node)
      emit('close')
    }
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
      <h2 class="mb-4 text-xl font-semibold text-gray-900">
        {{ isRootCreation ? 'Create Root Folder' : 'Create New Item' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
          <select
            v-model="type"
            :disabled="isRootCreation"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
          >
            <option value="folder">Folder</option>
            <option value="file">File</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Size (bytes)</label>
          <input
            v-model.number="fileSize"
            type="number"
            min="0"
            :disabled="!isFileType"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">MIME Type</label>
          <input
            v-model="mimeType"
            type="text"
            :disabled="!isFileType"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

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
            :disabled="isLoading"
            class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {{ isLoading ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
