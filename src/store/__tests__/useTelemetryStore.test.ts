import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTelemetryStore } from '../useTelemetryStore';
import { MOCK_TELEMETRY } from '../../services/dataLoader';

describe('useTelemetryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('loadBaseline() sets telemetry to baseline values from JSON', () => {
    const store = useTelemetryStore();
    store.loadBaseline();
    expect(store.telemetry.wbgtTemperature).toBe(MOCK_TELEMETRY.baseline.wbgtTemperature);
    expect(store.telemetry.gateThroughput).toEqual(MOCK_TELEMETRY.baseline.gateThroughput);
  });

  it('startSimulation(60) -> crowdDensity values are multiplied correctly', () => {
    const store = useTelemetryStore();
    store.startSimulation(60);
    expect(store.isSimulating).toBe(true);
    expect(store.minutesToKickoff).toBe(60);
    // the multiplier is 0.6
    expect(store.telemetry.crowdDensity['North Stand']).toBe(Math.round(MOCK_TELEMETRY.baseline.crowdDensity['North Stand'] * 0.6));
  });

  it('startSimulation(0) -> crowdDensity at max (1.0 multiplier)', () => {
    const store = useTelemetryStore();
    store.startSimulation(0);
    expect(store.telemetry.crowdDensity['North Stand']).toBe(MOCK_TELEMETRY.baseline.crowdDensity['North Stand']);
  });

  it('startSimulation(90) -> crowdDensity at minimum (0.3 multiplier)', () => {
    const store = useTelemetryStore();
    store.startSimulation(90);
    expect(store.telemetry.crowdDensity['North Stand']).toBe(Math.round(MOCK_TELEMETRY.baseline.crowdDensity['North Stand'] * 0.3));
  });

  it('same minutesToKickoff always gives same telemetry (deterministic)', () => {
    const store1 = useTelemetryStore();
    store1.startSimulation(45);
    const t1 = { ...store1.telemetry, timestamp: undefined };

    const store2 = useTelemetryStore();
    store2.startSimulation(45);
    const t2 = { ...store2.telemetry, timestamp: undefined };

    expect(t1).toEqual(t2);
  });

  it('no Math.random() called during simulation', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    const store = useTelemetryStore();
    store.startSimulation(60);
    
    vi.advanceTimersByTime(20000); // Wait 20 seconds, simulation should update
    
    expect(randomSpy).not.toHaveBeenCalled();
  });
  it('stops simulation on stopSimulation', () => {
    const store = useTelemetryStore();
    store.startSimulation(90);
    expect(store.isSimulating).toBe(true);
    store.stopSimulation();
    expect(store.isSimulating).toBe(false);
  });

  it('updates telemetry on updateFromSupabase', () => {
    const store = useTelemetryStore();
    
    store.updateFromSupabase({ wbgtTemperature: 40 });
    
    expect(store.telemetry.wbgtTemperature).toBe(40);
  });
});
