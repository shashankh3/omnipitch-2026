import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFanAssistance } from '../../src/services/gemini';
import { useStadiumStore } from '../../src/store/useStadiumStore';
import { createPinia, setActivePinia } from 'pinia';
import { MOCK_STADIUM_STATE } from '../../src/data/mockTelemetry';

describe('geminiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn());
  });

  const telemetry = MOCK_STADIUM_STATE.telemetry;

  it('On 200 response -> returns parsed AI text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: 'Hello from AI' })
    } as any);

    const res = await getFanAssistance('Hello', 'en', telemetry, false);
    expect(res).toBe('Hello from AI');
  });

  it('On 429 response -> returns 429 message, no throw', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({})
    } as any);

    const res = await getFanAssistance('where is exit', 'en', telemetry, false);
    expect(res).toBe('The AI is busy, try again in a minute');
  });

  it('On 401 response -> returns unavailable message, no throw', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({})
    } as any);

    const res = await getFanAssistance('where is exit', 'en', telemetry, false);
    expect(res).toBe('AI service temporarily unavailable');
  });

  it('On network error (fetch throws) -> returns unavailable message, no throw', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const res = await getFanAssistance('where is exit', 'en', telemetry, false);
    expect(res).toBe('AI service temporarily unavailable');
  });

  it('When isOfflineMode=true -> never calls fetch, uses offline engine', async () => {
    const store = useStadiumStore();
    store.setOfflineMode(true);
    
    const res = await getFanAssistance('where is exit', 'en', telemetry, false);
    expect(res.toLowerCase()).toContain('exit');
    expect(fetch).not.toHaveBeenCalled();
  });
});
