import { useStadiumStore } from '../store/useStadiumStore';
import { MOCK_STADIUM_STATE } from '../data/mockTelemetry';

import {
  CROWD_DENSITY_MODERATE,
  CROWD_DENSITY_CRITICAL,
  CROWD_DENSITY_LOW,
  DEFAULT_CROWD_DENSITY,
  URGENT_KICKOFF_MINS
} from '../constants';

export interface FanContext {
  currentZone: string;
  destinationIntent: string;
  accessibilityNeeds: string[];
  minutesToKickoff: number;
  language: 'en' | 'es' | 'fr' | 'de';
}

export interface DecisionResult {
  resolvedFacility: string;
  resolvedRoute: string[];
  crowdLevel: 'low' | 'medium' | 'high' | 'critical';
  isStepFree: boolean;
  urgencyFlag: boolean;
  alternativeFacility?: string;
  accessibilityMode: 'standard' | 'wheelchair' | 'screen_reader' | 'captioned';
}

/**
 * Resolves the fan context into a decision result.
 * Determines the target facility, route, crowd level, and accessibility mode
 * based on the fan's intent, accessibility needs, and current stadium telemetry.
 *
 * @param fanContext - The fan's current context, including location, intent, and needs.
 * @returns The decision result containing the resolved route and facility, or null if the intent is not recognized.
 */
export function resolveContext(fanContext: FanContext): DecisionResult | null {
  // Use mock state if running in test environment where pinia might not be initialized yet
  let telemetry;
  try {
    const store = useStadiumStore();
    telemetry = store.isOfflineMode ? MOCK_STADIUM_STATE.telemetry : store.telemetry;
  } catch (e) {
    telemetry = MOCK_STADIUM_STATE.telemetry;
  }

  const q = fanContext.destinationIntent.toLowerCase();
  
  let resolvedFacility: string | null = null;
  let route: string[] | null = null;

  if (q.includes('food') || q.includes('drink') || q.includes('concession') || q.includes('comida') || q.includes('bebida') || q.includes('nourriture') || q.includes('essen')) {
    resolvedFacility = 'Concourse B Concessions';
    route = [fanContext.currentZone, 'Level 1', 'Concourse B'];
  } else if (q.includes('toilet') || q.includes('restroom') || q.includes('bathroom') || q.includes('bano') || q.includes('toilettes') || q.includes('toilette')) {
    resolvedFacility = 'Section 115 Restrooms';
    route = [fanContext.currentZone, 'Main Concourse', 'Section 115'];
  } else if (q.includes('first aid') || q.includes('medical') || q.includes('doctor') || q.includes('primeros auxilios') || q.includes('premiers secours') || q.includes('erste hilfe')) {
    resolvedFacility = 'Gate B First Aid Station';
    route = [fanContext.currentZone, 'Level 1', 'Gate B'];
  } else if (q.includes('park') || q.includes('parking') || q.includes('estacionamiento') || q.includes('parkplatz')) {
    resolvedFacility = 'West Overflow Lot';
    route = [fanContext.currentZone, 'Main Exit', 'West Lot'];
  } else if (q.includes('ticket') || q.includes('box office') || q.includes('boleto') || q.includes('billet')) {
    resolvedFacility = 'Gate A Box Office';
    route = [fanContext.currentZone, 'Plaza', 'Gate A'];
  } else if (q.includes('exit') || q.includes('salida') || q.includes('sortie') || q.includes('ausgang')) {
    resolvedFacility = 'Gate C Exit';
    route = [fanContext.currentZone, 'Concourse A', 'Gate C'];
  }

  if (!resolvedFacility || !route) {
    return null;
  }

  const result: DecisionResult = {
    resolvedFacility,
    resolvedRoute: route,
    crowdLevel: 'low',
    isStepFree: false,
    urgencyFlag: false,
    accessibilityMode: 'standard'
  };

  // Resolve Crowd Level based on destination intent (simplified for demo)
  const density = telemetry.crowdDensity['East Stand'] || DEFAULT_CROWD_DENSITY;
  if (density < CROWD_DENSITY_LOW) result.crowdLevel = 'low';
  else if (density < CROWD_DENSITY_MODERATE) result.crowdLevel = 'medium';
  else if (density < CROWD_DENSITY_CRITICAL) result.crowdLevel = 'high';
  else result.crowdLevel = 'critical';

  // Apply Rules
  // a. Wheelchair need
  if (fanContext.accessibilityNeeds.includes('wheelchair')) {
    result.isStepFree = true;
    result.resolvedRoute = result.resolvedRoute.filter(zone => !zone.toLowerCase().includes('stairs'));
  }

  // b. Visual need
  if (fanContext.accessibilityNeeds.includes('visual')) {
    result.accessibilityMode = 'screen_reader';
  }

  // c. Hearing need
  if (fanContext.accessibilityNeeds.includes('hearing')) {
    result.accessibilityMode = 'captioned';
  }

  // d. Urgency flag
  const isGateOrSeat = fanContext.destinationIntent.toLowerCase().includes('gate') || fanContext.destinationIntent.toLowerCase().includes('seat');
  if (fanContext.minutesToKickoff < URGENT_KICKOFF_MINS && isGateOrSeat) {
    result.urgencyFlag = true;
  }

  // e. Alternative facility
  if (result.crowdLevel === 'high' || result.crowdLevel === 'critical') {
    result.alternativeFacility = 'Gate A';
    result.resolvedRoute = [fanContext.currentZone, 'Concourse B', 'Gate A'];
  }

  return result;
}
