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

  it('defaults to English when session is null', () => {
    const session = useSessionStore();
    session.currentSession = null;
    
    const { lang, stepFreeRoute } = useSensoryRoom();
    expect(lang.value).toBe('en');
    expect(stepFreeRoute.value).toContain('North Concourse');
  });

  it('falls back to English route for unsupported languages', () => {
    const session = useSessionStore();
    // @ts-ignore
    session.currentSession = { user: { id: '1' }, language: 'it' };
    
    const { stepFreeRoute } = useSensoryRoom();
    expect(stepFreeRoute.value).toContain('North Concourse');
  });

  it('handles missing sensory room', async () => {
    // We mock STADIUM_ZONES to not have a sensory room by overriding array methods
    const dataLoader = await import('../../services/dataLoader');
    const originalZones = [...dataLoader.STADIUM_ZONES];
    dataLoader.STADIUM_ZONES.length = 0; // Clear it

    const { stepFreeRoute, features } = useSensoryRoom();
    expect(stepFreeRoute.value).toBeNull();
    expect(features.value).toEqual([]);

    // Restore
    dataLoader.STADIUM_ZONES.push(...originalZones);
  });
});
