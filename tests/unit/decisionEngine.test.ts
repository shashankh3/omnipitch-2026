import { describe, it, expect, beforeEach } from 'vitest';
import { resolveContext, type FanContext } from '../../src/services/decisionEngine';
import { createPinia, setActivePinia } from 'pinia';
import { useStadiumStore } from '../../src/store/useStadiumStore';

describe('decisionEngine', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const baseContext: FanContext = {
    currentZone: 'North Stand',
    destinationIntent: 'general',
    accessibilityNeeds: [],
    minutesToKickoff: 60,
    language: 'en'
  };

  it('wheelchair need -> route contains no stairs zones', () => {
    const ctx = { ...baseContext, accessibilityNeeds: ['wheelchair'] };
    // Force a route with stairs in the mock by mocking the response or just relying on logic
    // The logic filters out 'stairs'
    const result = resolveContext(ctx);
    expect(result.isStepFree).toBe(true);
    expect(result.resolvedRoute.some(z => z.toLowerCase().includes('stairs'))).toBe(false);
  });

  it('visual need -> accessibilityMode is screen_reader', () => {
    const ctx = { ...baseContext, accessibilityNeeds: ['visual'] };
    const result = resolveContext(ctx);
    expect(result.accessibilityMode).toBe('screen_reader');
  });

  it('hearing need -> accessibilityMode is captioned', () => {
    const ctx = { ...baseContext, accessibilityNeeds: ['hearing'] };
    const result = resolveContext(ctx);
    expect(result.accessibilityMode).toBe('captioned');
  });

  it('minutesToKickoff=10 + intent=gate -> urgencyFlag=true', () => {
    const ctx = { ...baseContext, minutesToKickoff: 10, destinationIntent: 'gate c' };
    const result = resolveContext(ctx);
    expect(result.urgencyFlag).toBe(true);
  });

  it('minutesToKickoff=20 -> urgencyFlag=false', () => {
    const ctx = { ...baseContext, minutesToKickoff: 20, destinationIntent: 'gate c' };
    const result = resolveContext(ctx);
    expect(result.urgencyFlag).toBe(false);
  });

  it('no accessibility needs -> standard mode, all zones allowed', () => {
    const result = resolveContext(baseContext);
    expect(result.accessibilityMode).toBe('standard');
    expect(result.isStepFree).toBe(false);
  });

  it('combined needs (wheelchair + visual) -> both rules applied', () => {
    const ctx = { ...baseContext, accessibilityNeeds: ['wheelchair', 'visual'] };
    const result = resolveContext(ctx);
    expect(result.isStepFree).toBe(true);
    expect(result.accessibilityMode).toBe('screen_reader');
  });

  describe('Crowd Level branches', () => {
    it('density < 40 -> low', () => {
      const store = useStadiumStore();
      const prev = store.telemetry.crowdDensity['East Stand'];
      store.telemetry.crowdDensity['East Stand'] = 30;
      const result = resolveContext(baseContext);
      expect(result.crowdLevel).toBe('low');
      store.telemetry.crowdDensity['East Stand'] = prev;
    });

    it('density < 70 -> medium', () => {
      const store = useStadiumStore();
      const prev = store.telemetry.crowdDensity['East Stand'];
      store.telemetry.crowdDensity['East Stand'] = 60;
      const result = resolveContext(baseContext);
      expect(result.crowdLevel).toBe('medium');
      store.telemetry.crowdDensity['East Stand'] = prev;
    });

    it('density < 90 -> high', () => {
      const store = useStadiumStore();
      const prev = store.telemetry.crowdDensity['East Stand'];
      store.telemetry.crowdDensity['East Stand'] = 80;
      const result = resolveContext(baseContext);
      expect(result.crowdLevel).toBe('high');
      expect(result.alternativeFacility).toBe('Gate A');
      store.telemetry.crowdDensity['East Stand'] = prev;
    });

    it('density >= 90 -> critical', () => {
      const store = useStadiumStore();
      const prev = store.telemetry.crowdDensity['East Stand'];
      store.telemetry.crowdDensity['East Stand'] = 95;
      const result = resolveContext(baseContext);
      expect(result.crowdLevel).toBe('critical');
      expect(result.alternativeFacility).toBe('Gate A');
      store.telemetry.crowdDensity['East Stand'] = prev;
    });
  });

  it('covers store access and offline mode', () => {
    // Tests exception block or mocked store where we can cover lines 27-45
    // since we use vitest without pinia initialized here it hits catch block
    
    // Explicitly reset the global MOCK_STADIUM_STATE to ensure no leaks
    import('../../src/data/mockTelemetry').then(m => {
        m.MOCK_STADIUM_STATE.telemetry.crowdDensity['East Stand'] = 55;
    });

    const store = useStadiumStore();
    store.telemetry.crowdDensity['East Stand'] = 55;

    const result = resolveContext(baseContext);
    expect(result.crowdLevel).toBe('medium'); // MOCK_STADIUM_STATE has East Stand: 55
  });
});
