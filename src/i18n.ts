import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    dashboard: 'Dashboard',
    incidents: 'Incidents',
    telemetry: 'Telemetry',
    concierge: 'AI Concierge',
    loadLiveScore: 'Load Live Score',
    systemFault: 'System Fault Detected'
  },
  es: {
    dashboard: 'Tablero',
    incidents: 'Incidentes',
    telemetry: 'Telemetría',
    concierge: 'Conserje IA',
    loadLiveScore: 'Cargar Puntuación',
    systemFault: 'Fallo del Sistema Detectado'
  },
  fr: {
    dashboard: 'Tableau de bord',
    incidents: 'Incidents',
    telemetry: 'Télémétrie',
    concierge: 'Concierge IA',
    loadLiveScore: 'Charger le score',
    systemFault: 'Défaut système détecté'
  },
  de: {
    dashboard: 'Armaturenbrett',
    incidents: 'Vorfälle',
    telemetry: 'Telemetrie',
    concierge: 'KI-Concierge',
    loadLiveScore: 'Spielstand laden',
    systemFault: 'Systemfehler erkannt'
  }
};

export const i18n = createI18n({
  legacy: false, // use Composition API
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
