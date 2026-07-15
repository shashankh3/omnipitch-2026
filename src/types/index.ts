export type UserRole = 'FAN' | 'VOLUNTEER' | 'ORGANIZER';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  language: string;
  accessibilityProfile: {
    requiresStepFree: boolean;
    sensoryMode?: 'screen_reader' | 'captioned';
  };
}

export interface Incident {
  id: string;
  timestamp: string;
  reportedBy: string;
  location: {
    section: string;
    gate: string;
    coordinates: [number, number];
  };
  type: 'MEDICAL' | 'CROWD_BOTTLENECK' | 'FACILITY_DAMAGE' | 'WEATHER_HAZARD';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  imageUrl?: string;
  assignedTo?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface StadiumTelemetry {
  timestamp: string;
  wbgtTemperature: number; // Wet Bulb Globe Temperature for heat safety tracking
  gateThroughput: Record<string, number>; // Maps gate identifier to entry count/min
  transitDelays: Record<string, number>; // Maps transit lines to latency in minutes
  concessionInventory: Record<string, number>; // Item stock level percentages
  crowdDensity: Record<string, number>; // Maps seating sections to density percentages
}
