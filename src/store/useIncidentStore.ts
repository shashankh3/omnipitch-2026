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

      // We rely on the calling component or system to check if offlineMode is true,
      // but to decouple from useSystemStore here we broadcast unless the client
      // fails      // Broadcast the new incident to all other connected clients
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
          // Prevent duplicates
          if (!this.incidents.find(i => i.id === payload.incident.id)) {
            this.incidents.push(payload.incident);
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
