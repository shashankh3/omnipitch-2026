import { computed } from 'vue';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { getCrowdLevel } from '../services/telemetrySimulator';

/**
 * Provides reactive crowd density status and formatting for a specific stadium zone.
 * @param zoneKey The key identifying the stadium zone (e.g., 'North Stand').
 * @returns An object containing reactive properties for density, level, color, and label.
 */
export function useCrowdStatus(zoneKey: string) {
  const telemetry = useTelemetryStore();
  const density = computed(() =>
    telemetry.telemetry.crowdDensity[zoneKey] ?? 0
  );
  const level = computed(() => getCrowdLevel(density.value));
  const color = computed(() => ({
    low: '#10b981',      // emerald
    medium: '#f59e0b',   // amber
    high: '#ef4444',     // red
    critical: '#7c3aed'  // purple
  }[level.value]));
  const label = computed(() => ({
    low: '●○○ Low',
    medium: '●●○ Busy',
    high: '●●● High',
    critical: '⚠ Critical'
  }[level.value]));
  
  return { density, level, color, label };
}
