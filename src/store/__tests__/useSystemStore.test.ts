import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSystemStore } from '../useSystemStore';

describe('useSystemStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('checkHealth() on 200 {llm:"live"} -> llmMode === "live"', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ llm: 'live' })
    } as any);

    const store = useSystemStore();
    await store.checkHealth();
    
    expect(store.llmMode).toBe('live');
    expect(store.isOfflineMode).toBe(false);
  });

  it('checkHealth() on 200 {llm:"offline"} -> llmMode === "offline"', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ llm: 'offline' })
    } as any);

    const store = useSystemStore();
    await store.checkHealth();
    
    expect(store.llmMode).toBe('offline');
    expect(store.isOfflineMode).toBe(false); // API responded, so system is online
  });

  it('checkHealth() on network error -> isOfflineMode === true', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const store = useSystemStore();
    await store.checkHealth();
    
    expect(store.llmMode).toBe('offline');
    expect(store.isOfflineMode).toBe(true);
  });

  it('lastHealthCheck is updated after every call', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ llm: 'live' })
    } as any);

    const store = useSystemStore();
    expect(store.lastHealthCheck).toBeNull();
    
    await store.checkHealth();
    expect(store.lastHealthCheck).not.toBeNull();
  });

  it('startHealthPolling ignores subsequent calls if already polling', () => {
    vi.useFakeTimers();
    const store = useSystemStore();
    
    store.startHealthPolling();
    const spy = vi.spyOn(globalThis, 'setInterval');
    store.startHealthPolling();
    
    expect(spy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('processAlerts adds alerts and respects max length', () => {
    const store = useSystemStore();
    // mock evaluateAlerts? Since it returns [], we can just push directly to test max length
    for (let i = 0; i < 25; i++) {
      store.proactiveAlerts.unshift({ id: `id-${i}`, ruleId: 'heat', severity: 'LOW', message: { en: '', es: '', fr: '', de: '' }, timestamp: '', audience: 'FAN', dismissed: false });
    }
    // processAlerts with empty telemetry doesn't add new, but triggers the slice check
    store.processAlerts({ timestamp: '', wbgtTemperature: 0, gateThroughput: {}, transitDelays: {}, concessionInventory: {}, crowdDensity: {} });
    expect(store.proactiveAlerts.length).toBe(20);
  });

  it('can dismiss a proactive alert', () => {
    const store = useSystemStore();
    store.proactiveAlerts = [
      { id: 'a1', ruleId: 'heat', severity: 'HIGH', audience: 'ALL', message: { en: 'Heat', es: '', fr: '', de: '' }, timestamp: '2026-07-07T12:00:00Z', dismissed: false }
    ];
    store.dismissAlert('a1');
    expect(store.proactiveAlerts[0].dismissed).toBe(true);
  });

  it('checkHealth returns ok and sets llmMode', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ llm: 'live' })
    } as any);
    const store = useSystemStore();
    await store.checkHealth();
    expect(store.llmMode).toBe('live');
    expect(store.isOfflineMode).toBe(false);
  });

  it('checkHealth() updates llmMode from valid response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ llm: 'live' })
    } as any);
    const store = useSystemStore();
    await store.checkHealth();
    expect(store.llmMode).toBe('live');
    expect(store.isOfflineMode).toBe(false);
  });

  it('checkHealth() defaults to offline if llm key is missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    } as any);
    const store = useSystemStore();
    await store.checkHealth();
    expect(store.llmMode).toBe('offline');
  });

  it('checkHealth() throws if res is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as any);
    const store = useSystemStore();
    await store.checkHealth();
    expect(store.isOfflineMode).toBe(true);
    expect(store.llmMode).toBe('offline');
  });

  it('dismissAlert() dismisses an existing alert', () => {
    const store = useSystemStore();
    store.proactiveAlerts = [{ id: 'a1', ruleId: 'heat', severity: 'HIGH', audience: 'ALL', message: { en: 'heat', es: '', fr: '', de: '' }, timestamp: '2026', dismissed: false }];
    store.dismissAlert('a1');
    expect(store.proactiveAlerts[0].dismissed).toBe(true);
  });
});
