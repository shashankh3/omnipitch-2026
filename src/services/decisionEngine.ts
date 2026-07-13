import { useStadiumStore } from '../store/useStadiumStore';
import { MOCK_STADIUM_STATE } from '../data/mockTelemetry';

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

export function resolveContext(fanContext: FanContext): DecisionResult {
  // Use mock state if running in test environment where pinia might not be initialized yet
  let telemetry;
  try {
    const store = useStadiumStore();
    telemetry = store.isOfflineMode ? MOCK_STADIUM_STATE.telemetry : store.telemetry;
  } catch (e) {
    telemetry = MOCK_STADIUM_STATE.telemetry;
  }

  const result: DecisionResult = {
    resolvedFacility: 'Gate C',
    resolvedRoute: [fanContext.currentZone, 'Concourse A', 'Gate C'],
    crowdLevel: 'low',
    isStepFree: false,
    urgencyFlag: false,
    accessibilityMode: 'standard'
  };

  // Resolve Crowd Level based on destination intent (simplified for demo)
  const density = telemetry.crowdDensity['East Stand'] || 50;
  if (density < 40) result.crowdLevel = 'low';
  else if (density < 70) result.crowdLevel = 'medium';
  else if (density < 90) result.crowdLevel = 'high';
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
  if (fanContext.minutesToKickoff < 15 && isGateOrSeat) {
    result.urgencyFlag = true;
  }

  // e. Alternative facility
  if (result.crowdLevel === 'high' || result.crowdLevel === 'critical') {
    result.alternativeFacility = 'Gate A';
    result.resolvedRoute = [fanContext.currentZone, 'Concourse B', 'Gate A'];
  }

  return result;
}
