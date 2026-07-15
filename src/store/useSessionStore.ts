import { defineStore } from 'pinia';
import type { UserSession } from '../types';

export const useSessionStore = defineStore('session', {
  state: () => ({
    currentSession: {
      id: 'usr_9921',
      email: 'fan_international@worldcup2026.org',
      role: 'FAN',
      language: 'en',
      accessibilityProfile: { requiresStepFree: false }
    } as UserSession | null
  }),
  actions: {
    setRole(role: 'FAN' | 'VOLUNTEER' | 'ORGANIZER') {
      if (this.currentSession) {
        this.currentSession.role = role;
      }
    },
    setLanguage(lang: 'en' | 'es' | 'fr' | 'de') {
      if (this.currentSession) {
        this.currentSession.language = lang;
      }
    },
    setAccessibilityProfile(profile: UserSession['accessibilityProfile']) {
      if (this.currentSession) {
        this.currentSession.accessibilityProfile = profile;
      }
    }
  }
});
