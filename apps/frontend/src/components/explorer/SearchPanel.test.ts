import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchPanel from './SearchPanel.vue';

describe('SearchPanel', () => {
  it('emits a trimmed non-empty query when Search is clicked', async () => {
    const wrapper = mount(SearchPanel);

    await wrapper.find('input').setValue('  hello  ');
    await wrapper.findAll('button').find((b) => b.text() === 'Search')?.trigger('click');

    expect(wrapper.emitted('search')).toEqual([['hello']]);
  });

  it('emits search on Enter key', async () => {
    const wrapper = mount(SearchPanel);

    await wrapper.find('input').setValue('docs');
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('search')).toEqual([['docs']]);
  });

  it('emits clear on Escape key', async () => {
    const wrapper = mount(SearchPanel);

    await wrapper.find('input').setValue('docs');
    await wrapper.find('input').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('clear')).toHaveLength(1);
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });

  it('does not emit search for empty or whitespace-only input', async () => {
    const wrapper = mount(SearchPanel);

    await wrapper.find('input').setValue('   ');
    await wrapper.findAll('button').find((b) => b.text() === 'Search')?.trigger('click');

    expect(wrapper.emitted('search')).toBeUndefined();
  });

  it('disables the Search button when input is empty', () => {
    const wrapper = mount(SearchPanel);

    const searchButton = wrapper.findAll('button').find((b) => b.text() === 'Search');
    expect(searchButton?.attributes('disabled')).toBeDefined();
  });

  it('emits clear and resets input when Clear button is clicked', async () => {
    const wrapper = mount(SearchPanel);

    await wrapper.find('input').setValue('something');
    await wrapper.findAll('button').find((b) => b.text() === 'Clear')?.trigger('click');

    expect(wrapper.emitted('clear')).toHaveLength(1);
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });
});