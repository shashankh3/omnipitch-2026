import { GoogleGenerativeAI } from '@google/generative-ai';

const rateLimitMap = new Map(); // key: IP string, value: { tokens: number, lastRefill: number }
const CAPACITY = 10;
const REFILL_RATE = 10;
const WINDOW_MS = 60_000;
const MAX_STRING_LENGTH = 4_000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

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

function sanitizeString(value) {
  return value.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, MAX_STRING_LENGTH);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeVisionPart(value) {
  if (!isPlainObject(value) || !isPlainObject(value.inlineData)) return false;
  const { data, mimeType } = value.inlineData;
  if (typeof data !== 'string' || typeof mimeType !== 'string') return false;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) return false;

  const sizeEstimateBytes = Math.floor((data.length * 3) / 4);
  return /^[A-Za-z0-9+/=]+$/.test(data) && sizeEstimateBytes <= MAX_IMAGE_BYTES;
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 8) return null;

  const sanitized = messages.map(msg => {
    if (typeof msg === 'string') return sanitizeString(msg);
    if (isSafeVisionPart(msg)) return msg;
    return null;
  });

  if (sanitized.some(msg => msg === null)) return null;
  if (sanitized.every(msg => typeof msg === 'string' && msg.length === 0)) return null;
  return sanitized;
}

function sanitizeTools(tools) {
  if (tools === undefined) return undefined;
  if (!Array.isArray(tools) || tools.length > 1) return undefined;
  return tools.every(tool => isPlainObject(tool) && isPlainObject(tool.googleSearch))
    ? [{ googleSearch: {} }]
    : undefined;
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
    const messages = sanitizeMessages(req.body?.messages);
    const tools = sanitizeTools(req.body?.tools);

    if (!messages) {
      return res.status(400).json({ error: 'Invalid input', code: 400 });
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
