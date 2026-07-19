import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ConciergeChat from '../ConciergeChat.vue';
import * as geminiService from '../../../services/gemini';
import { i18n } from '../../../i18n';

vi.mock('../../../services/gemini', () => ({
  getFanAssistance: vi.fn()
}));

describe('ConciergeChat.vue', () => {
  it('renders initial welcome message', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(ConciergeChat, {
      global: { plugins: [i18n] }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Welcome to OmniPitch');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('sends a message and calls the API', async () => {
    setActivePinia(createPinia());
    const getFanAssistanceMock = vi.mocked(geminiService.getFanAssistance);
    getFanAssistanceMock.mockResolvedValueOnce('Here is your navigation route.');

    const wrapper = mount(ConciergeChat, {
      global: { plugins: [i18n] }
    });
    const input = wrapper.find('input[type="text"]');
    
    await input.setValue('Where is gate A?');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Where is gate A?');
    expect(getFanAssistanceMock).toHaveBeenCalled();
  });
  it('sends a message and handles API error bubble', async () => {
    setActivePinia(createPinia());
    const getFanAssistanceMock = vi.mocked(geminiService.getFanAssistance);
    getFanAssistanceMock.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(ConciergeChat, {
      global: { plugins: [i18n] }
    });
    
    await wrapper.find('input[type="text"]').setValue('Where is gate A?');
    await wrapper.find('form').trigger('submit');
    
    // allow promises to resolve
    await new Promise(r => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Network error');
  });
});
