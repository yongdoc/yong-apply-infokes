<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'

interface Props {
  folder: Node
  selectedFolderId: string | null
  expandedIds: Set<string>
  level?: number
  isSelectable: (folder: Node) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle', folderId: string): void
  (e: 'select', folderId: string): void
}>()

defineOptions({
  name: 'MoveNodeTreeItem'
})

const level = props.level ?? 0
const paddingLeft = `${12 + level * 16}px`

const isExpanded = computed(() => props.expandedIds.has(props.folder.id))
const canSelect = computed(() => props.isSelectable(props.folder))

function handleToggle(): void {
  emit('toggle', props.folder.id)
}

function handleSelect(): void {
  if (!canSelect.value) return
  emit('select', props.folder.id)
}
</script>

<template>
  <li>
    <div
      class="flex items-center rounded-md"
      :class="canSelect ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'"
      :style="{ paddingLeft }"
    >
      <button
        v-if="folder.children && folder.children.length > 0"
        type="button"
        class="mr-1 p-1 text-gray-500 hover:text-gray-700"
        @click.stop="handleToggle"
      >
        <svg
          class="h-3 w-3 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <span v-else class="mr-1 w-5"></span>

      <button
        type="button"
        class="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
        :class="selectedFolderId === folder.id ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
        :disabled="!canSelect"
        @click="handleSelect"
      >
        <svg class="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        {{ folder.name }}
      </button>
    </div>

    <ul v-if="isExpanded && folder.children && folder.children.length > 0" class="space-y-1">
      <MoveNodeTreeItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-folder-id="selectedFolderId"
        :expanded-ids="expandedIds"
        :level="level + 1"
        :is-selectable="isSelectable"
        @select="(childFolder) => emit('select', childFolder)"
        @toggle="(childFolderId) => emit('toggle', childFolderId)"
      />
    </ul>
  </li>
</template>
