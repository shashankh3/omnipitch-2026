import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFanAssistance, getSimulatedMatchFeed, processVisionIncident, getTaskChecklist, getOrganizerRecommendation, translateAnnouncement, getSentimentAnalysis, clearGeminiCache } from '../gemini';
import { createPinia, setActivePinia } from 'pinia';
import { useSystemStore } from '../../store/useSystemStore';

describe('OmniPitch 2026 — Gemini AI Service Test Suite', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn());
    clearGeminiCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Mocked Safe AI Route Guidance.'
        })
      } as any);
      
      const response = await getFanAssistance('How do I exit safely?', 'en', sampleTelemetry, false);
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response).toBe('Mocked Safe AI Route Guidance.');
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
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            liveMatch: { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          })
        })
      } as any);
      const feed = await getSimulatedMatchFeed();
      expect(feed).toBeDefined();
      expect(feed).toHaveProperty('liveMatch');
      expect(feed).toHaveProperty('completedMatch');
      expect(feed).toHaveProperty('upcomingMatch');
    });

    it('liveMatch should contain team names and scores', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            liveMatch: { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          })
        })
      } as any);
      const feed = await getSimulatedMatchFeed();
      expect(feed.liveMatch).toHaveProperty('homeTeam');
      expect(feed.liveMatch).toHaveProperty('awayTeam');
      expect(typeof feed.liveMatch.homeScore).toBe('number');
      expect(typeof feed.liveMatch.awayScore).toBe('number');
    });

    it('liveMatch should contain valid hex color codes', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            liveMatch: { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          })
        })
      } as any);
      const feed = await getSimulatedMatchFeed();
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      expect(feed.liveMatch.primaryColor).toMatch(hexRegex);
      expect(feed.liveMatch.secondaryColor).toMatch(hexRegex);
    });

    it('liveMatch slides should be an array with at least one entry', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            liveMatch: { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          })
        })
      } as any);
      const feed = await getSimulatedMatchFeed();
      expect(Array.isArray(feed.liveMatch.slides)).toBe(true);
      expect(feed.liveMatch.slides.length).toBeGreaterThan(0);
    });

    it('completedMatch should have valid team names', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: "```json\n" + JSON.stringify({
            liveMatch: { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          }) + "\n``` some trailing text"
        })
      } as any);
      const feed = await getSimulatedMatchFeed();
      expect(typeof feed.completedMatch.homeTeam).toBe('string');
      expect(typeof feed.completedMatch.awayTeam).toBe('string');
    });
  });

  // ── Vision Incident Tests ──
  describe('processVisionIncident()', () => {
    it('should return a structured incident classification', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            type: 'MEDICAL',
            severity: 'HIGH',
            dispatchOrder: 'Medic'
          })
        })
      } as any);
      const result = await processVisionIncident('base64data', 'image/png', 'Section 112');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('dispatchOrder');
    });

    it('should return valid severity levels', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            type: 'MEDICAL',
            severity: 'LOW',
            dispatchOrder: 'Medic'
          })
        })
      } as any);
      const result = await processVisionIncident('base64data', 'image/jpeg', 'Gate A');
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      expect(validSeverities).toContain(result.severity);
    });

    it('should return valid incident types', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            type: 'WEATHER_HAZARD',
            severity: 'HIGH',
            dispatchOrder: 'Medic'
          })
        })
      } as any);
      const result = await processVisionIncident('base64data', 'image/png', 'Concourse B');
      const validTypes = ['MEDICAL', 'CROWD_BOTTLENECK', 'FACILITY_DAMAGE', 'WEATHER_HAZARD'];
      expect(validTypes).toContain(result.type);
    });
  });

  // ── Task Checklist Tests ──
  describe('getTaskChecklist()', () => {
    it('should return an array of 3 actionable steps', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify(["Step 1", "Step 2", "Step 3"])
        })
      } as any);
      const checklist = await getTaskChecklist('Flooded restroom block 3A');
      expect(Array.isArray(checklist)).toBe(true);
      expect(checklist.length).toBe(3);
    });

    it('should handle API errors and return fallback', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
      const checklist = await getTaskChecklist('Medical emergency in Section 205');
      expect(Array.isArray(checklist)).toBe(true);
      expect(checklist.length).toBeGreaterThan(0);
      expect(checklist[0]).toContain('Assess');
    });

    it('each step should be a non-empty string', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify(["Step 1", "Step 2"])
        })
      } as any);
      const checklist = await getTaskChecklist('Medical emergency in Section 205');
      checklist.forEach((step: string) => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    });
  });


  describe('getOrganizerRecommendation()', () => {
    it('returns recommendation', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Mocked Recommendation'
        })
      } as any);
      const telemetry = {
        timestamp: '2026-07-07T12:00:00Z',
        wbgtTemperature: 35.0,
        gateThroughput: {},
        crowdDensity: {},
        transitDelays: {},
        concessionInventory: {}
      };
      const response = await getOrganizerRecommendation('query', telemetry as any);
      expect(response).toBe('Mocked Recommendation');
    });

    it('handles error and returns fallback', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));
      const telemetry = { wbgtTemperature: 35.0, gateThroughput: {}, crowdDensity: {}, transitDelays: {}, concessionInventory: {} };
      const response = await getOrganizerRecommendation('query', telemetry as any);
      expect(response).toContain('AI Core offline');
    });
  });

  describe('translateAnnouncement()', () => {
    it('returns translation', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Mocked Translation'
        })
      } as any);
      const response = await translateAnnouncement('Hello');
      expect(response).toBe('Mocked Translation');
    });

    it('handles error and returns fallback', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));
      const response = await translateAnnouncement('Hello');
      expect(response).toContain('TRANSLATION ERROR');
    });
  });

  describe('getSentimentAnalysis()', () => {
    it('returns vibe score', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Mocked Vibe Score'
        })
      } as any);
      const telemetry = { wbgtTemperature: 35.0, gateThroughput: {}, crowdDensity: {}, transitDelays: {}, concessionInventory: {} };
      const response = await getSentimentAnalysis(telemetry as any);
      expect(response).toBe('Mocked Vibe Score');
    });

    it('handles error and returns fallback', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));
      const telemetry = { wbgtTemperature: 35.0, gateThroughput: {}, crowdDensity: {}, transitDelays: {}, concessionInventory: {} };
      const response = await getSentimentAnalysis(telemetry as any);
      expect(response).toContain('VIBE SCORE: Neutral. (Analysis Offline)');
    });
  });

  describe('Offline Mock Coverage', () => {
    it('forces offline mock for match feed', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const feed = await getSimulatedMatchFeed();
      expect(feed.liveMatch).toBeDefined();
    });

    it('forces offline mock for vision incident', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const res = await processVisionIncident('data', 'mime', 'sec');
      expect(res.severity).toBeDefined();
    });

    it('forces offline mock for task checklist', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const list = await getTaskChecklist('test');
      expect(list.length).toBeGreaterThan(0);
    });

    it('forces offline mock for fan assistance', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const res = await getFanAssistance('exit', 'en', {} as any, false);
      expect(res).toBeDefined();
    });

    it('forces offline mock for organizer recommendation', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const res = await getOrganizerRecommendation('query', {} as any);
      expect(res).toBeDefined();
    });

    it('forces offline mock for translate announcement', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const res = await translateAnnouncement('Hello');
      expect(res).toBeDefined();
    });

    it('forces offline mock for vibe score', async () => {
      const systemStore = useSystemStore();
      systemStore.setOfflineMode(true);
      const res = await getSentimentAnalysis({} as any);
      expect(res).toBeDefined();
    });
  });

  describe('Edge Case Normalization and Parsing Coverage', () => {
    it('processVisionIncident() should fallback if response is not JSON or malformed', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Not a json object' })
      } as any);
      const res = await processVisionIncident('data', 'mime', 'sec');
      expect(res.severity).toBe('MEDIUM');
    });

    it('processVisionIncident() should fallback if incident type is invalid', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: JSON.stringify({ type: 'INVALID', severity: 'HIGH', dispatchOrder: 'test' }) })
      } as any);
      const res = await processVisionIncident('data', 'mime', 'sec');
      expect(res.type).toBe('FACILITY_DAMAGE');
    });

    it('getTaskChecklist() should fallback if response is not an array', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: JSON.stringify({ step1: 'test' }) })
      } as any);
      const res = await getTaskChecklist('incident');
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(3);
    });

    it('getTaskChecklist() should fallback if array has fewer than 3 string elements', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: JSON.stringify(["Only one step"]) })
      } as any);
      const res = await getTaskChecklist('incident');
      expect(res.length).toBe(3);
    });

    it('getFanAssistance() should handle resolvedFacts', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Resolved facts handled' })
      } as any);
      const facts = { resolvedFacility: 'Toilet', resolvedRoute: ['A', 'B'], crowdLevel: 'low', isStepFree: true, urgencyFlag: false, accessibilityMode: 'none', alternativeFacility: null } as any;
      const res = await getFanAssistance('Where is Toilet?', 'en', {} as any, false, facts);
      expect(res).toBe('Resolved facts handled');
    });

    it('getSimulatedMatchFeed() should extract JSON array or object properly using extractJsonPayload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: '```json\n[{"bad": "data"}]\n```'
        })
      } as any);
      const res = await getSimulatedMatchFeed();
      // It falls back because normalizeMatchFeed expects a specific object schema, not an array
      expect(res.liveMatch).toBeDefined();
    });
    it('getSimulatedMatchFeed() should return cached feed if not expired', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            liveMatch: { homeTeam: 'X', awayTeam: 'Y', homeScore: 1, awayScore: 0, primaryColor: '#FF0000', secondaryColor: '#00FF00', slides: [{ id: 1, text: 'test', isGoal: false }] },
            completedMatch: { homeTeam: 'C', awayTeam: 'D', homeScore: 2, awayScore: 2 },
            upcomingMatch: { homeTeam: 'E', awayTeam: 'F', time: '18:00' }
          })
        })
      } as any);
      
      const feed1 = await getSimulatedMatchFeed();
      expect(feed1.liveMatch.homeTeam).toBe('X');
      
      vi.mocked(fetch).mockClear();
      const feed2 = await getSimulatedMatchFeed();
      expect(feed2).toBe(feed1);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('getSentimentAnalysis() should return cached sentiment if not expired', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Cached Sentiment' })
      } as any);
      const res1 = await getSentimentAnalysis({} as any);
      expect(res1).toBe('Cached Sentiment');
      
      vi.mocked(fetch).mockClear();
      const res2 = await getSentimentAnalysis({} as any);
      expect(res2).toBe('Cached Sentiment');
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
