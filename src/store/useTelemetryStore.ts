import { defineStore } from 'pinia';
import type { StadiumTelemetry } from '../types';
import { useSystemStore } from './useSystemStore';
import { MOCK_TELEMETRY } from '../services/dataLoader';
import { getSimulatedTelemetry } from '../services/telemetrySimulator';

let telemetryInterval: ReturnType<typeof setInterval> | undefined;

export const useTelemetryStore = defineStore('telemetry', {
  state: () => ({
    telemetry: {
      timestamp: new Date().toISOString(),
      wbgtTemperature: MOCK_TELEMETRY.baseline.wbgtTemperature,
      gateThroughput: { ...MOCK_TELEMETRY.baseline.gateThroughput },
      transitDelays: { ...MOCK_TELEMETRY.baseline.transitDelays },
      concessionInventory: { ...MOCK_TELEMETRY.baseline.concessionInventory },
      crowdDensity: { ...MOCK_TELEMETRY.baseline.crowdDensity }
    } as StadiumTelemetry,
    minutesToKickoff: 90,
    isSimulating: false
  }),
  actions: {
    loadBaseline() {
      this.telemetry = {
        timestamp: new Date().toISOString(),
        wbgtTemperature: MOCK_TELEMETRY.baseline.wbgtTemperature,
        gateThroughput: { ...MOCK_TELEMETRY.baseline.gateThroughput },
        transitDelays: { ...MOCK_TELEMETRY.baseline.transitDelays },
        concessionInventory: { ...MOCK_TELEMETRY.baseline.concessionInventory },
        crowdDensity: { ...MOCK_TELEMETRY.baseline.crowdDensity }
      };
    },
    startSimulation(minutesToKickoff: number) {
      this.minutesToKickoff = minutesToKickoff;
      this.isSimulating = true;
      // Load initial deterministic state immediately
      this.telemetry = getSimulatedTelemetry(minutesToKickoff);

      if (telemetryInterval) {
        clearInterval(telemetryInterval);
      }

      // Advance simulation every 10 seconds (1 real second = ~1 match minute)
      telemetryInterval = setInterval(() => {
        if (!this.isSimulating) { 
          clearInterval(telemetryInterval); 
          return; 
        }
        this.minutesToKickoff -= 1;
        this.telemetry = getSimulatedTelemetry(this.minutesToKickoff);
        
        const systemStore = useSystemStore();
        systemStore.processAlerts(this.telemetry);
      }, 10_000);
    },
    stopSimulation() {
      this.isSimulating = false;
      if (telemetryInterval) {
        clearInterval(telemetryInterval);
        telemetryInterval = undefined;
      }
    },
    updateFromSupabase(payload: Partial<StadiumTelemetry>) {
      this.telemetry = {
        ...this.telemetry,
        ...payload,
        timestamp: new Date().toISOString()
      };
      const systemStore = useSystemStore();
      systemStore.processAlerts(this.telemetry);
    }
  }
});
