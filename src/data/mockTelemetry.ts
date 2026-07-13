import type { StadiumTelemetry, Incident } from '../types';

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
