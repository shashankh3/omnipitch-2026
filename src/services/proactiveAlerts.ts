import type { StadiumTelemetry } from '../types';
import { logger } from './logger';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertAudience = 'FAN' | 'VOLUNTEER' | 'ORGANIZER' | 'ALL';
export type SupportedLang = 'en' | 'es' | 'fr' | 'de';

export interface ProactiveAlert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  audience: AlertAudience;
  message: Record<SupportedLang, string>;
  timestamp: string;
  dismissed: boolean;
}

interface AlertRule {
  id: string;
  severity: AlertSeverity;
  audience: AlertAudience;
  check: (telemetry: StadiumTelemetry) => boolean;
  message: Record<SupportedLang, string>;
}

const ALERT_RULES: AlertRule[] = [
  {
    id: 'crowd_critical_east',
    severity: 'CRITICAL',
    audience: 'ORGANIZER',
    check: (t) => (t.crowdDensity['East Stand'] ?? 0) >= 90,
    message: {
      en: '⚠️ East Stand at critical capacity — recommend immediate Gate C diversion',
      es: '⚠️ Tribuna Este en capacidad crítica — desvío de Puerta C recomendado',
      fr: '⚠️ Tribune Est à capacité critique — déviation Porte C recommandée',
      de: '⚠️ Osttribüne kritisch — sofortige Umleitung Tor C empfohlen'
    }
  },
  {
    id: 'heat_hazard',
    severity: 'HIGH',
    audience: 'ALL',
    check: (t) => t.wbgtTemperature >= 35,
    message: {
      en: '🌡️ Extreme heat warning — visit hydration stations at Gate A & B',
      es: '🌡️ Aviso de calor extremo — estaciones de hidratación en Puerta A y B',
      fr: '🌡️ Alerte chaleur extrême — points d\'hydratation aux Portes A et B',
      de: '🌡️ Extreme Hitzewarnung — Hydrierungsstationen an Tor A und B aufsuchen'
    }
  },
  {
    id: 'gate_c_surge',
    severity: 'HIGH',
    audience: 'VOLUNTEER',
    check: (t) => (t.gateThroughput['GateC'] ?? 0) >= 1000,
    message: {
      en: '🚨 Gate C surge detected — deploy 2 additional staff immediately',
      es: '🚨 Avalancha en Puerta C — desplegar 2 efectivos adicionales',
      fr: '🚨 Afflux Porte C — déployer 2 agents supplémentaires immédiatement',
      de: '🚨 Ansturm Tor C — sofort 2 zusätzliche Mitarbeiter einsetzen'
    }
  },
  {
    id: 'metro_delay',
    severity: 'MEDIUM',
    audience: 'FAN',
    check: (t) => (t.transitDelays['Metro_Line1'] ?? 0) >= 20,
    message: {
      en: '🚇 Metro Line 1 delayed — consider Bus Express or rideshare alternatives',
      es: '🚇 Metro Línea 1 retrasado — considere Bus Exprés o alternativas',
      fr: '🚇 Métro Ligne 1 retardé — envisagez Bus Express ou covoiturage',
      de: '🚇 U-Bahn Linie 1 verspätet — Schnellbus oder Rideshare empfohlen'
    }
  },
  {
    id: 'water_low',
    severity: 'MEDIUM',
    audience: 'ORGANIZER',
    check: (t) => (t.concessionInventory['Water_Sec100'] ?? 100) <= 20,
    message: {
      en: '💧 Water stock critically low at Section 100 — restock immediately',
      es: '💧 Agua críticamente baja en Sección 100 — reponer inmediatamente',
      fr: '💧 Stock d\'eau critique Section 100 — réapprovisionner immédiatement',
      de: '💧 Wasservorrat kritisch niedrig Sektion 100 — sofort nachfüllen'
    }
  },
  {
    id: 'north_stand_busy',
    severity: 'LOW',
    audience: 'FAN',
    check: (t) => (t.crowdDensity['North Stand'] ?? 0) >= 80,
    message: {
      en: '📍 North Stand very busy — West Stand has plenty of space',
      es: '📍 Tribuna Norte muy concurrida — la Tribuna Oeste tiene espacio',
      fr: '📍 Tribune Nord très fréquentée — Tribune Ouest disponible',
      de: '📍 Nordtribüne sehr voll — Westtribüne hat freie Plätze'
    }
  }
];

// Track fired alerts to prevent repeat firing
const firedAlerts = new Set<string>();

export function evaluateAlerts(
  telemetry: StadiumTelemetry
): ProactiveAlert[] {
  const newAlerts: ProactiveAlert[] = [];

  ALERT_RULES.forEach((rule) => {
    if (rule.check(telemetry) && !firedAlerts.has(rule.id)) {
      firedAlerts.add(rule.id);
      const alert: ProactiveAlert = {
        id: crypto.randomUUID(),
        ruleId: rule.id,
        severity: rule.severity,
        audience: rule.audience,
        message: rule.message,
        timestamp: new Date().toISOString(),
        dismissed: false
      };
      newAlerts.push(alert);
      logger.ai('llm_offline', {
        intent: 'proactive_alert',
        zoneId: rule.id,
        mode: rule.severity
      });
    }

    // Reset fired state when condition clears (allow re-firing)
    if (!rule.check(telemetry) && firedAlerts.has(rule.id)) {
      firedAlerts.delete(rule.id);
    }
  });

  return newAlerts;
}

export function resetAlertState(): void {
  firedAlerts.clear();
}
