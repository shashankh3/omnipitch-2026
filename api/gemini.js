import { GoogleGenerativeAI } from '@google/generative-ai';

const rateLimitMap = new Map(); // key: IP string, value: { tokens: number, lastRefill: number }
const CAPACITY = 10;
const REFILL_RATE = 10;
const WINDOW_MS = 60_000;

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com"
  );
  res.setHeader('X-XSS-Protection', '0');
  
  // CORS: same-origin in production; ALLOWED_ORIGIN env var for local dev against Vercel
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://omnipitch-2026.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isRateLimited(ip) {
  const now = Date.now();
  
  // Prune stale entries
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (now - bucket.lastRefill > 5 * 60_000) {
      rateLimitMap.delete(key);
    }
  }

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { tokens: CAPACITY - 1, lastRefill: now });
    return false;
  }
  const bucket = rateLimitMap.get(ip);
  const elapsed = now - bucket.lastRefill;
  const refilled = Math.floor((elapsed / WINDOW_MS) * REFILL_RATE);
  if (refilled > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refilled);
    bucket.lastRefill = now;
  }
  
  if (bucket.tokens <= 0) return true;
  bucket.tokens -= 1;
  return false;
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    
    if (isRateLimited(ip)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Rate limit exceeded', code: 429 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Request could not be processed', code: 500 });
    }

    // Model is pinned server-side; clients cannot select a different (pricier) model
    const model = 'gemini-2.5-flash';
    let { messages, tools } = req.body;
    
    // Sanitize input (messages is an array of strings in our usage, or objects)
    if (Array.isArray(messages)) {
      messages = messages.map(msg => {
        if (typeof msg === 'string') {
          return msg.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 2000);
        }
        return msg; // Vision objects pass through
      });

      // If the last message (user query) was a string and is now empty, return 400
      const lastMsg = messages[messages.length - 1];
      if (typeof lastMsg === 'string' && lastMsg.length === 0) {
        return res.status(400).json({ error: 'Invalid input', code: 400 });
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const aiModel = genAI.getGenerativeModel({ model, tools });
    const start = Date.now();
    const result = await aiModel.generateContent(messages);
    const response = await result.response;
    const latency = Date.now() - start;
    console.info('gemini_latency', { latencyMs: latency });
    res.setHeader('X-Response-Time', `${latency}ms`);
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    // Scrub logs
    const safeErrorMsg = (error.message || '').replace(new RegExp(process.env.GEMINI_API_KEY || 'MISSING_KEY', 'g'), '***');
    console.error('Gemini API Error:', safeErrorMsg);
    res.status(500).json({ error: 'Request could not be processed', code: 500 });
  }
}
