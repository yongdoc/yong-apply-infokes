<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/utils/api'
import type { Node } from '@/types/node'
import Navbar from '@/components/layout/Navbar.vue'
import FolderTree from '@/components/explorer/FolderTree.vue'
import NodeList from '@/components/explorer/NodeList.vue'
import NodeActions from '@/components/explorer/NodeActions.vue'
import CreateNodeModal from '@/components/modals/CreateNodeModal.vue'
import EditNodeModal from '@/components/modals/EditNodeModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import MoveNodeModal from '@/components/modals/MoveNodeModal.vue'

const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null)
const selectedFolder = ref<Node | null>(null)
const children = ref<Node[]>([])
const isLoadingChildren = ref(false)
const childrenError = ref<string | null>(null)

const isCreateModalOpen = ref(false)
const createModalParentId = ref<string | null>(null)

const isEditModalOpen = ref(false)
const editingNode = ref<Node | null>(null)

const isDeleteModalOpen = ref(false)
const deletingNode = ref<Node | null>(null)

const isMoveModalOpen = ref(false)
const movingNode = ref<Node | null>(null)

const panelTitle = computed(() => selectedFolder.value?.name ?? 'No folder selected')

async function fetchChildren(folderId: string): Promise<void> {
  isLoadingChildren.value = true
  childrenError.value = null
  try {
    const { data, error: apiError } = await api.api.nodes({ id: folderId }).children.get()
    if (apiError) {
      childrenError.value = typeof apiError === 'object' && apiError !== null && 'message' in apiError
        ? String(apiError.message)
        : 'Failed to load folder contents.'
      return
    }
    children.value = (data ?? []) as unknown as Node[]
  } catch (err) {
    childrenError.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoadingChildren.value = false
  }
}

function handleSelectFolder(folder: Node): Promise<void> {
  selectedFolder.value = folder
  return fetchChildren(folder.id)
}

function openCreateModal(parentId: string | null): void {
  createModalParentId.value = parentId
  isCreateModalOpen.value = true
}

function closeCreateModal(): void {
  isCreateModalOpen.value = false
}

function openEditModal(node: Node): void {
  editingNode.value = node
  isEditModalOpen.value = true
}

function closeEditModal(): void {
  isEditModalOpen.value = false
  editingNode.value = null
}

function openDeleteModal(node: Node): void {
  deletingNode.value = node
  isDeleteModalOpen.value = true
}

function closeDeleteModal(): void {
  isDeleteModalOpen.value = false
  deletingNode.value = null
}

function openMoveModal(node: Node): void {
  movingNode.value = node
  isMoveModalOpen.value = true
}

function closeMoveModal(): void {
  isMoveModalOpen.value = false
  movingNode.value = null
}

async function refreshData(): Promise<void> {
  await folderTreeRef.value?.refresh()
  if (selectedFolder.value) {
    await fetchChildren(selectedFolder.value.id)
  }
}

function handleCreated(): void {
  void refreshData()
}

function handleUpdated(updatedNode: Node): void {
  if (selectedFolder.value && selectedFolder.value.id === updatedNode.id) {
    selectedFolder.value = { ...selectedFolder.value, ...updatedNode }
  }
  void refreshData()
}

async function handleDeleted(): Promise<void> {
  await refreshData()
  // If the deleted node is the selected folder, deselect it
  if (selectedFolder.value && selectedFolder.value.id === deletingNode.value?.id) {
    selectedFolder.value = null
    children.value = []
  }
}

async function handleMoved(): Promise<void> {
  await refreshData()
}

onMounted(() => {
  void folderTreeRef.value?.refresh()
})
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50">
    <Navbar />

    <main class="flex flex-1 overflow-hidden">
      <!-- Left Panel -->
      <aside class="flex w-72 flex-col border-r border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-4 py-3">
          <div class="flex items-center justify-between">
            <h2 class="font-medium text-gray-900">Folders</h2>
            <button
              type="button"
              class="rounded-lg bg-purple-600 px-2.5 py-1 text-sm text-white hover:bg-purple-700"
              @click="openCreateModal(null)"
            >
              + New
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <FolderTree
            ref="folderTreeRef"
            :selected-id="selectedFolder?.id ?? null"
            @select="handleSelectFolder"
          />
        </div>
      </aside>

      <!-- Right Panel -->
      <section class="flex flex-1 flex-col overflow-hidden bg-white">
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <h2 class="text-lg font-semibold text-gray-900">{{ panelTitle }}</h2>
          <NodeActions
            v-if="selectedFolder"
            :node="selectedFolder"
            @move="openMoveModal"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>
        <div class="flex-1 overflow-hidden">
          <NodeList
            :nodes="children"
            :is-loading="isLoadingChildren"
            :error="childrenError"
            :selected-folder-id="selectedFolder?.id ?? null"
            @create="openCreateModal(selectedFolder?.id ?? null)"
            @move="openMoveModal"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>
      </section>
    </main>

    <CreateNodeModal
      :is-open="isCreateModalOpen"
      :parent-id="createModalParentId"
      @close="closeCreateModal"
      @created="handleCreated"
    />

    <EditNodeModal
      :is-open="isEditModalOpen"
      :node="editingNode"
      @close="closeEditModal"
      @updated="handleUpdated"
    />

    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :node="deletingNode"
      @close="closeDeleteModal"
      @deleted="handleDeleted"
    />

    <MoveNodeModal
      :is-open="isMoveModalOpen"
      :node="movingNode"
      @close="closeMoveModal"
      @moved="handleMoved"
    />
  </div>
</template>
