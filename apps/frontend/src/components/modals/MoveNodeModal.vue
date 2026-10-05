<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '@/utils/api'
import type { Node } from '@/types/node'
import MoveNodeTreeItem from './MoveNodeTreeItem.vue'

const props = defineProps<{
  isOpen: boolean
  node: Node | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'moved', node: Node): void
}>()

const folders = ref<Node[]>([])
const selectedDestination = ref<string | 'root' | null>(null)
const expandedIds = ref<Set<string>>(new Set())
const isLoading = ref(false)
const isFetching = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      selectedDestination.value = null
      error.value = null
      expandedIds.value = new Set()
      await fetchFolders()
    }
  }
)

async function fetchFolders(): Promise<void> {
  isFetching.value = true
  try {
    const { data, error: apiError } = await api.api.nodes.folder.get()
    if (apiError) {
      error.value = typeof apiError === 'object' && apiError !== null && 'message' in apiError
        ? String(apiError.message)
        : 'Failed to load folders.'
      return
    }
    folders.value = (data ?? []) as unknown as Node[]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isFetching.value = false
  }
}

function isDescendant(parent: Node, childId: string): boolean {
  if (parent.id === childId) return true
  for (const child of parent.children ?? []) {
    if (isDescendant(child, childId)) return true
  }
  return false
}

function isSelectable(folder: Node): boolean {
  if (!props.node) return true
  if (folder.id === props.node.id) return false
  return !isDescendant(folder, props.node.id)
}

function toggleExpand(folderId: string): void {
  const next = new Set(expandedIds.value)
  if (next.has(folderId)) {
    next.delete(folderId)
  } else {
    next.add(folderId)
  }
  expandedIds.value = next
}

function selectRoot(): void {
  selectedDestination.value = 'root'
}

function selectFolder(folderId: string): void {
  selectedDestination.value = folderId
}

async function handleMove(): Promise<void> {
  if (!props.node || selectedDestination.value === null) return

  error.value = null
  isLoading.value = true

  const parentId = selectedDestination.value === 'root' ? null : selectedDestination.value

  try {
    const { data, error: apiError } = await api.api.nodes({ id: props.node.id }).put({
      parent_id: parentId
    })

    if (apiError) {
      error.value = typeof apiError === 'object' && apiError !== null && 'message' in apiError
        ? String(apiError.message)
        : 'Failed to move item.'
      return
    }

    if (data) {
      emit('moved', data as unknown as Node)
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
      <h2 class="mb-4 text-xl font-semibold text-gray-900">Move Item</h2>
      <p class="mb-3 text-sm text-gray-600">Select a destination folder:</p>

      <div
        v-if="isFetching"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500"
      >
        Loading folders...
      </div>

      <div
        v-else
        class="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2"
      >
        <ul class="space-y-1">
          <li>
            <button
              type="button"
              class="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              :class="selectedDestination === 'root' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
              @click="selectRoot"
            >
              Root (no parent)
            </button>
          </li>
          <template v-for="folder in folders" :key="folder.id">
            <MoveNodeTreeItem
              :folder="folder"
              :selected-folder-id="selectedDestination === 'root' ? null : selectedDestination"
              :expanded-ids="expandedIds"
              :is-selectable="isSelectable"
              @toggle="toggleExpand"
              @select="selectFolder"
            />
          </template>
        </ul>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>

      <div class="mt-5 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isLoading || selectedDestination === null"
          class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
          @click="handleMove"
        >
          {{ isLoading ? 'Moving...' : 'Move' }}
        </button>
      </div>
    </div>
  </div>
</template>
