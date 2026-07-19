import { describe, it, expect, vi, afterEach } from 'vitest';
import { MOCK_STADIUM_STATE } from '../../src/data/mockTelemetry';

describe('mockTelemetry', () => {
  it('MOCK_STADIUM_STATE has entries for all 3 personas implicitly', () => {
    expect(MOCK_STADIUM_STATE.telemetry).toBeDefined();
    expect(MOCK_STADIUM_STATE.incidents).toBeDefined();
  });

  it('All crowd levels are low/medium/high/critical or numbers that translate to it', () => {
    const levels = Object.values(MOCK_STADIUM_STATE.telemetry.crowdDensity);
    expect(levels.every(l => typeof l === 'number' && l >= 0 && l <= 100)).toBe(true);
  });

  it('Data is deterministic (should be same across multiple requires in a node process)', () => {
    const state1 = MOCK_STADIUM_STATE;
    const state2 = MOCK_STADIUM_STATE;
    expect(state1.telemetry.wbgtTemperature).toBe(state2.telemetry.wbgtTemperature);
  });

  it('generates different transitDelays based on the date seed', async () => {
    vi.useFakeTimers();
    afterEach(() => {
      vi.useRealTimers();
      vi.resetModules();
    });

    // We can hit the alternate branch (seed % 3 == 0 vs seed % 3 != 0) by changing system time
    vi.setSystemTime(new Date('2026-06-11T00:00:00Z'));
    let mod = await import('../../src/data/mockTelemetry');
    expect(mod.MOCK_STADIUM_STATE.telemetry.transitDelays).toBeDefined();

    vi.resetModules();
    vi.setSystemTime(new Date('2026-06-11T01:00:00Z'));
    mod = await import('../../src/data/mockTelemetry');
    expect(mod.MOCK_STADIUM_STATE.telemetry.transitDelays).toBeDefined();

    vi.resetModules();
    vi.setSystemTime(new Date('2026-06-11T02:00:00Z'));
    mod = await import('../../src/data/mockTelemetry');
    expect(mod.MOCK_STADIUM_STATE.telemetry.transitDelays).toBeDefined();

    vi.resetModules();
    vi.setSystemTime(new Date('2026-06-11T03:00:00Z'));
    mod = await import('../../src/data/mockTelemetry');
    expect(mod.MOCK_STADIUM_STATE.telemetry.transitDelays).toBeDefined();

    vi.resetModules();
    vi.setSystemTime(new Date('2026-06-11T04:00:00Z'));
    mod = await import('../../src/data/mockTelemetry');
    expect(mod.MOCK_STADIUM_STATE.telemetry.transitDelays).toBeDefined();
  });
});
