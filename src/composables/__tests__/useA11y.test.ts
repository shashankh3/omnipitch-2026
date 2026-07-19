import { describe, it, expect, beforeEach } from 'vitest';
import { useA11y } from '../useA11y';
import { createPinia, setActivePinia } from 'pinia';
import { useSessionStore } from '../../store/useSessionStore';

describe('useA11y', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('reads accessibility profile from session store (wheelchair)', () => {
    const session = useSessionStore();
    session.currentSession = {
      accessibilityProfile: {
        requiresStepFree: true,
        sensoryMode: 'calm'
      }
    } as any;
    
    const { isWheelchair, sensoryMode, activeMode } = useA11y();
    
    expect(isWheelchair.value).toBe(true);
    expect(sensoryMode.value).toBe('calm');
    expect(activeMode.value).toBe('wheelchair');
  });

  it('reads accessibility profile (sensory only)', () => {
    const session = useSessionStore();
    session.currentSession = {
      accessibilityProfile: {
        requiresStepFree: false,
        sensoryMode: 'quiet'
      }
    } as any;
    const { activeMode } = useA11y();
    expect(activeMode.value).toBe('quiet');
  });

  it('reads accessibility profile (standard)', () => {
    const session = useSessionStore();
    session.currentSession = {} as any;
    const { activeMode } = useA11y();
    expect(activeMode.value).toBe('standard');
  });
});
