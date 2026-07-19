import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LanguageSelector from '../LanguageSelector.vue';
import { useStadiumStore } from '../../../store/useStadiumStore';
import { createI18n } from 'vue-i18n';

describe('LanguageSelector.vue', () => {
  const i18n = createI18n({ legacy: false, locale: 'en' });

  it('renders and toggles dropdown', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(LanguageSelector, {
      global: { plugins: [i18n] }
    });
    
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('changes language on select', async () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    
    const wrapper = mount(LanguageSelector, {
      global: { plugins: [i18n] }
    });
    
    await wrapper.find('button').trigger('click');
    
    const esOption = wrapper.findAll('[role="option"]').filter(node => node.text() === 'es').at(0);
    await esOption?.trigger('click');
    
    expect(store.currentSession?.language).toBe('es');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('closes when clicking outside', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(LanguageSelector, {
      global: { plugins: [i18n] }
    });
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    
    // Dispatch document click to trigger handleClickOutside
    document.dispatchEvent(new Event('click'));
    
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });
});
