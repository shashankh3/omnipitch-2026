import zonesRaw from '../data/stadiumZones.json';
import facilitiesRaw from '../data/facilitiesData.json';
import incidentSeedRaw from '../data/incidentSeed.json';
import { MOCK_TELEMETRY_JSON as mockTelemetryRaw } from '../data/mockTelemetry';

import type { Incident } from '../types';

export const STADIUM_ZONES = zonesRaw.zones;
export const FACILITIES = facilitiesRaw.facilities;
export const INCIDENT_SEED = (incidentSeedRaw as unknown as Incident[]).map((inc) => ({
  ...inc,
  timestamp: inc.timestamp === 'SEED' ? new Date().toISOString() : inc.timestamp
})) as Incident[];
export const MOCK_TELEMETRY = mockTelemetryRaw;
