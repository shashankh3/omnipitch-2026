import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHealthStatus } from '../useHealthStatus';
import { createPinia, setActivePinia } from 'pinia';
import { useSystemStore } from '../../store/useSystemStore';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
const TestComponent = defineComponent({
  setup() {
    return useHealthStatus();
  },
  template: '<div></div>'
});

describe('useHealthStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ llm: 'live' })
    }) as any;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });


  it('returns correct badge label and computed states', async () => {
    const store = useSystemStore();
    const wrapper = mount(TestComponent);

    store.llmMode = 'live';
    store.isOfflineMode = false;
    store.lastHealthCheck = '2026-07-19T00:00:00Z';
    await nextTick();
    expect(wrapper.vm.badgeLabel).toBe('🟢 AI Live');
    expect(wrapper.vm.llmMode).toBe('live');
    expect(wrapper.vm.isOffline).toBe(false);
    expect(wrapper.vm.lastCheck).toBe('2026-07-19T00:00:00Z');

    await flushPromises();
    store.llmMode = 'offline';
    store.isOfflineMode = true;
    await nextTick();
    expect(wrapper.vm.badgeLabel).toBe('🟡 AI Offline');
    expect(wrapper.vm.llmMode).toBe('offline');
    expect(wrapper.vm.isOffline).toBe(true);
  });
});
