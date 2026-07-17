import type { StadiumTelemetry } from '../types';
import { MOCK_TELEMETRY } from './dataLoader';

/**
 * Returns deterministic telemetry for a given minutesToKickoff value.
 * Same inputs ALWAYS produce same outputs. No Math.random().
 * Uses the byMinutesToKickoff multiplier table from mockTelemetry.json.
 */
export function getSimulatedTelemetry(
  minutesToKickoff: number
): StadiumTelemetry {
  // Find the closest key in byMinutesToKickoff table
  const keys = Object.keys(MOCK_TELEMETRY.byMinutesToKickoff)
    .map(Number)
    .sort((a, b) => Math.abs(a - minutesToKickoff) - Math.abs(b - minutesToKickoff));
  const closestKey = String(keys[0]);
  const multipliers = (MOCK_TELEMETRY.byMinutesToKickoff as Record<string, { crowdDensityMultiplier: number, gateMultiplier: number }>)[closestKey];

  const base = MOCK_TELEMETRY.baseline;

  // Apply crowd multiplier deterministically
  const crowdDensity: Record<string, number> = {};
  Object.entries(base.crowdDensity).forEach(([zone, value]) => {
    crowdDensity[zone] = Math.min(100,
      Math.round((value as number) * multipliers.crowdDensityMultiplier)
    );
  });

  // Apply gate multiplier deterministically
  const gateThroughput: Record<string, number> = {};
  Object.entries(base.gateThroughput).forEach(([gate, value]) => {
    gateThroughput[gate] = Math.round((value as number) * multipliers.gateMultiplier);
  });

  // Temperature: varies predictably by minutesToKickoff (heat peaks at 0)
  const tempOffset = Math.max(-2, Math.min(2,
    (60 - Math.abs(minutesToKickoff)) / 30
  ));
  const wbgtTemperature = Math.round((base.wbgtTemperature + tempOffset) * 10) / 10;

  return {
    timestamp: new Date().toISOString(),
    wbgtTemperature,
    gateThroughput,
    transitDelays: { ...base.transitDelays },
    concessionInventory: { ...base.concessionInventory },
    crowdDensity
  };
}

/**
 * Helper: derive crowd level label from density number
 */
export function getCrowdLevel(
  density: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (density < 40) return 'low';
  if (density < 70) return 'medium';
  if (density < 90) return 'high';
  return 'critical';
}
