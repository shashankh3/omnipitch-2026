import { describe, it, expect, beforeEach } from 'vitest';
import { useProactiveAlerts } from '../useProactiveAlerts';
import { createPinia, setActivePinia } from 'pinia';
import { useSystemStore } from '../../store/useSystemStore';

describe('useProactiveAlerts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('exposes visibleAlerts and dismiss function', () => {
    const { visibleAlerts, dismiss } = useProactiveAlerts();
    expect(visibleAlerts.value).toEqual([]);
    expect(typeof dismiss).toBe('function');
  });

  it('dismiss removes the alert from the store', () => {
    const store = useSystemStore();
    store.$patch({
      proactiveAlerts: [
        { id: '1', ruleId: 'heat_hazard', severity: 'HIGH', audience: 'ALL', message: { en: 'Heat Hazard', es: '', fr: '', de: '' }, timestamp: '2026-07-07T12:00:00Z', dismissed: false }
      ]
    });
    
    const { visibleAlerts, dismiss } = useProactiveAlerts();
    expect(visibleAlerts.value.length).toBe(1);
    
    dismiss('1');
    expect(visibleAlerts.value.length).toBe(0);
    expect(store.proactiveAlerts[0].dismissed).toBe(true);
  });

  it('dismisses alerts correctly', () => {
    const sysStore = useSystemStore();
    sysStore.proactiveAlerts = [
      { id: '1', zoneId: 'z1', intent: 'test', mode: 'HIGH', timestamp: '2026', dismissed: false, audience: 'ALL', severity: 'HIGH' }
    ];

    const { visibleAlerts, dismiss } = useProactiveAlerts();
    expect(visibleAlerts.value.length).toBe(1);

    dismiss('1');
    expect(visibleAlerts.value.length).toBe(0);
  });

  it('computes criticalCount correctly', () => {
    const sysStore = useSystemStore();
    sysStore.proactiveAlerts = [
      { id: '1', zoneId: 'z1', intent: 'test', mode: 'CRITICAL', timestamp: '2026', dismissed: false, audience: 'ALL', severity: 'CRITICAL' },
      { id: '2', zoneId: 'z2', intent: 'test', mode: 'HIGH', timestamp: '2026', dismissed: false, audience: 'ALL', severity: 'HIGH' }
    ];

    const { criticalCount } = useProactiveAlerts();
    expect(criticalCount.value).toBe(1);
  });
});
