import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProactiveAlert } from '../services/proactiveAlerts';
import { evaluateAlerts } from '../services/proactiveAlerts';
import type { StadiumTelemetry } from '../types';
import { HEALTH_POLL_INTERVAL_MS } from '../constants';

export const useSystemStore = defineStore('system', () => {
  const isOfflineMode = ref(false);
  const llmMode = ref<'live' | 'fallback' | 'offline'>('live');
  const lastHealthCheck = ref<string | null>(null);
  const proactiveAlerts = ref<ProactiveAlert[]>([]);

  let healthInterval: ReturnType<typeof setInterval> | null = null;

  const setOfflineMode = (value: boolean) => {
    isOfflineMode.value = value;
  };

  const setLlmMode = (mode: 'live' | 'offline') => {
    llmMode.value = mode;
  };

  const checkHealth = async (): Promise<void> => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      const data = await res.json();
      
      setLlmMode(data.llm || 'offline');
      setOfflineMode(false);
    } catch (err) {
      setLlmMode('offline');
      setOfflineMode(true);
    } finally {
      lastHealthCheck.value = new Date().toISOString();
    }
  };

  const startHealthPolling = () => {
    if (healthInterval) return;
    healthInterval = setInterval(() => {
      checkHealth();
    }, HEALTH_POLL_INTERVAL_MS);
  };

  const processAlerts = (telemetry: StadiumTelemetry) => {
    const newAlerts = evaluateAlerts(telemetry);
    newAlerts.forEach((a: ProactiveAlert) => proactiveAlerts.value.unshift(a));
    if (proactiveAlerts.value.length > 20) {
      proactiveAlerts.value = proactiveAlerts.value.slice(0, 20);
    }
  };

  const dismissAlert = (id: string) => {
    const alert = proactiveAlerts.value.find((a: ProactiveAlert) => a.id === id);
    if (alert) alert.dismissed = true;
  };

  return {
    isOfflineMode,
    llmMode,
    lastHealthCheck,
    proactiveAlerts,
    setOfflineMode,
    setLlmMode,
    checkHealth,
    startHealthPolling,
    processAlerts,
    dismissAlert
  };
});
