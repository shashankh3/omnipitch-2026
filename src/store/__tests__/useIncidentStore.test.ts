import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useIncidentStore } from '../useIncidentStore';
import { INCIDENT_SEED } from '../../services/dataLoader';
import { supabase } from '../../services/supabase';

vi.mock('../../services/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      send: vi.fn(),
      on: vi.fn().mockReturnValue({
        subscribe: vi.fn()
      })
    })
  }
}));

describe('useIncidentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadSeed() populates incidents from INCIDENT_SEED', () => {
    const store = useIncidentStore();
    store.loadSeed();
    expect(store.incidents.length).toBe(INCIDENT_SEED.length);
  });

  it('addIncident() generates a UUID id (not random string)', () => {
    const store = useIncidentStore();
    store.addIncident({
      reportedBy: 'test',
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] },
      type: 'MEDICAL',
      severity: 'LOW',
      description: 'Test',
      status: 'OPEN'
    });
    
    expect(store.incidents.length).toBe(INCIDENT_SEED.length + 1);
    const incident = store.incidents.find(i => i.reportedBy === 'test')!;
    expect(incident.id).toMatch(/^inc_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('receiveFromBroadcast() deduplicates on id field', () => {
    const store = useIncidentStore();
    const inc = {
      id: 'inc_123',
      timestamp: '2026-07-14T00:00:00Z',
      reportedBy: 'test',
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] } as any,
      type: 'MEDICAL' as any,
      severity: 'LOW' as any,
      description: 'Test',
      status: 'OPEN' as any
    };
    store.receiveFromBroadcast(inc);
    expect(store.incidents.length).toBe(INCIDENT_SEED.length + 1);
    
    // Receive same incident again
    store.receiveFromBroadcast(inc);
    expect(store.incidents.length).toBe(INCIDENT_SEED.length + 1); // Deduplicated
  });

  it('updateIncidentStatus() changes status of correct incident only', () => {
    const store = useIncidentStore();
    store.incidents.push({
      id: 'inc_1',
      timestamp: '2026-07-14T00:00:00Z',
      reportedBy: 'test',
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] },
      type: 'MEDICAL',
      severity: 'LOW',
      description: 'Test',
      status: 'OPEN'
    });
    
    store.updateIncidentStatus('inc_1', 'RESOLVED');
    expect(store.incidents.find(i => i.id === 'inc_1')!.status).toBe('RESOLVED');
  });

  it('initRealtime() subscribes and pushes new incidents', () => {
    const store = useIncidentStore();
    store.incidents = [];

    let onCallback: (msg: { payload: any }) => void = () => {};
    const mockChannel = {
      send: vi.fn(),
      on: vi.fn().mockImplementation((_event: any, _filter: any, callback: any) => {
        onCallback = callback;
        return { subscribe: vi.fn() };
      })
    };
    
    // override the mock for this test
    (supabase.channel as any).mockReturnValueOnce(mockChannel);
    
    store.initRealtime();
    
    const mockIncident = { id: 'inc_realtime', type: 'MEDICAL' };
    onCallback({ payload: { incident: mockIncident } });
    
    expect(store.incidents.length).toBe(1);
    expect(store.incidents[0].id).toBe('inc_realtime');
    
    // sending same again shouldn't duplicate
    onCallback({ payload: { incident: mockIncident } });
    expect(store.incidents.length).toBe(1);
  });

  it('incidents with timestamp SEED get replaced with ISO string in dataLoader', () => {
    // This tests the dataLoader behavior implicitly via the seed
    const store = useIncidentStore();
    store.loadSeed();
    expect(store.incidents[0].timestamp).not.toBe('SEED');
    expect(new Date(store.incidents[0].timestamp).getTime()).not.toBeNaN();
  });
});
