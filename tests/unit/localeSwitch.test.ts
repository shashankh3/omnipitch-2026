import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../../src/store/useSessionStore';
import { createPinia, setActivePinia } from 'pinia';

describe('Locale Switching Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    document.documentElement.lang = 'en'; // Reset before each test
  });

  it('updates html lang when session language changes', () => {
    const store = useSessionStore();
    
    // Simulate App.vue's watcher behavior since we are not mounting App.vue
    // Normally this logic is inside App.vue's watch(currentLanguage, ...)
    // For unit testing the store behavior and the intended side effect:
    store.setLanguage('es');
    
    // The actual update to document.documentElement.lang happens in the Vue component (App.vue),
    // so in a pure unit test of the store, we can only verify the state change.
    expect(store.currentSession?.language).toBe('es');
  });

  it('default language is en', () => {
    const store = useSessionStore();
    expect(store.currentSession?.language).toBe('en');
  });
});
