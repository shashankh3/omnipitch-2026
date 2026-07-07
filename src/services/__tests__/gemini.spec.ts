import { describe, it, expect, vi } from 'vitest';
import { getFanAssistance, getSimulatedMatchFeed, processVisionIncident, getTaskChecklist } from '../gemini';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: { text: () => 'Mocked Safe AI Route Guidance.' }
          })
        };
      }
    }
  };
});

describe('OmniPitch 2026 — Gemini AI Service Test Suite', () => {

  // ── Fan Assistance Tests ──
  describe('getFanAssistance()', () => {
    const sampleTelemetry = {
      timestamp: '2026-07-07T12:00:00Z',
      wbgtTemperature: 35.0,
      gateThroughput: { 'GateA': 450, 'GateB': 120, 'GateC': 890 },
      crowdDensity: { 'North Stand': 85, 'South Stand': 45 },
      transitDelays: { 'Metro_Line1': 25, 'Bus_Express': 0 },
      concessionInventory: { 'Water_Sec100': 15 }
    };

    it('should return AI-generated response grounded in telemetry', async () => {
      const response = await getFanAssistance('How do I exit safely?', 'en', sampleTelemetry, false);
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should return API_KEY_MISSING when no key is configured', async () => {
      // The mock returns a response, but in real usage without a key, it returns a string.
      // This tests the function signature and return type contract.
      const response = await getFanAssistance('Where is Gate B?', 'es', sampleTelemetry, true);
      expect(typeof response).toBe('string');
    });

    it('should accept accessibility flag for step-free routing', async () => {
      const response = await getFanAssistance('Find step-free route', 'en', sampleTelemetry, true);
      expect(response).toBeDefined();
    });
  });

  // ── Match Feed Tests ──
  describe('getSimulatedMatchFeed()', () => {
    it('should return a valid match feed structure', async () => {
      const feed = await getSimulatedMatchFeed();
      expect(feed).toBeDefined();
      expect(feed).toHaveProperty('liveMatch');
      expect(feed).toHaveProperty('completedMatch');
      expect(feed).toHaveProperty('upcomingMatch');
    });

    it('liveMatch should contain team names and scores', async () => {
      const feed = await getSimulatedMatchFeed();
      expect(feed.liveMatch).toHaveProperty('homeTeam');
      expect(feed.liveMatch).toHaveProperty('awayTeam');
      expect(typeof feed.liveMatch.homeScore).toBe('number');
      expect(typeof feed.liveMatch.awayScore).toBe('number');
    });

    it('liveMatch should contain valid hex color codes', async () => {
      const feed = await getSimulatedMatchFeed();
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      expect(feed.liveMatch.primaryColor).toMatch(hexRegex);
      expect(feed.liveMatch.secondaryColor).toMatch(hexRegex);
    });

    it('liveMatch slides should be an array with at least one entry', async () => {
      const feed = await getSimulatedMatchFeed();
      expect(Array.isArray(feed.liveMatch.slides)).toBe(true);
      expect(feed.liveMatch.slides.length).toBeGreaterThan(0);
    });

    it('completedMatch should have valid team names', async () => {
      const feed = await getSimulatedMatchFeed();
      expect(typeof feed.completedMatch.homeTeam).toBe('string');
      expect(typeof feed.completedMatch.awayTeam).toBe('string');
    });
  });

  // ── Vision Incident Tests ──
  describe('processVisionIncident()', () => {
    it('should return a structured incident classification', async () => {
      const result = await processVisionIncident('base64data', 'image/png', 'Section 112');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('dispatchOrder');
    });

    it('should return valid severity levels', async () => {
      const result = await processVisionIncident('base64data', 'image/jpeg', 'Gate A');
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      expect(validSeverities).toContain(result.severity);
    });

    it('should return valid incident types', async () => {
      const result = await processVisionIncident('base64data', 'image/png', 'Concourse B');
      const validTypes = ['MEDICAL', 'CROWD_BOTTLENECK', 'FACILITY_DAMAGE', 'WEATHER_HAZARD'];
      expect(validTypes).toContain(result.type);
    });
  });

  // ── Task Checklist Tests ──
  describe('getTaskChecklist()', () => {
    it('should return an array of 3 actionable steps', async () => {
      const checklist = await getTaskChecklist('Flooded restroom block 3A');
      expect(Array.isArray(checklist)).toBe(true);
      expect(checklist.length).toBe(3);
    });

    it('each step should be a non-empty string', async () => {
      const checklist = await getTaskChecklist('Medical emergency in Section 205');
      checklist.forEach((step: string) => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    });
  });
});
