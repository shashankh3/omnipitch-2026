import { describe, it, expect, vi } from 'vitest';
import { logger } from '../logger';

describe('Logger', () => {
  it('sanitizeMeta strips apiKey key -> [REDACTED]', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test_event', { apiKey: 'secret', zoneId: 'gate_a' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[OmniPitch] test_event'),
      expect.objectContaining({ apiKey: '[REDACTED]', zoneId: 'gate_a' })
    );
    consoleSpy.mockRestore();
  });

  it('sanitizeMeta strips question key -> [REDACTED]', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test_event', { question: 'what is the score?', intent: 'score' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[OmniPitch] test_event'),
      expect.objectContaining({ question: '[REDACTED]', intent: 'score' })
    );
    consoleSpy.mockRestore();
  });

  it('sanitizeMeta keeps zoneId, intent, language unchanged', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.ai('llm_call', { zoneId: 'z1', intent: 'ask', language: 'es' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ zoneId: 'z1', intent: 'ask', language: 'es' })
    );
    consoleSpy.mockRestore();
  });

  it('logger.error() never throws even with undefined code', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => logger.error('Some error')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('[OmniPitch:ERROR] Some error', '');
    consoleSpy.mockRestore();
  });

  it('logger.warn handles meta correctly', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('warn event');
    expect(consoleSpy).toHaveBeenCalledWith('[OmniPitch:WARN] warn event', '');
    
    logger.warn('warn event with meta', { key: 'secret' });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[OmniPitch:WARN] warn event with meta',
      expect.objectContaining({ key: '[REDACTED]' })
    );
    consoleSpy.mockRestore();
  });

  it('logger.error() logs code when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Some error', 500);
    expect(consoleSpy).toHaveBeenCalledWith('[OmniPitch:ERROR] Some error', 500);
    consoleSpy.mockRestore();
  });

  it('logger.ai() only accepts whitelisted event names (type check)', () => {
    // This is tested implicitly by TS compilation, but we can verify it calls info correctly
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.ai('llm_success');
    expect(consoleSpy).toHaveBeenCalledWith('[OmniPitch] AI:llm_success', '');
    consoleSpy.mockRestore();
  });
});
