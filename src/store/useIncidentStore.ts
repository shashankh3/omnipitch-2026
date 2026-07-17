import { defineStore } from 'pinia';
import type { Incident } from '../types';
import { INCIDENT_SEED } from '../services/dataLoader';
import { supabase } from '../services/supabase';

export const useIncidentStore = defineStore('incident', {
  state: () => ({
    incidents: [...INCIDENT_SEED] as Incident[]
  }),
  actions: {
    loadSeed() {
      this.incidents = [...INCIDENT_SEED];
    },
    addIncident(incident: Omit<Incident, 'id' | 'timestamp'>) {
      const newIncident: Incident = {
        ...incident,
        id: `inc_${crypto.randomUUID()}`,
        timestamp: new Date().toISOString()
      };
      this.incidents.push(newIncident);

      // Broadcast the new incident to all other connected clients
      supabase.channel('stadium_incidents').send({
        type: 'broadcast',
        event: 'new_incident',
        payload: { incident: newIncident }
      });
    },
    initRealtime() {
      // Subscribe to incident broadcasts
      supabase.channel('stadium_incidents')
        .on('broadcast', { event: 'new_incident' }, ({ payload }) => {
          const inc = payload?.incident;
          // Validate required fields before trusting broadcast
          if (!inc?.id || !inc?.type || !inc?.severity || !inc?.location?.section) return;
          const VALID_TYPES = ['MEDICAL', 'CROWD_BOTTLENECK', 'FACILITY_DAMAGE', 'WEATHER_HAZARD'];
          const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
          if (!VALID_TYPES.includes(inc.type) || !VALID_SEVERITIES.includes(inc.severity)) return;
          // Prevent duplicates
          if (!this.incidents.find((i: Incident) => i.id === inc.id)) {
            this.incidents.push(inc);
          }
        })
        .subscribe();
    },
    updateIncidentStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
      const incident = this.incidents.find(i => i.id === id);
      if (incident) {
        incident.status = status;
      }
    },
    receiveFromBroadcast(incident: Incident) {
      if (!this.incidents.find(i => i.id === incident.id)) {
        this.incidents.push(incident);
      }
    }
  }
});
