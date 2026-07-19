import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AiCommandConsole from '../AiCommandConsole.vue';
import * as deepseekService from '../../../services/deepseek';

vi.mock('../../../services/deepseek', () => ({
  getOrganizerRecommendation: vi.fn(),
  translateAnnouncement: vi.fn(),
  getSentimentAnalysis: vi.fn()
}));

describe('AiCommandConsole.vue', () => {
  it('recommendation renders', async () => {
    setActivePinia(createPinia());
    const mockRec = vi.mocked(deepseekService.getOrganizerRecommendation);
    mockRec.mockResolvedValueOnce('Deploy additional staff to Gate B');

    const wrapper = mount(AiCommandConsole);
    
    await wrapper.find('input[type="text"]').setValue('What should I do?');
    await wrapper.find('form').trigger('submit');
    
    await new Promise(r => setTimeout(r, 50));
    await wrapper.vm.$nextTick();

    expect(mockRec).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Deploy additional staff to Gate B');
  });

  it('handles /broadcast command', async () => {
    setActivePinia(createPinia());
    const mockTranslate = vi.mocked(deepseekService.translateAnnouncement);
    mockTranslate.mockResolvedValueOnce('FR: Bonjour');

    const wrapper = mount(AiCommandConsole);
    
    await wrapper.find('input[type="text"]').setValue('/broadcast Hello');
    await wrapper.find('form').trigger('submit');
    
    await new Promise(r => setTimeout(r, 50));
    await wrapper.vm.$nextTick();

    expect(mockTranslate).toHaveBeenCalledWith('Hello');
    expect(wrapper.text()).toContain('FR: Bonjour');
  });

  it('handles /sentiment command', async () => {
    setActivePinia(createPinia());
    const mockSentiment = vi.mocked(deepseekService.getSentimentAnalysis);
    mockSentiment.mockResolvedValueOnce('Vibe is positive');

    const wrapper = mount(AiCommandConsole);
    
    await wrapper.find('input[type="text"]').setValue('/sentiment');
    await wrapper.find('form').trigger('submit');
    
    await new Promise(r => setTimeout(r, 50));
    await wrapper.vm.$nextTick();

    expect(mockSentiment).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Vibe is positive');
  });

  it('handles error in askAI gracefully', async () => {
    setActivePinia(createPinia());
    const mockRec = vi.mocked(deepseekService.getOrganizerRecommendation);
    mockRec.mockRejectedValueOnce(new Error('Network failure'));

    const wrapper = mount(AiCommandConsole);
    
    await wrapper.find('input[type="text"]').setValue('What should I do?');
    await wrapper.find('form').trigger('submit');
    
    await new Promise(r => setTimeout(r, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('System timeout.');
  });
});
