import { describe, it, expect } from 'vitest';
import { getSimulatedTelemetry, getCrowdLevel } from '../telemetrySimulator';

describe('telemetrySimulator', () => {
  it('getSimulatedTelemetry(0) and getSimulatedTelemetry(0) return identical objects', () => {
    const t1 = getSimulatedTelemetry(0);
    const t2 = getSimulatedTelemetry(0);
    
    // We expect them to be deeply equal EXCEPT for the timestamp
    // since the simulator calls new Date().toISOString()
    const t1WithoutTimestamp = { ...t1, timestamp: undefined };
    const t2WithoutTimestamp = { ...t2, timestamp: undefined };
    
    expect(t1WithoutTimestamp).toEqual(t2WithoutTimestamp);
  });

  it('getSimulatedTelemetry(90) crowd values < getSimulatedTelemetry(0)', () => {
    const t90 = getSimulatedTelemetry(90);
    const t0 = getSimulatedTelemetry(0);
    
    // Check one key, e.g. "North Stand"
    expect(t90.crowdDensity['North Stand']).toBeLessThan(t0.crowdDensity['North Stand']);
  });

  it('getCrowdLevel(30) === "low"', () => {
    expect(getCrowdLevel(30)).toBe('low');
  });

  it('getCrowdLevel(55) === "medium"', () => {
    expect(getCrowdLevel(55)).toBe('medium');
  });

  it('getCrowdLevel(80) === "high"', () => {
    expect(getCrowdLevel(80)).toBe('high');
  });

  it('getCrowdLevel(95) === "critical"', () => {
    expect(getCrowdLevel(95)).toBe('critical');
  });

  it('all crowd density values are between 0 and 100', () => {
    const t = getSimulatedTelemetry(0);
    Object.values(t.crowdDensity).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });
});
