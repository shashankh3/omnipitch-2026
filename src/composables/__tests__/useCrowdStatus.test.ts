import { describe, it, expect, beforeEach } from 'vitest';
import { useCrowdStatus } from '../useCrowdStatus';
import { createPinia, setActivePinia } from 'pinia';
import { useTelemetryStore } from '../../store/useTelemetryStore';

describe('useCrowdStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('computes low status', () => {
    const store = useTelemetryStore();
    store.telemetry.crowdDensity['Gate A'] = 20;
    const { density, level, color, label } = useCrowdStatus('Gate A');
    expect(density.value).toBe(20);
    expect(level.value).toBe('low');
    expect(color.value).toBe('#10b981');
    expect(label.value).toBe('●○○ Low');
  });

  it('computes medium status', () => {
    const store = useTelemetryStore();
    store.telemetry.crowdDensity['Gate B'] = 50;
    const { level, color, label } = useCrowdStatus('Gate B');
    expect(level.value).toBe('medium');
    expect(color.value).toBe('#f59e0b');
    expect(label.value).toBe('●●○ Busy');
  });

  it('computes high status', () => {
    const store = useTelemetryStore();
    store.telemetry.crowdDensity['Gate C'] = 80;
    const { level, color, label } = useCrowdStatus('Gate C');
    expect(level.value).toBe('high');
    expect(color.value).toBe('#ef4444');
    expect(label.value).toBe('●●● High');
  });

  it('computes critical status', () => {
    const store = useTelemetryStore();
    store.telemetry.crowdDensity['Gate D'] = 95;
    const { level, color, label } = useCrowdStatus('Gate D');
    expect(level.value).toBe('critical');
    expect(color.value).toBe('#7c3aed');
    expect(label.value).toBe('⚠ Critical');
  });

  it('defaults to 0 for unknown zones', () => {
    const { density, level } = useCrowdStatus('Unknown');
    expect(density.value).toBe(0);
    expect(level.value).toBe('low');
  });
});
