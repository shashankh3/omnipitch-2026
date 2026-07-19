import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import type { StadiumTelemetry } from '../types';
import { useSystemStore } from './useSystemStore';
import { MOCK_TELEMETRY } from '../services/dataLoader';
import { getSimulatedTelemetry } from '../services/telemetrySimulator';
import { TELEMETRY_INTERVAL_MS } from '../constants';

export const useTelemetryStore = defineStore('telemetry', () => {
  let telemetryInterval: ReturnType<typeof setInterval> | undefined;
  const telemetry = shallowRef<StadiumTelemetry>({
    timestamp: new Date().toISOString(),
    wbgtTemperature: MOCK_TELEMETRY.baseline.wbgtTemperature,
    gateThroughput: { ...MOCK_TELEMETRY.baseline.gateThroughput },
    transitDelays: { ...MOCK_TELEMETRY.baseline.transitDelays },
    concessionInventory: { ...MOCK_TELEMETRY.baseline.concessionInventory },
    crowdDensity: { ...MOCK_TELEMETRY.baseline.crowdDensity }
  });
  
  const minutesToKickoff = ref(90);
  const isSimulating = ref(false);

  const loadBaseline = () => {
    telemetry.value = {
      timestamp: new Date().toISOString(),
      wbgtTemperature: MOCK_TELEMETRY.baseline.wbgtTemperature,
      gateThroughput: { ...MOCK_TELEMETRY.baseline.gateThroughput },
      transitDelays: { ...MOCK_TELEMETRY.baseline.transitDelays },
      concessionInventory: { ...MOCK_TELEMETRY.baseline.concessionInventory },
      crowdDensity: { ...MOCK_TELEMETRY.baseline.crowdDensity }
    };
  };

  const startSimulation = (minutes: number) => {
    minutesToKickoff.value = minutes;
    isSimulating.value = true;
    telemetry.value = getSimulatedTelemetry(minutes);

    if (telemetryInterval) {
      clearInterval(telemetryInterval);
    }

    telemetryInterval = setInterval(() => {
      if (!isSimulating.value) { 
        clearInterval(telemetryInterval); 
        return; 
      }
      minutesToKickoff.value -= 1;
      telemetry.value = getSimulatedTelemetry(minutesToKickoff.value);
      
      const systemStore = useSystemStore();
      systemStore.processAlerts(telemetry.value);
    }, TELEMETRY_INTERVAL_MS);
  };

  const stopSimulation = () => {
    isSimulating.value = false;
    if (telemetryInterval) {
      clearInterval(telemetryInterval);
      telemetryInterval = undefined;
    }
  };

  const updateFromSupabase = (payload: Partial<StadiumTelemetry>) => {
    telemetry.value = {
      ...telemetry.value,
      ...payload,
      timestamp: new Date().toISOString()
    };
    const systemStore = useSystemStore();
    systemStore.processAlerts(telemetry.value);
  };

  return {
    telemetry,
    minutesToKickoff,
    isSimulating,
    loadBaseline,
    startSimulation,
    stopSimulation,
    updateFromSupabase
  };
});
