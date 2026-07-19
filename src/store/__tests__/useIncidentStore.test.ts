import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useIncidentStore } from '../useIncidentStore';
import { INCIDENT_SEED } from '../../services/dataLoader';
import { supabase } from '../../services/supabase';
import type { Incident } from '../../types';

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
    vi.clearAllMocks();
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
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] as [number, number] },
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
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] as [number, number] },
      type: 'MEDICAL',
      severity: 'LOW',
      description: 'Test',
      status: 'OPEN'
    } as Incident;
    store.receiveFromBroadcast(inc);
    expect(store.incidents.length).toBe(INCIDENT_SEED.length + 1);

    // Receive same incident again
    store.receiveFromBroadcast(inc);
    expect(store.incidents.length).toBe(INCIDENT_SEED.length + 1); // Deduplicated
  });

  it('receiveFromBroadcast() validates and sanitizes untrusted broadcast payloads', () => {
    const store = useIncidentStore();
    const initialCount = store.incidents.length;

    store.receiveFromBroadcast({
      id: 'inc_invalid',
      timestamp: '2026-07-14T00:00:00Z',
      reportedBy: 'test',
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] as [number, number] },
      type: 'INVALID_TYPE',
      severity: 'LOW',
      description: 'Invalid',
      status: 'OPEN'
    } as unknown as Incident);

    expect(store.incidents.length).toBe(initialCount);

    store.receiveFromBroadcast({
      id: 'inc_sanitized\u0000',
      timestamp: '2026-07-14T00:00:00Z',
      reportedBy: 'remote\u0007',
      location: { section: 'North Stand\u0000', gate: 'GateA', coordinates: ['1', '2'] },
      type: 'MEDICAL',
      severity: 'LOW',
      description: 'Blocked path\u0000',
      status: 'OPEN'
    } as unknown as Incident);

    const sanitized = store.incidents.find(i => i.id === 'inc_sanitized')!;
    expect(sanitized.reportedBy).toBe('remote');
    expect(sanitized.location.section).toBe('North Stand');
    expect(sanitized.location.coordinates).toEqual([1, 2]);
    expect(sanitized.description).toBe('Blocked path');

    // Test missing location
    store.receiveFromBroadcast({
      id: 'inc_nolocation',
      type: 'MEDICAL', severity: 'LOW', status: 'OPEN'
    } );
    expect(store.incidents.find(i => i.id === 'inc_nolocation')).toBeUndefined();

    // Test missing id or section
    store.receiveFromBroadcast({
      location: { section: '', gate: 'GateA', coordinates: [0, 0] },
      type: 'MEDICAL', severity: 'LOW', status: 'OPEN'
    } );

    // Test bad coordinates
    store.receiveFromBroadcast({
      id: 'inc_badcoords',
      location: { section: 'North Stand', gate: 'GateA', coordinates: [NaN, 0] },
      type: 'MEDICAL', severity: 'LOW', status: 'OPEN'
    } );
    expect(store.incidents.find(i => i.id === 'inc_badcoords')).toBeUndefined();

    // Test imageUrl and assignedTo
    store.receiveFromBroadcast({
      id: 'inc_with_extras',
      timestamp: '2026-07-14T00:00:00Z',
      location: { section: 'North Stand', gate: 'GateA', coordinates: [0, 0] },
      type: 'MEDICAL', severity: 'LOW', status: 'OPEN',
      imageUrl: 'http://example.com/img.jpg',
      assignedTo: 'Medic 1'
    } );
    const withExtras = store.incidents.find(i => i.id === 'inc_with_extras')!;
    expect(withExtras.imageUrl).toBe('http://example.com/img.jpg');
    expect(withExtras.assignedTo).toBe('Medic 1');
  });

  it('updateIncidentStatus() changes status of correct incident only', () => {
    const store = useIncidentStore();
    store.incidents.push({
      id: 'inc_1',
      timestamp: '2026-07-14T00:00:00Z',
      reportedBy: 'test',
      location: { section: '1', gate: 'GateA', coordinates: [0, 0] as [number, number] },
      type: 'MEDICAL',
      severity: 'LOW',
      description: 'Test',
      status: 'OPEN'
    } as Incident);

    store.updateIncidentStatus('inc_1', 'RESOLVED');
    expect(store.incidents.find(i => i.id === 'inc_1')!.status).toBe('RESOLVED');

    // Test non-existent incident
    store.updateIncidentStatus('inc_missing', 'RESOLVED');
    expect(store.incidents.find(i => i.id === 'inc_1')!.status).toBe('RESOLVED');
  });

  it('initRealtime() subscribes and pushes new incidents', () => {
    const store = useIncidentStore();
    store.incidents = [];

    let onCallback: (msg: { payload: { incident: Incident } }) => void = () => { };
    const mockChannel = {
      send: vi.fn(),
      on: vi.fn().mockImplementation((_event: string, _filter: Record<string, unknown>, callback: (msg: { payload: { incident: Incident } }) => void) => {
        onCallback = callback;
        return { subscribe: vi.fn() };
      })
    };

    // override the mock for this test
    (supabase.channel as Mock).mockReturnValue(mockChannel);

    store.initRealtime();

    const mockIncident = { id: 'inc_realtime', type: 'MEDICAL', severity: 'LOW', location: { section: '1' } } as unknown as Incident;
    onCallback({ payload: { incident: mockIncident } });

    expect(store.incidents.length).toBe(1);
    expect(store.incidents[0].id).toBe('inc_realtime');

    // sending same again shouldn't duplicate
    onCallback({ payload: { incident: mockIncident } });
    expect(store.incidents.length).toBe(1);

    // sending invalid shouldn't add or crash
    onCallback({ payload: { incident: null as unknown as Incident } });
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
