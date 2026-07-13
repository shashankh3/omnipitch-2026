import { defineStore } from 'pinia';
import type { ProactiveAlert } from '../services/proactiveAlerts';
import { evaluateAlerts } from '../services/proactiveAlerts';
import type { StadiumTelemetry } from '../types';

export const useSystemStore = defineStore('system', {
  state: () => ({
    isOfflineMode: false,
    llmMode: 'live' as 'live' | 'fallback' | 'offline',
    lastHealthCheck: null as string | null,
    proactiveAlerts: [] as ProactiveAlert[]
  }),
  actions: {
    setOfflineMode(value: boolean) {
      this.isOfflineMode = value;
    },
    setLlmMode(mode: 'live' | 'offline') {
      this.llmMode = mode;
    },
    async checkHealth(): Promise<void> {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('Health check failed');
        const data = await res.json();
        
        this.setLlmMode(data.llm || 'offline');
        // We set offlineMode based on Supabase health in our new structure,
        // wait, the plan says:
        // → on success: setLlmMode(data.llm), setOfflineMode(false)
        // → on error: setLlmMode('offline'), setOfflineMode(true)
        this.setOfflineMode(false);
      } catch (err) {
        this.setLlmMode('offline');
        this.setOfflineMode(true);
      } finally {
        this.lastHealthCheck = new Date().toISOString();
      }
    },
    processAlerts(telemetry: StadiumTelemetry) {
      const newAlerts = evaluateAlerts(telemetry);
      newAlerts.forEach(a => this.proactiveAlerts.unshift(a));
      // Keep max 20 alerts in memory
      if (this.proactiveAlerts.length > 20) {
        this.proactiveAlerts = this.proactiveAlerts.slice(0, 20);
      }
    },
    dismissAlert(id: string) {
      const alert = this.proactiveAlerts.find(a => a.id === id);
      if (alert) alert.dismissed = true;
    }
  }
});
