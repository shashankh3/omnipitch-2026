import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import type { Incident } from '../types';
import { INCIDENT_SEED } from '../services/dataLoader';
import { supabase } from '../services/supabase';

const VALID_TYPES: Incident['type'][] = ['MEDICAL', 'CROWD_BOTTLENECK', 'FACILITY_DAMAGE', 'WEATHER_HAZARD'];
const VALID_SEVERITIES: Incident['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES: Incident['status'][] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeText(value: unknown, fallback = '', maxLength = 280): string {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;
  const sanitized = String(value).replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLength);
  return sanitized || fallback;
}

function sanitizeIncident(value: unknown): Incident | null {
  if (!isRecord(value) || !isRecord(value.location)) return null;

  const type = value.type as Incident['type'];
  const severity = value.severity as Incident['severity'];
  const status = (value.status as Incident['status']) || 'OPEN';

  if (!VALID_TYPES.includes(type) || !VALID_SEVERITIES.includes(severity) || !VALID_STATUSES.includes(status)) return null;

  const section = sanitizeText(value.location.section, '', 80);
  const gate = sanitizeText(value.location.gate, 'Unknown', 40);
  const coordinates = Array.isArray(value.location.coordinates) && value.location.coordinates.length === 2
    ? value.location.coordinates.map(Number)
    : [0, 0];

  if (!sanitizeText(value.id, '', 80) || !section) return null;
  if (!coordinates.every(Number.isFinite)) return null;

  const sanitizedIncident: Incident = {
    id: sanitizeText(value.id, '', 80),
    timestamp: sanitizeText(value.timestamp, new Date().toISOString(), 40),
    reportedBy: sanitizeText(value.reportedBy, 'broadcast', 80),
    location: {
      section,
      gate,
      coordinates: coordinates as [number, number]
    },
    type,
    severity,
    description: sanitizeText(value.description, 'No description provided.', 500),
    status
  };

  if (typeof value.imageUrl === 'string') sanitizedIncident.imageUrl = sanitizeText(value.imageUrl, '', 500);
  if (typeof value.assignedTo === 'string') sanitizedIncident.assignedTo = sanitizeText(value.assignedTo, '', 120);

  return sanitizedIncident;
}

export const useIncidentStore = defineStore('incident', () => {
  const incidents = shallowRef<Incident[]>([...INCIDENT_SEED]);

  const loadSeed = () => {
    incidents.value = [...INCIDENT_SEED];
  };

  const addIncident = (incident: Omit<Incident, 'id' | 'timestamp'>) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString()
    };
    incidents.value = [...incidents.value, newIncident];

    supabase.channel('stadium_incidents').send({
      type: 'broadcast',
      event: 'new_incident',
      payload: { incident: newIncident }
    });
  };

  const initRealtime = () => {
    supabase.channel('stadium_incidents')
      .on('broadcast', { event: 'new_incident' }, ({ payload }) => {
        const inc = sanitizeIncident(payload?.incident);
        if (!inc) return;
        if (!incidents.value.find((i) => i.id === inc.id)) {
          incidents.value = [...incidents.value, inc];
        }
      })
      .subscribe();
  };

  const updateIncidentStatus = (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    incidents.value = incidents.value.map(i => i.id === id ? { ...i, status } : i);
  };

  const receiveFromBroadcast = (incident: Incident) => {
    const sanitized = sanitizeIncident(incident);
    if (sanitized && !incidents.value.find(i => i.id === sanitized.id)) {
      incidents.value = [...incidents.value, sanitized];
    }
  };

  return {
    incidents,
    loadSeed,
    addIncident,
    initRealtime,
    updateIncidentStatus,
    receiveFromBroadcast
  };
});
