import { describe, it, expect } from 'vitest';
import { getMockLLMResponse } from '../../src/services/offlineFallback';
import { MOCK_STADIUM_STATE } from '../../src/data/mockTelemetry';

describe('offlineFallback', () => {
  const telemetry = MOCK_STADIUM_STATE.telemetry;

  it('nearest exit in EN -> returns string containing exit', () => {
    const res = getMockLLMResponse(telemetry, 'where is the nearest exit?', 'en');
    expect(res.toLowerCase()).toContain('exit');
  });

  it('salida in ES -> returns Spanish exit directions', () => {
    const res = getMockLLMResponse(telemetry, 'salida más cercana', 'es');
    expect(res.toLowerCase()).toContain('salida');
  });

  it('sortie in FR -> returns French exit directions', () => {
    const res = getMockLLMResponse(telemetry, 'où est la sortie', 'fr');
    expect(res.toLowerCase()).toContain('sortie');
  });

  it('rollstuhl in DE -> returns wheelchair route in German', () => {
    const res = getMockLLMResponse(telemetry, 'ich brauche einen rollstuhl', 'de');
    expect(res.toLowerCase()).toContain('rollstuhl');
  });

  it('unknown intent -> returns a helpful general response, not empty string', () => {
    const res = getMockLLMResponse(telemetry, 'something completely unrelated', 'en');
    expect(res.length).toBeGreaterThan(0);
    expect(res).toContain('general stadium information');
  });

  it('food intent -> returns food info', () => {
    const res = getMockLLMResponse(telemetry, 'food', 'en');
    expect(res.toLowerCase()).toContain('food');
  });

  it('first aid intent -> returns medical info', () => {
    const res = getMockLLMResponse(telemetry, 'first aid', 'en');
    expect(res.toLowerCase()).toContain('first aid');
  });

  it('toilet intent -> returns restroom info', () => {
    const res = getMockLLMResponse(telemetry, 'toilet', 'en');
    expect(res.toLowerCase()).toContain('restroom');
  });

  it('park intent -> returns parking info', () => {
    const res = getMockLLMResponse(telemetry, 'park', 'en');
    expect(res.toLowerCase()).toContain('parking');
  });

  it('ticket intent -> returns ticket info', () => {
    const res = getMockLLMResponse(telemetry, 'ticket', 'en');
    expect(res.toLowerCase()).toContain('ticket');
  });

  it('crowd intent -> returns crowd info', () => {
    const res = getMockLLMResponse(telemetry, 'crowd', 'en');
    expect(res.toLowerCase()).toContain('density');
  });

  it('question with control chars -> sanitized before intent matching', () => {
    const res = getMockLLMResponse(telemetry, 'ex\x00it', 'en');
    expect(res.toLowerCase()).toContain('exit');
  });

  it('question > 2000 chars -> returns valid response', () => {
    const longString = 'exit' + 'a'.repeat(3000);
    const res = getMockLLMResponse(telemetry, longString, 'en');
    expect(res.length).toBeGreaterThan(0);
  });
});
