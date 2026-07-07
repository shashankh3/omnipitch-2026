import { defineStore } from 'pinia';
import type { UserSession, Incident, StadiumTelemetry } from '../types';

export const useStadiumStore = defineStore('stadium', {
  state: () => ({
    globalTheme: 'dark' as 'light' | 'dark',
    currentSession: {
      id: 'usr_9921',
      email: 'fan_international@worldcup2026.org',
      role: 'FAN',
      language: 'en',
      accessibilityProfile: { requiresStepFree: false, highContrastMode: false }
    } as UserSession | null,
    
    telemetry: {
      timestamp: new Date().toISOString(),
      wbgtTemperature: 34.8, // Hazardous heat state (Celsius)
      gateThroughput: { 'GateA': 450, 'GateB': 120, 'GateC': 890 }, // GateC bottleneck
      transitDelays: { 'Metro_Line1': 25, 'Bus_Express': 0 }, // Metro mechanical delay
      concessionInventory: { 'Water_Sec100': 15, 'Water_Sec120': 85 }, // Inventory exhaustion threat
      crowdDensity: {
        'North Stand': 85,
        'South Stand': 45,
        'East Stand': 95,
        'West Stand': 20,
        'Pitch': 5
      }
    } as StadiumTelemetry,

    incidents: [
      {
        id: 'inc_001',
        timestamp: new Date().toISOString(),
        reportedBy: 'system_sensor',
        location: { section: '112', gate: 'GateC', coordinates: [43.6821, -79.6122] },
        type: 'WEATHER_HAZARD',
        severity: 'HIGH',
        description: 'Wet Bulb Globe Temperature exceeded 33°C in unshaded East Stand area. Extreme heat stroke risk.',
        status: 'OPEN'
      },
      {
        id: 'inc_002',
        timestamp: new Date().toISOString(),
        reportedBy: 'vol_302',
        location: { section: 'Concourse B', gate: 'GateA', coordinates: [43.6825, -79.6130] },
        type: 'FACILITY_DAMAGE',
        severity: 'CRITICAL',
        description: 'Elevator EL-04 serving accessibility route out of commission due to power failure.',
        status: 'OPEN'
      },
      {
        id: 'inc_003',
        timestamp: new Date().toISOString(),
        reportedBy: 'fan_402',
        location: { section: '205', gate: 'GateB', coordinates: [43.6815, -79.6110] },
        type: 'MEDICAL',
        severity: 'MEDIUM',
        description: 'Fan reports dehydration symptoms, requires medical assistance.',
        status: 'OPEN'
      },
      {
        id: 'inc_004',
        timestamp: new Date().toISOString(),
        reportedBy: 'vol_105',
        location: { section: 'GateC', gate: 'GateC', coordinates: [43.6830, -79.6120] },
        type: 'CROWD_BOTTLENECK',
        severity: 'HIGH',
        description: 'Severe crowding at Gate C due to security scanner malfunction.',
        status: 'IN_PROGRESS'
      },
      {
        id: 'inc_005',
        timestamp: new Date().toISOString(),
        reportedBy: 'system_sensor',
        location: { section: '100', gate: 'GateA', coordinates: [43.6820, -79.6135] },
        type: 'FACILITY_DAMAGE',
        severity: 'LOW',
        description: 'Water concession stand POS system offline.',
        status: 'RESOLVED'
      },
      {
        id: 'inc_006',
        timestamp: new Date().toISOString(),
        reportedBy: 'org_admin',
        location: { section: 'Transit Hub', gate: 'GateB', coordinates: [43.6800, -79.6100] },
        type: 'CROWD_BOTTLENECK',
        severity: 'CRITICAL',
        description: 'Metro Line 1 delayed by 25 mins, causing massive platform crowding.',
        status: 'OPEN'
      },
      {
        id: 'inc_007',
        timestamp: new Date().toISOString(),
        reportedBy: 'fan_120',
        location: { section: '115', gate: 'GateC', coordinates: [43.6825, -79.6118] },
        type: 'MEDICAL',
        severity: 'LOW',
        description: 'Minor scrape, requires first aid kit at section 115.',
        status: 'RESOLVED'
      },
      {
        id: 'inc_008',
        timestamp: new Date().toISOString(),
        reportedBy: 'vol_200',
        location: { section: '300', gate: 'GateA', coordinates: [43.6822, -79.6128] },
        type: 'FACILITY_DAMAGE',
        severity: 'MEDIUM',
        description: 'Restroom block 3A flooded.',
        status: 'IN_PROGRESS'
      },
      {
        id: 'inc_009',
        timestamp: new Date().toISOString(),
        reportedBy: 'vol_201',
        location: { section: '400', gate: 'GateB', coordinates: [43.6818, -79.6115] },
        type: 'WEATHER_HAZARD',
        severity: 'LOW',
        description: 'Rain blowing into uncovered section 400 rows A-F.',
        status: 'OPEN'
      },
      {
        id: 'inc_010',
        timestamp: new Date().toISOString(),
        reportedBy: 'org_admin',
        location: { section: 'Perimeter', gate: 'GateC', coordinates: [43.6835, -79.6125] },
        type: 'CROWD_BOTTLENECK',
        severity: 'MEDIUM',
        description: 'Ride-share pickup zone backed up onto main arterial road.',
        status: 'OPEN'
      }
    ] as Incident[]
  }),
  actions: {
    toggleTheme() {
      this.globalTheme = this.globalTheme === 'dark' ? 'light' : 'dark';
      if (this.globalTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setRole(role: 'FAN' | 'VOLUNTEER' | 'ORGANIZER') {
      if (this.currentSession) this.currentSession.role = role;
    },
    async addIncident(incident: Omit<Incident, 'id' | 'timestamp'>) {
      const newIncident: Incident = {
        ...incident,
        id: `inc_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      this.incidents.push(newIncident);
    },
    startTelemetrySimulation() {
      // Prevent multiple intervals
      if ((window as any)._telemetryInterval) return;
      
      (window as any)._telemetryInterval = setInterval(() => {
        // Randomly fluctuate temperature between 32 and 36 Celsius
        this.telemetry.wbgtTemperature = Math.max(30, Math.min(38, this.telemetry.wbgtTemperature + (Math.random() - 0.5) * 0.5));
        
        // Randomly adjust gate throughput
        Object.keys(this.telemetry.gateThroughput).forEach(gate => {
          let current = this.telemetry.gateThroughput[gate];
          current = Math.max(0, current + Math.floor((Math.random() - 0.4) * 50));
          this.telemetry.gateThroughput[gate] = current;
        });

        // Randomly adjust crowd density
        Object.keys(this.telemetry.crowdDensity).forEach(stand => {
          let current = this.telemetry.crowdDensity[stand];
          // Slow drift for crowds
          current = Math.max(0, Math.min(100, current + Math.floor((Math.random() - 0.5) * 3)));
          this.telemetry.crowdDensity[stand] = current;
        });

        this.telemetry.timestamp = new Date().toISOString();
      }, 3000); // Update every 3 seconds
    }
  }
});
