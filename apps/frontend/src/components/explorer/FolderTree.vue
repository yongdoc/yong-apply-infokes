<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { api } from '@/utils/api'
import { extractApiErrorMessage } from '@/utils/api-error'
import type { Node } from '@/types/node'
import FolderTreeItem from './FolderTreeItem.vue'

const props = defineProps<{
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', folder: Node): void
}>()

const folders = ref<Node[]>([])
const expandedIds = ref<Set<string>>(new Set())
const isLoading = ref(false)
const error = ref<string | null>(null)

async function fetchFolders(): Promise<void> {
  isLoading.value = true
  error.value = null
  try {
    const { data, error: apiError } = await api.api.nodes.folder.get()
    if (apiError) {
      error.value = extractApiErrorMessage(apiError, 'Failed to load folders.')
      return
    }
    folders.value = (data ?? []) as unknown as Node[]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}

function handleSelect(folder: Node): void {
  emit('select', folder)
}

function handleToggle(folderId: string): void {
  const next = new Set(expandedIds.value)
  if (next.has(folderId)) {
    next.delete(folderId)
  } else {
    next.add(folderId)
  }
  expandedIds.value = next
}

function expandToSelected(folderList: Node[], targetId: string): boolean {
  for (const folder of folderList) {
    if (folder.id === targetId) {
      return true
    }
    if (folder.children && folder.children.length > 0) {
      const found = expandToSelected(folder.children, targetId)
      if (found) {
        expandedIds.value.add(folder.id)
        return true
      }
    }
  }
  return false
}

function findFolderById(folderList: Node[], targetId: string): Node | null {
  for (const folder of folderList) {
    if (folder.id === targetId) {
      return folder
    }
    if (folder.children && folder.children.length > 0) {
      const found = findFolderById(folder.children, targetId)
      if (found) {
        return found
      }
    }
  }
  return null
}

function getFolderById(id: string): Node | null {
  return findFolderById(folders.value, id)
}

watch(
  () => props.selectedId,
  (newId) => {
    if (newId) {
      expandToSelected(folders.value, newId)
    }
  }
)

onMounted(() => {
  void fetchFolders()
})

defineExpose({
  refresh: fetchFolders,
  getFolderById
})
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="isLoading" class="p-4 text-center text-sm text-gray-500">
      Loading folders...
    </div>
    <div v-else-if="error" class="p-4 text-sm text-red-600">
      {{ error }}
    </div>
    <ul v-else class="space-y-0.5 p-2">
      <FolderTreeItem
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        @select="handleSelect"
        @toggle="handleToggle"
      />
    </ul>
  </div>
</template>
