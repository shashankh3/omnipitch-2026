import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sets role', () => {
    const store = useSessionStore();
    store.setRole('ORGANIZER');
    expect(store.currentSession?.role).toBe('ORGANIZER');
  });

  it('sets language', () => {
    const store = useSessionStore();
    store.setLanguage('es');
    expect(store.currentSession?.language).toBe('es');
  });

  it('sets accessibility profile', () => {
    const store = useSessionStore();
    store.setAccessibilityProfile({ requiresStepFree: true, sensoryMode: 'screen_reader' });
    expect(store.currentSession?.accessibilityProfile.requiresStepFree).toBe(true);
    expect(store.currentSession?.accessibilityProfile.sensoryMode).toBe('screen_reader');
  });

  it('handles null session safely', () => {
    const store = useSessionStore();
    store.currentSession = null;
    store.setRole('ORGANIZER');
    store.setLanguage('es');
    store.setAccessibilityProfile({ requiresStepFree: true });
    expect(store.currentSession).toBeNull();
  });
});
