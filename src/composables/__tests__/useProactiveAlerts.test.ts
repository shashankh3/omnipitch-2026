import { describe, it, expect, beforeEach } from 'vitest';
import { useProactiveAlerts } from '../useProactiveAlerts';
import { createPinia, setActivePinia } from 'pinia';
import { useSystemStore } from '../../store/useSystemStore';
import { useSessionStore } from '../../store/useSessionStore';

describe('useProactiveAlerts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('exposes visibleAlerts and dismiss function', () => {
    const { visibleAlerts, dismiss } = useProactiveAlerts();
    expect(visibleAlerts.value).toEqual([]);
    expect(typeof dismiss).toBe('function');
  });

  it('handles null session safely and defaults to FAN', () => {
    const sessionStore = useSessionStore();
    sessionStore.currentSession = null;
    const { visibleAlerts } = useProactiveAlerts();
    expect(visibleAlerts.value).toEqual([]);
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
      { id: '1', ruleId: 'z1', message: { en: 'test', es: '', fr: '', de: '' }, severity: 'HIGH', timestamp: '2026', dismissed: false, audience: 'ALL' }
    ];

    const { visibleAlerts, dismiss } = useProactiveAlerts();
    expect(visibleAlerts.value.length).toBe(1);

    dismiss('1');
    expect(visibleAlerts.value.length).toBe(0);
  });

  it('computes criticalCount correctly', () => {
    const sysStore = useSystemStore();
    sysStore.proactiveAlerts = [
      { id: '1', ruleId: 'z1', message: { en: 'test', es: '', fr: '', de: '' }, severity: 'CRITICAL', timestamp: '2026', dismissed: false, audience: 'ALL' },
      { id: '2', ruleId: 'z2', message: { en: 'test', es: '', fr: '', de: '' }, severity: 'HIGH', timestamp: '2026', dismissed: false, audience: 'ALL' }
    ];

    const { criticalCount } = useProactiveAlerts();
    expect(criticalCount.value).toBe(1);
  });
});
