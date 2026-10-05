<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'

interface Props {
  folder: Node
  selectedId: string | null
  expandedIds: Set<string>
  level?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', folder: Node): void
  (e: 'toggle', folderId: string): void
}>()

defineOptions({
  name: 'FolderTreeItem'
})

const level = props.level ?? 0
const paddingLeft = `${level * 12}px`
const isExpanded = computed(() => props.expandedIds.has(props.folder.id))
const isSelected = computed(() => props.selectedId === props.folder.id)
const hasChildren = computed(() => (props.folder.children ?? []).length > 0)

function handleToggle(event: MouseEvent): void {
  event.stopPropagation()
  emit('toggle', props.folder.id)
}

function handleSelect(): void {
  emit('select', props.folder)
}
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors"
      :class="isSelected ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'"
      :style="{ paddingLeft }"
      @click="handleSelect"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        @click="handleToggle"
      >
        <svg
          class="h-3.5 w-3.5 transition-transform"
          :class="isExpanded ? 'rotate-90' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <span v-else class="w-5"></span>

      <svg
        v-if="isExpanded"
        class="h-4 w-4 text-yellow-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
      </svg>
      <svg
        v-else
        class="h-4 w-4 text-yellow-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>

      <span class="truncate">{{ folder.name }}</span>
    </button>

    <ul v-if="isExpanded && hasChildren" class="space-y-0.5">
      <FolderTreeItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        :level="level + 1"
        @select="(childFolder) => emit('select', childFolder)"
        @toggle="(childFolderId) => emit('toggle', childFolderId)"
      />
    </ul>
  </li>
</template>
