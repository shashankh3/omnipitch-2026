import zonesRaw from '../data/stadiumZones.json';
import facilitiesRaw from '../data/facilitiesData.json';
import incidentSeedRaw from '../data/incidentSeed.json';
import mockTelemetryRaw from '../data/mockTelemetry.json';

export const STADIUM_ZONES = zonesRaw.zones;
export const FACILITIES = facilitiesRaw.facilities;
export const INCIDENT_SEED = incidentSeedRaw.map((inc: any) => ({
  ...inc,
  timestamp: inc.timestamp === 'SEED' ? new Date().toISOString() : inc.timestamp
}));
export const MOCK_TELEMETRY = mockTelemetryRaw;
