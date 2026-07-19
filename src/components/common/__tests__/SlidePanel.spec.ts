import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import SlidePanel from '../SlidePanel.vue';

describe('SlidePanel.vue', () => {
  it('renders fab button when showFab is true', async () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: false,
        panelTitle: 'Test Title',
        showFab: true,
        fabLabel: 'Open Test Panel'
      }
    });

    const fab = wrapper.find('button');
    expect(fab.exists()).toBe(true);
    expect(fab.attributes('title')).toBe('Open Test Panel');

    await fab.trigger('click');
    expect(wrapper.emitted('open')).toBeTruthy();
  });

  it('renders overlay when isOpen is true and emits close on backdrop click', async () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: true,
        panelTitle: 'Test Title'
      }
    });

    const backdrop = wrapper.find('.fixed.inset-0.bg-black\\/40');
    expect(backdrop.exists()).toBe(true);
    
    await backdrop.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('applies translate-x-0 class when open', () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: true,
        panelTitle: 'Test Title',
        panelSubtitle: 'Test Subtitle'
      }
    });

    const panel = wrapper.find('[role="dialog"]');
    expect(panel.classes()).toContain('translate-x-0');
    expect(wrapper.text()).toContain('Test Title');
    expect(wrapper.text()).toContain('Test Subtitle');
  });

  it('applies translate-x-full class when closed', () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: false,
        panelTitle: 'Test Title'
      }
    });

    const panel = wrapper.find('[role="dialog"]');
    expect(panel.classes()).toContain('translate-x-full');
  });

  it('emits close when escape is pressed', async () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: true,
        panelTitle: 'Test Title'
      }
    });

    const panel = wrapper.find('[role="dialog"]');
    await panel.trigger('keydown.escape');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(SlidePanel, {
      props: {
        isOpen: true,
        panelTitle: 'Test Title'
      }
    });

    // close button is the one inside the header
    const closeBtn = wrapper.find('header button');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
