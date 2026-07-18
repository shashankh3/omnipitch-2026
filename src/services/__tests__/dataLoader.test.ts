import { describe, it, expect } from 'vitest';
import { STADIUM_ZONES, FACILITIES, INCIDENT_SEED, MOCK_TELEMETRY } from '../dataLoader';

describe('DataLoader', () => {
  it('STADIUM_ZONES has at least 24 entries', () => {
    expect(STADIUM_ZONES.length).toBeGreaterThanOrEqual(24);
  });

  it('FACILITIES has at least 10 entries', () => {
    expect(FACILITIES.length).toBeGreaterThanOrEqual(10);
  });

  it('Every facility has a zoneId that exists in STADIUM_ZONES', () => {
    const zoneIds = STADIUM_ZONES.map((z) => z.id);
    FACILITIES.forEach((f) => {
      expect(zoneIds).toContain(f.zoneId);
    });
  });

  it('INCIDENT_SEED has no entry with timestamp === "SEED"', () => {
    INCIDENT_SEED.forEach((inc) => {
      expect(inc.timestamp).not.toBe('SEED');
    });
  });

  it('All crowd base levels are: low | medium | high | critical', () => {
    const levels = ['low', 'medium', 'high', 'critical'];
    FACILITIES.forEach((f) => {
      expect(levels).toContain(f.crowdBaseLevel);
    });
  });

  it('MOCK_TELEMETRY.baseline has all required keys', () => {
    const keys = Object.keys(MOCK_TELEMETRY.baseline);
    expect(keys).toContain('wbgtTemperature');
    expect(keys).toContain('gateThroughput');
    expect(keys).toContain('transitDelays');
    expect(keys).toContain('concessionInventory');
    expect(keys).toContain('crowdDensity');
  });
});
