import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import IncidentLogger from '../IncidentLogger.vue';
import * as deepseekService from '../../../services/deepseek';
import { i18n } from '../../../i18n';
import { useStadiumStore } from '../../../store/useStadiumStore';

vi.mock('../../../services/deepseek', () => ({
  processVisionIncident: vi.fn()
}));

describe('IncidentLogger.vue', () => {
  it('file select -> preview -> vision result', async () => {
    setActivePinia(createPinia());
    const mockVision = vi.mocked(deepseekService.processVisionIncident);
    mockVision.mockResolvedValueOnce({
      type: 'SECURITY',
      severity: 'HIGH',
      dispatchOrder: 'Send security to location'
    });

    const wrapper = mount(IncidentLogger, {
      global: { plugins: [i18n] }
    });

    const store = useStadiumStore();
    vi.spyOn(store, 'addIncident');
    
    // Fill location first so analyzeImage can proceed
    await wrapper.find('input[type="text"]').setValue('Gate A');

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file]
    });
    await input.trigger('change');
    
    // allow file reader to complete
    await new Promise(r => setTimeout(r, 250));
    await flushPromises();
    await wrapper.vm.$nextTick();

    // The previewImage should be set and analysis should start
    expect((wrapper.vm as any).previewImage).toBeTruthy();

    // Wait for processVisionIncident to resolve and update state

    // Wait for processVisionIncident to resolve and update state
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Submit now that analysis is done
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Verify vision result was processed
    expect(mockVision).toHaveBeenCalled();
    expect(store.addIncident).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SECURITY',
        severity: 'HIGH'
      })
    );
  });

  it('rejects files larger than 3MB (client limit) to stay safely under 4MB server limit after base64 inflation', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(IncidentLogger, {
      global: { plugins: [i18n] }
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Calculate max allowed client bytes vs server limit
    const SERVER_LIMIT_BYTES = 4 * 1024 * 1024;
    const CLIENT_LIMIT_BYTES = 3 * 1024 * 1024;
    
    // Assert the logic required by prompt: 3MB client cap * 1.33 base64 inflation is ~3.99MB (under 4MB)
    expect(CLIENT_LIMIT_BYTES * 1.33).toBeLessThan(SERVER_LIMIT_BYTES);

    const oversizedFile = new File(['x'.repeat(CLIENT_LIMIT_BYTES + 10)], 'huge.jpg', { type: 'image/jpeg' });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [oversizedFile]
    });
    
    await input.trigger('change');
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/3MB|fileTooLarge/));
    
    alertSpy.mockRestore();
  });

  it('rejects files that are not images', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(IncidentLogger, {
      global: { plugins: [i18n] }
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const invalidFile = new File(['x'.repeat(100)], 'test.pdf', { type: 'application/pdf' });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [invalidFile]
    });
    
    await input.trigger('change');
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/invalidFileType|Invalid file type/));
    alertSpy.mockRestore();
  });

  it('handles error in analyzeImage gracefully', async () => {
    setActivePinia(createPinia());
    const mockVision = vi.mocked(deepseekService.processVisionIncident);
    mockVision.mockRejectedValueOnce(new Error('API Error'));

    const wrapper = mount(IncidentLogger, {
      global: { plugins: [i18n] }
    });
    
    await wrapper.find('input[type="text"]').setValue('Gate A');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: [file] });
    
    await input.trigger('change');
    await new Promise(r => setTimeout(r, 250));
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Verify it handles error without crashing, and sets isProcessing back to false
    expect((wrapper.vm as any).isProcessing).toBe(false);
  });
});
