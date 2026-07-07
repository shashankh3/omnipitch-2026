import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStadiumStore } from '../useStadiumStore';

describe('OmniPitch 2026 — Stadium Store Test Suite', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Initial State', () => {
    it('should initialize with a default user session', () => {
      const store = useStadiumStore();
      expect(store.currentSession).toBeDefined();
      expect(store.currentSession?.role).toBe('FAN');
    });

    it('should initialize with valid telemetry data', () => {
      const store = useStadiumStore();
      expect(store.telemetry.wbgtTemperature).toBeGreaterThan(0);
      expect(store.telemetry.gateThroughput).toHaveProperty('GateA');
      expect(store.telemetry.gateThroughput).toHaveProperty('GateB');
      expect(store.telemetry.gateThroughput).toHaveProperty('GateC');
    });

    it('should initialize with crowd density for all stands', () => {
      const store = useStadiumStore();
      expect(store.telemetry.crowdDensity).toHaveProperty('North Stand');
      expect(store.telemetry.crowdDensity).toHaveProperty('South Stand');
      expect(store.telemetry.crowdDensity).toHaveProperty('East Stand');
      expect(store.telemetry.crowdDensity).toHaveProperty('West Stand');
    });

    it('should have pre-loaded incidents for demo purposes', () => {
      const store = useStadiumStore();
      expect(store.incidents.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('setRole() should update the current session role', () => {
      const store = useStadiumStore();
      store.setRole('ORGANIZER');
      expect(store.currentSession?.role).toBe('ORGANIZER');
    });

    it('addIncident() should create an incident with auto-generated id and timestamp', async () => {
      const store = useStadiumStore();
      const initialCount = store.incidents.length;

      await store.addIncident({
        reportedBy: 'test_user',
        location: { section: 'Test Section', gate: 'GateA', coordinates: [43.68, -79.61] },
        type: 'MEDICAL',
        severity: 'HIGH',
        description: 'Test incident for unit testing.',
        status: 'OPEN'
      });

      expect(store.incidents.length).toBe(initialCount + 1);
      const newIncident = store.incidents[store.incidents.length - 1];
      expect(newIncident.id).toMatch(/^inc_/);
      expect(newIncident.timestamp).toBeDefined();
      expect(newIncident.type).toBe('MEDICAL');
      expect(newIncident.severity).toBe('HIGH');
    });

    it('addIncident() should preserve existing incidents', async () => {
      const store = useStadiumStore();
      const original = [...store.incidents];

      await store.addIncident({
        reportedBy: 'test',
        location: { section: 'A', gate: 'GateB', coordinates: [0, 0] },
        type: 'FACILITY_DAMAGE',
        severity: 'LOW',
        description: 'Test',
        status: 'OPEN'
      });

      // Verify original incidents are preserved
      original.forEach((inc, i) => {
        expect(store.incidents[i].id).toBe(inc.id);
      });
    });
  });

  describe('Telemetry Validation', () => {
    it('WBGT temperature should be within realistic bounds', () => {
      const store = useStadiumStore();
      expect(store.telemetry.wbgtTemperature).toBeGreaterThanOrEqual(20);
      expect(store.telemetry.wbgtTemperature).toBeLessThanOrEqual(50);
    });

    it('crowd density values should be between 0 and 100', () => {
      const store = useStadiumStore();
      Object.values(store.telemetry.crowdDensity).forEach(density => {
        expect(density).toBeGreaterThanOrEqual(0);
        expect(density).toBeLessThanOrEqual(100);
      });
    });

    it('gate throughput values should be non-negative', () => {
      const store = useStadiumStore();
      Object.values(store.telemetry.gateThroughput).forEach(throughput => {
        expect(throughput).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Incident Data Integrity', () => {
    it('all incidents should have valid types', () => {
      const store = useStadiumStore();
      const validTypes = ['MEDICAL', 'CROWD_BOTTLENECK', 'FACILITY_DAMAGE', 'WEATHER_HAZARD'];
      store.incidents.forEach(inc => {
        expect(validTypes).toContain(inc.type);
      });
    });

    it('all incidents should have valid severity levels', () => {
      const store = useStadiumStore();
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      store.incidents.forEach(inc => {
        expect(validSeverities).toContain(inc.severity);
      });
    });

    it('all incidents should have valid statuses', () => {
      const store = useStadiumStore();
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
      store.incidents.forEach(inc => {
        expect(validStatuses).toContain(inc.status);
      });
    });
  });
});
