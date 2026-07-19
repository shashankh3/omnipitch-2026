import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api/gemini.js', () => {
  let handler;

  beforeEach(async () => {
    vi.resetModules();
    process.env.FIREWORKS_API_KEY = 'test-key';
    handler = (await import('../gemini.js')).default;
    mockFetch.mockReset();
  });

  const createReq = (method = 'POST', body = {}, headers = {}) => ({
    method,
    body,
    headers,
    socket: { remoteAddress: '127.0.0.1' }
  });

  const createRes = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn()
    };
    return res;
  };

  it('returns 405 if method is not POST', async () => {
    const req = createReq('GET');
    const res = createRes();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed', code: 405 });
  });

  it('returns 400 if messages is missing or invalid', async () => {
    const req = createReq('POST', { messages: [] });
    const res = createRes();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input', code: 400 });
  });

  it('returns 500 if FIREWORKS_API_KEY is missing', async () => {
    delete process.env.FIREWORKS_API_KEY;
    const req = createReq('POST', { messages: ['hello'] });
    const res = createRes();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles successful fetch (200) and returns text', async () => {
    const req = createReq('POST', { messages: ['hello', 'world'] });
    const res = createRes();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: 'hello back' } }
        ]
      })
    });
    
    await handler(req, res);
    
    expect(mockFetch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: 'hello back' });
  });

  it('returns 500 on fetch throw', async () => {
    const req = createReq('POST', { messages: ['hello'] });
    const res = createRes();
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Request could not be processed', code: 500 });
  });
});
