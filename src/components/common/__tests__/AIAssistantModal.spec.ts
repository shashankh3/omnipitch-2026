import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import AIAssistantModal from '../AIAssistantModal.vue';

describe('AIAssistantModal.vue', () => {
  const mountOptions = {
    global: {
      stubs: {
        teleport: true
      }
    }
  };

  it('does not render when isOpen is false', () => {
    const wrapper = mount(AIAssistantModal, {
      ...mountOptions,
      props: {
        isOpen: false,
        title: 'AI Assistant'
      }
    });
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders correctly when isOpen is true', () => {
    const wrapper = mount(AIAssistantModal, {
      ...mountOptions,
      props: {
        isOpen: true,
        title: 'AI Assistant'
      },
      slots: {
        default: '<div class="test-content">Slot Content</div>'
      }
    });
    
    const overlay = wrapper.find('.modal-overlay');
    expect(overlay.exists()).toBe(true);
    expect(wrapper.text()).toContain('AI Assistant');
    expect(wrapper.text()).toContain('Slot Content');
  });

  it('emits close on background click', async () => {
    const wrapper = mount(AIAssistantModal, {
      ...mountOptions,
      props: {
        isOpen: true,
        title: 'AI Assistant'
      }
    });

    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close on close button click', async () => {
    const wrapper = mount(AIAssistantModal, {
      ...mountOptions,
      props: {
        isOpen: true,
        title: 'AI Assistant'
      }
    });

    await wrapper.find('.close-btn').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close on escape key', async () => {
    const wrapper = mount(AIAssistantModal, {
      ...mountOptions,
      props: {
        isOpen: true,
        title: 'AI Assistant'
      }
    });

    await wrapper.find('.modal-overlay').trigger('keydown.esc');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
