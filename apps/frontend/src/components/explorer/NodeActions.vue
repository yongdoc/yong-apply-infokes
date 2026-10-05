<script setup lang="ts">
import type { Node } from '@/types/node'

interface Props {
  node: Node
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'move', node: Node): void
  (e: 'edit', node: Node): void
  (e: 'delete', node: Node): void
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      title="Move"
      @click="emit('move', node)"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 9l7-7 7 7" />
        <path d="M12 16V2" />
        <path d="M5 21h14" />
      </svg>
    </button>
    <button
      type="button"
      class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      title="Edit"
      @click="emit('edit', node)"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
    <button
      type="button"
      class="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
      title="Delete"
      @click="emit('delete', node)"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    </button>
  </div>
</template>
