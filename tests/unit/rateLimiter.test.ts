import { describe, it, expect, vi } from 'vitest';
import handler from '../../api/gemini.js';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: { text: () => 'Mocked text' }
          })
        };
      }
    }
  };
});

describe('rateLimiter', () => {
  it('First 10 requests from same IP -> all pass (not rate limited)', async () => {
    let passed = 0;
    for (let i = 0; i < 10; i++) {
      const req = { method: 'POST', headers: { 'x-forwarded-for': '127.0.0.1' }, body: { messages: ['hello'] } };
      const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
      await handler(req, res);
      if (res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] !== 429) {
        passed++;
      }
    }
    expect(passed).toBe(10);
  });

  it('11th request from same IP -> isRateLimited returns true (429)', async () => {
    const req = { method: 'POST', headers: { 'x-forwarded-for': '127.0.0.1' }, body: { messages: ['hello'] } };
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('Different IPs -> independent buckets, dont share limits', async () => {
    const req = { method: 'POST', headers: { 'x-forwarded-for': '127.0.0.2' }, body: { messages: ['hello'] } };
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler(req, res);
    expect(res.status).not.toHaveBeenCalledWith(429);
  });
});

