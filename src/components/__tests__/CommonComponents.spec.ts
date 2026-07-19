import { describe, it, expect, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import AIAssistantModal from '../common/AIAssistantModal.vue';
import BaseButton from '../common/BaseButton.vue';
import BaseCard from '../common/BaseCard.vue';
import LanguageSelector from '../common/LanguageSelector.vue';
import OmniLogo from '../common/OmniLogo.vue';

// Mock matchMedia for any component that might use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Common Components', () => {
  it('mounts AIAssistantModal', () => {
    const wrapper = mount(AIAssistantModal, {
      props: { isOpen: true, title: 'Test Modal' },
      global: {
        plugins: [createPinia()],
        stubs: { Teleport: true }
      }
    });
    expect(wrapper.exists()).toBe(true);
    // trigger close
    const closeBtn = wrapper.find('.close-btn');
    if (closeBtn.exists()) {
      closeBtn.trigger('click');
    }
  });

  it('mounts BaseButton', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts BaseCard', () => {
    const wrapper = mount(BaseCard, {
      props: { title: 'Test Card' }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts LanguageSelector', () => {
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [createPinia(), createI18n({ legacy: false, locale: 'en' })],
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts OmniLogo', () => {
    const wrapper = mount(OmniLogo);
    expect(wrapper.exists()).toBe(true);
  });
});
