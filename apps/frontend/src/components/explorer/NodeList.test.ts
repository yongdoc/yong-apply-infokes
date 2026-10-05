import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NodeList from './NodeList.vue';
import type { Node } from '@/types/node';

const fileNode: Node = {
  id: 'n1',
  name: 'report.pdf',
  type: 'file',
  parent_id: 'f1',
  file_size_bytes: 2048,
  mime_type: 'application/pdf',
};

const folderNode: Node = {
  id: 'n2',
  name: 'Documents',
  type: 'folder',
  parent_id: 'f1',
};

describe('NodeList', () => {
  it('shows the placeholder when no folder is selected', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: false,
        error: null,
        selectedFolderId: null,
      },
    });

    expect(wrapper.text()).toContain('Select a folder from the left panel');
  });

  it('shows loading state', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: true,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    expect(wrapper.text()).toContain('Loading contents');
  });

  it('shows error state', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: false,
        error: 'Failed to load.',
        selectedFolderId: 'f1',
      },
    });

    expect(wrapper.text()).toContain('Failed to load.');
  });

  it('shows empty state', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: false,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    expect(wrapper.text()).toContain('This folder is empty');
  });

  it('renders nodes and emits open-folder for folder rows', async () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [folderNode, fileNode],
        isLoading: false,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('report.pdf');

    const rows = wrapper.findAll('li');
    await rows[0]?.trigger('click');

    expect(wrapper.emitted('open-folder')).toHaveLength(1);
    expect(wrapper.emitted('open-folder')?.[0]).toEqual([folderNode]);
  });

  it('does not emit open-folder when a file row is clicked', async () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [fileNode],
        isLoading: false,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    await wrapper.find('li').trigger('click');

    expect(wrapper.emitted('open-folder')).toBeUndefined();
  });

  it('formats file sizes', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [fileNode],
        isLoading: false,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    expect(wrapper.text()).toContain('2 KB');
  });

  it('emits create when the new item button is clicked', async () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: false,
        error: null,
        selectedFolderId: 'f1',
      },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('create')).toHaveLength(1);
  });

  it('disables the create button when no folder is selected', () => {
    const wrapper = mount(NodeList, {
      props: {
        nodes: [],
        isLoading: false,
        error: null,
        selectedFolderId: null,
      },
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
