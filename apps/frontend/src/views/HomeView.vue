<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/utils/api'
import { extractApiErrorMessage } from '@/utils/api-error'
import type { Node } from '@/types/node'
import Navbar from '@/components/layout/Navbar.vue'
import FolderTree from '@/components/explorer/FolderTree.vue'
import NodeList from '@/components/explorer/NodeList.vue'
import NodeActions from '@/components/explorer/NodeActions.vue'
import SearchPanel from '@/components/explorer/SearchPanel.vue'
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

const isSearching = ref(false)
const searchResults = ref<Node[]>([])
const isLoadingSearch = ref(false)
const searchError = ref<string | null>(null)

const panelTitle = computed(() => {
  if (isSearching.value) return 'Search Results'
  return selectedFolder.value?.name ?? 'No folder selected'
})

async function fetchChildren(folderId: string): Promise<void> {
  isLoadingChildren.value = true
  childrenError.value = null
  try {
    const { data, error: apiError } = await api.api.nodes({ id: folderId }).children.get()
    if (apiError) {
      childrenError.value = extractApiErrorMessage(apiError, 'Failed to load folder contents.')
      return
    }
    children.value = (data ?? []) as unknown as Node[]
  } catch (err) {
    childrenError.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoadingChildren.value = false
  }
}

function clearSearch(): void {
  isSearching.value = false
  searchResults.value = []
  isLoadingSearch.value = false
  searchError.value = null
}

function handleSelectFolder(folder: Node): Promise<void> {
  clearSearch()
  selectedFolder.value = folder
  return fetchChildren(folder.id)
}

async function handleSearch(q: string): Promise<void> {
  isSearching.value = true
  isLoadingSearch.value = true
  searchError.value = null
  selectedFolder.value = null
  children.value = []
  try {
    const { data, error: apiError } = await api.api.nodes.search.get({ query: {q} })
    if (apiError) {
      searchError.value = extractApiErrorMessage(apiError, 'Search failed.')
      searchResults.value = []
      return
    }
    searchResults.value = (data ?? []) as unknown as Node[]
  } catch (err) {
    searchError.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoadingSearch.value = false
  }
}

async function handleSearchResultClick(result: Node): Promise<void> {
  if (result.type === 'folder') {
    await handleSelectFolder(result)
    return
  }
  if (result.parent_id) {
    const parent = folderTreeRef.value?.getFolderById(result.parent_id)
    if (parent) {
      await handleSelectFolder(parent)
      return
    }
  }
  clearSearch()
  selectedFolder.value = null
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
  // If the deleted node is the selected folder, deselect it
  if (selectedFolder.value && selectedFolder.value.id === deletingNode.value?.id) {
    selectedFolder.value = null
    children.value = []
  }
  await refreshData()
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
        <div class="border-b border-gray-200 px-6 py-3">
          <SearchPanel
            class="mb-3"
            @search="handleSearch"
            @clear="clearSearch"
          />
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">{{ panelTitle }}</h2>
            <NodeActions
              v-if="!isSearching && selectedFolder"
              :node="selectedFolder"
              @move="openMoveModal"
              @edit="openEditModal"
              @delete="openDeleteModal"
            />
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <template v-if="isSearching">
            <div class="flex h-full flex-col">
              <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 class="text-sm font-medium text-gray-500">
                  {{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }}
                </h3>
              </div>
              <div class="flex-1 overflow-y-auto p-4">
                <div v-if="isLoadingSearch" class="text-center text-sm text-gray-500">
                  Searching...
                </div>
                <div v-else-if="searchError" class="text-sm text-red-600">
                  {{ searchError }}
                </div>
                <div v-else-if="searchResults.length === 0" class="flex h-full items-center justify-center text-gray-400">
                  No results found
                </div>
                <ul v-else class="space-y-2">
                  <li
                    v-for="result in searchResults"
                    :key="result.id"
                    class="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-purple-300 hover:shadow-sm"
                    @click="handleSearchResultClick(result)"
                  >
                    <div class="flex items-center gap-3">
                      <svg
                        v-if="result.type === 'folder'"
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
                        <p class="font-medium text-gray-900">{{ result.name }}</p>
                        <p class="text-xs text-gray-500">
                          {{ result.type === 'file' ? 'File' : 'Folder' }}
                          <span v-if="result.mime_type"> · {{ result.mime_type }}</span>
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" @click.stop>
                      <NodeActions
                        :node="result"
                        @move="openMoveModal"
                        @edit="openEditModal"
                        @delete="openDeleteModal"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </template>
          <template v-else>
            <NodeList
              :nodes="children"
              :is-loading="isLoadingChildren"
              :error="childrenError"
              :selected-folder-id="selectedFolder?.id ?? null"
              @create="openCreateModal(selectedFolder?.id ?? null)"
              @move="openMoveModal"
              @edit="openEditModal"
              @delete="openDeleteModal"
              @open-folder="handleSelectFolder"
            />
          </template>
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
