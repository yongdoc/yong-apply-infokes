<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'search', q: string): void
  (e: 'clear'): void
}>()

const query = ref<string>('')

function handleSubmit(): void {
  const trimmed = query.value.trim()
  if (trimmed.length === 0) return
  emit('search', trimmed)
}

function handleClear(): void {
  query.value = ''
  emit('clear')
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    handleClear()
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm font-medium text-gray-700" for="node-search-input">Search</label>
    <input
      id="node-search-input"
      v-model="query"
      type="text"
      placeholder="Search nodes by name..."
      maxlength="255"
      class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      @keydown="handleKeydown"
    />
    <button
      type="button"
      class="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
      :disabled="query.trim().length === 0"
      @click="handleSubmit"
    >
      Search
    </button>
    <button
      type="button"
      class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      @click="handleClear"
    >
      Clear
    </button>
  </div>
</template>