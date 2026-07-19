import { defineStore, storeToRefs } from 'pinia';
import { useSessionStore } from './useSessionStore';
import { useTelemetryStore } from './useTelemetryStore';
import { useIncidentStore } from './useIncidentStore';
import { useSystemStore } from './useSystemStore';

export { useSessionStore } from './useSessionStore';
export { useTelemetryStore } from './useTelemetryStore';
export { useIncidentStore } from './useIncidentStore';
export { useSystemStore } from './useSystemStore';

/**
 * This is an intentional aggregating facade over the four domain stores
 * (session, telemetry, incident, system) so consumers have a single entry point.
 */
export const useStadiumStore = defineStore('stadium', () => {
  const sessionStore = useSessionStore();
  const telemetryStore = useTelemetryStore();
  const incidentStore = useIncidentStore();
  const systemStore = useSystemStore();

  const { currentSession } = storeToRefs(sessionStore);
  const { telemetry, minutesToKickoff, isSimulating } = storeToRefs(telemetryStore);
  const { incidents } = storeToRefs(incidentStore);
  const { isOfflineMode, llmMode, lastHealthCheck } = storeToRefs(systemStore);

  return {
    currentSession,
    telemetry,
    minutesToKickoff,
    isSimulating,
    incidents,
    isOfflineMode,
    llmMode,
    lastHealthCheck,
    
    setRole: sessionStore.setRole,
    setLanguage: sessionStore.setLanguage,
    setAccessibilityProfile: sessionStore.setAccessibilityProfile,

    loadBaseline: telemetryStore.loadBaseline,
    startSimulation: telemetryStore.startSimulation,
    stopSimulation: telemetryStore.stopSimulation,
    updateFromSupabase: telemetryStore.updateFromSupabase,
    startTelemetrySimulation: (minutes: number = 90) => telemetryStore.startSimulation(minutes),

    loadSeed: incidentStore.loadSeed,
    addIncident: incidentStore.addIncident,
    updateIncidentStatus: incidentStore.updateIncidentStatus,
    receiveFromBroadcast: incidentStore.receiveFromBroadcast,
    initRealtime: incidentStore.initRealtime,

    setOfflineMode: systemStore.setOfflineMode,
    setLlmMode: systemStore.setLlmMode,
    checkHealth: systemStore.checkHealth,
  };
});
