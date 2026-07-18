import type { StadiumTelemetry, Incident } from '../types';

export const MOCK_TELEMETRY_JSON = {
  baseline: {
    wbgtTemperature: 34.8,
    gateThroughput: { GateA: 450, GateB: 120, GateC: 890 },
    transitDelays: { Metro_Line1: 25, Bus_Express: 0 },
    concessionInventory: { Water_Sec100: 15, Water_Sec120: 85 },
    crowdDensity: { 'North Stand': 85, 'South Stand': 45, 'East Stand': 95, 'West Stand': 20, Pitch: 5 }
  },
  byMinutesToKickoff: {
    '90': { crowdDensityMultiplier: 0.3, gateMultiplier: 0.2 },
    '60': { crowdDensityMultiplier: 0.6, gateMultiplier: 0.7 },
    '30': { crowdDensityMultiplier: 0.85, gateMultiplier: 1.4 },
    '15': { crowdDensityMultiplier: 0.95, gateMultiplier: 1.8 },
    '0':  { crowdDensityMultiplier: 1.0,  gateMultiplier: 2.0 },
    '-30': { crowdDensityMultiplier: 0.7, gateMultiplier: 1.6 }
  }
};

// Deterministic seed based on hour of day
const d = new Date();
const seed = d.getUTCFullYear() + d.getUTCMonth() + d.getUTCDate() + d.getUTCHours();

export const MOCK_STADIUM_STATE: { telemetry: StadiumTelemetry, incidents: Incident[] } = {
  telemetry: {
    timestamp: new Date().toISOString(),
    wbgtTemperature: 31.0 + (seed % 5),
    gateThroughput: { 
      'GateA': 100 + (seed % 200), 
      'GateB': 500 + (seed % 300), 
      'GateC': 200 + (seed % 100) 
    },
    transitDelays: { 
      'Metro_Line1': seed % 3 === 0 ? 15 : 0, 
      'Bus_Express': seed % 5 === 0 ? 10 : 0 
    },
    concessionInventory: { 
      'Water_Sec100': 30 + (seed % 50), 
      'Water_Sec120': 40 + (seed % 20) 
    },
    crowdDensity: {
      'North Stand': 60 + (seed % 30),
      'South Stand': 40 + (seed % 40),
      'East Stand': 85 + (seed % 10),
      'West Stand': 30 + (seed % 20),
      'Pitch': 5
    }
  },
  incidents: [
    {
      id: 'inc_mock_001',
      timestamp: new Date().toISOString(),
      reportedBy: 'system_sensor',
      location: { section: '112', gate: 'GateC', coordinates: [43.6821, -79.6122] },
      type: 'WEATHER_HAZARD',
      severity: 'HIGH',
      description: 'Wet Bulb Globe Temperature exceeded 33°C in unshaded East Stand area. Extreme heat stroke risk.',
      status: 'OPEN'
    },
    {
      id: 'inc_mock_002',
      timestamp: new Date().toISOString(),
      reportedBy: 'vol_302',
      location: { section: 'Concourse B', gate: 'GateA', coordinates: [43.6825, -79.6130] },
      type: 'FACILITY_DAMAGE',
      severity: 'CRITICAL',
      description: 'Elevator EL-04 serving accessibility route out of commission due to power failure.',
      status: 'OPEN'
    }
  ]
};
