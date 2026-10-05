import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NodeActions from './NodeActions.vue';
import type { Node } from '@/types/node';

const node: Node = {
  id: 'n1',
  name: 'file.txt',
  type: 'file',
  parent_id: 'p1',
};

describe('NodeActions', () => {
  it('emits move with the node when move button is clicked', async () => {
    const wrapper = mount(NodeActions, { props: { node } });

    await wrapper.find('[title="Move"]').trigger('click');

    expect(wrapper.emitted('move')).toHaveLength(1);
    expect(wrapper.emitted('move')?.[0]).toEqual([node]);
  });

  it('emits edit with the node when edit button is clicked', async () => {
    const wrapper = mount(NodeActions, { props: { node } });

    await wrapper.find('[title="Edit"]').trigger('click');

    expect(wrapper.emitted('edit')).toHaveLength(1);
    expect(wrapper.emitted('edit')?.[0]).toEqual([node]);
  });

  it('emits delete with the node when delete button is clicked', async () => {
    const wrapper = mount(NodeActions, { props: { node } });

    await wrapper.find('[title="Delete"]').trigger('click');

    expect(wrapper.emitted('delete')).toHaveLength(1);
    expect(wrapper.emitted('delete')?.[0]).toEqual([node]);
  });
});
