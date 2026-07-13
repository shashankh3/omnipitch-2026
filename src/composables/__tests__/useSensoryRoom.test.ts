import { describe, it, expect, beforeEach } from 'vitest';
import { useSensoryRoom } from '../useSensoryRoom';
import { createPinia, setActivePinia } from 'pinia';
import { useSessionStore } from '../../store/useSessionStore';

describe('useSensoryRoom', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('locates sensory room and its features', () => {
    const { sensoryRoom, features } = useSensoryRoom();
    
    expect(sensoryRoom.value).toBeDefined();
    expect(sensoryRoom.value?.id).toBe('sensory_room_north');
    expect(sensoryRoom.value?.hasElevator).toBe(true);
    expect(sensoryRoom.value?.hasStairs).toBe(false);
    expect(features.value.length).toBeGreaterThan(0);
    expect(features.value).toContain('noise_cancelling');
  });

  it('computes localized route based on session language', () => {
    const session = useSessionStore();
    session.setLanguage('es');
    
    const { stepFreeRoute } = useSensoryRoom();
    expect(stepFreeRoute.value).toContain('Vestíbulo Norte');
  });

  it('defaults to English when language is not matched', () => {
    const session = useSessionStore();
    // Use an unsupported lang to see fallback
    session.currentSession = { id: '1', email: 'a@a.com', role: 'FAN', language: 'it', accessibilityProfile: { requiresStepFree: false, highContrastMode: false } };
    
    const { stepFreeRoute } = useSensoryRoom();
    expect(stepFreeRoute.value).toContain('North Concourse');
  });
});
