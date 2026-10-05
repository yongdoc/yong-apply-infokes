<script setup lang="ts">
import type { Node } from '@/types/node'
import NodeActions from './NodeActions.vue'

interface Props {
  nodes: Node[]
  isLoading: boolean
  error: string | null
  selectedFolderId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'move', node: Node): void
  (e: 'edit', node: Node): void
  (e: 'delete', node: Node): void
}>()

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null) return '-'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size} ${units[unitIndex]}`
}

function formatDate(date: string | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <h3 class="text-sm font-medium text-gray-500">
        {{ nodes.length }} item{{ nodes.length === 1 ? '' : 's' }}
      </h3>
      <button
        type="button"
        :disabled="!selectedFolderId"
        class="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
        @click="emit('create')"
      >
        + New Item
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!selectedFolderId" class="flex h-full items-center justify-center text-gray-400">
        Select a folder from the left panel to view its contents
      </div>

      <div v-else-if="isLoading" class="text-center text-sm text-gray-500">
        Loading contents...
      </div>

      <div v-else-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>

      <div v-else-if="nodes.length === 0" class="flex h-full items-center justify-center text-gray-400">
        This folder is empty
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="node in nodes"
          :key="node.id"
          class="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-purple-300 hover:shadow-sm"
        >
          <div class="flex items-center gap-3">
            <svg
              v-if="node.type === 'folder'"
              class="h-5 w-5 text-yellow-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>

            <div>
              <p class="font-medium text-gray-900">{{ node.name }}</p>
              <p class="text-xs text-gray-500">
                {{ node.type === 'file' ? formatSize(node.file_size_bytes) : 'Folder' }}
                <span v-if="node.mime_type"> · {{ node.mime_type }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <NodeActions :node="node" @move="emit('move', $event)" @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
