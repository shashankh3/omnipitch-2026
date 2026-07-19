import { describe, it, expect, beforeEach } from 'vitest';
import { useIncidentSummary } from '../useIncidentSummary';
import { createPinia, setActivePinia } from 'pinia';
import { useIncidentStore } from '../../store/useIncidentStore';

describe('useIncidentSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('computes summary correctly', () => {
    const store = useIncidentStore();
    store.incidents = [
      { id: '1', type: 'FACILITY_DAMAGE', severity: 'LOW', status: 'OPEN', location: {} as any, description: '', timestamp: '', reportedBy: '' },
      { id: '2', type: 'MEDICAL', severity: 'CRITICAL', status: 'OPEN', location: {} as any, description: '', timestamp: '', reportedBy: '' },
      { id: '3', type: 'FACILITY_DAMAGE', severity: 'CRITICAL', status: 'RESOLVED', location: {} as any, description: '', timestamp: '', reportedBy: '' }
    ];

    const { openCount, criticalCount, byType, all } = useIncidentSummary();
    
    expect(openCount.value).toBe(2);
    expect(criticalCount.value).toBe(2);
    expect(byType.value).toEqual({ FACILITY_DAMAGE: 2, MEDICAL: 1 });
    expect(all.value.length).toBe(3);
  });
});
