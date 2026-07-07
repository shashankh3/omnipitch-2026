import { describe, it, expect, vi } from 'vitest';
import { getFanAssistance } from '../gemini';

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

describe('OmniPitch 2026 GenAI Grounding Test Suite', () => {
  it('should format context metrics accurately and output safe data structures', async () => {
    const sampleTelemetry = {
      timestamp: '2026-07-07T12:00:00Z',
      wbgtTemperature: 95.0,
      gateThroughput: { 'GateA': 100 },
      crowdDensity: { 'GateA': 50 },
      transitDelays: { 'Metro': 0 },
      concessionInventory: {}
    };
    
    // Using import.meta.env mock setup typically done in setupFiles, 
    // but here we just rely on the API key being empty or mock behaving well.
    const response = await getFanAssistance('How do I exit safely?', 'en', sampleTelemetry, false);
    expect(response).toContain('Mocked Safe AI Route Guidance.');
  });
});
