import type { StadiumTelemetry, Incident } from '../../types';
import type { DecisionResult } from '../../services/decisionEngine';

export function createMockTelemetry(overrides?: Partial<StadiumTelemetry>): StadiumTelemetry {
  return {
    timestamp: new Date().toISOString(),
    wbgtTemperature: 28,
    gateThroughput: { GateA: 100 },
    transitDelays: { Line1: 5 },
    concessionInventory: { HotDog: 80 },
    crowdDensity: { Section1: 50 },
    ...overrides
  };
}

export function createMockIncident(overrides?: Partial<Incident>): Incident {
  return {
    id: 'inc-123',
    timestamp: new Date().toISOString(),
    reportedBy: 'user-1',
    location: {
      section: '112',
      gate: 'A',
      coordinates: [0, 0]
    },
    type: 'MEDICAL',
    severity: 'MEDIUM',
    description: 'Mock incident',
    status: 'OPEN',
    ...overrides
  };
}

export function createMockDecisionResult(overrides?: Partial<DecisionResult>): DecisionResult {
  return {
    resolvedFacility: 'Mock Facility',
    resolvedRoute: ['Point A', 'Point B'],
    crowdLevel: 'low',
    isStepFree: true,
    urgencyFlag: false,
    accessibilityMode: 'standard',
    ...overrides
  };
}

export function createMockFetchResponse(textOrObj: any, status = 200, ok = true): Response {
  return {
    ok,
    status,
    json: async () => textOrObj
  } as unknown as Response;
}
