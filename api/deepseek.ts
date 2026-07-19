import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>(); // key: IP string, value: { tokens: number, lastRefill: number }
const CAPACITY = 20; // Increased to 20 to prevent starving on initial load
const REFILL_RATE = 10;
const WINDOW_MS = 60_000;
const MAX_STRING_LENGTH = 4_000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const TEXT_MODEL = 'accounts/fireworks/models/deepseek-v3';
const VISION_MODEL = 'accounts/fireworks/models/llama-v3p2-11b-vision-instruct'; // Fallback to a real multimodal model

function setSecurityHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://api.fireworks.ai"
  );
  res.setHeader('X-XSS-Protection', '0');

  // CORS: same-origin in production; ALLOWED_ORIGIN env var for local dev against Vercel
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://omnipitch-2026.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isRateLimited(ip: string): boolean {
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
  const bucket = rateLimitMap.get(ip)!;
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

function sanitizeString(value: string): string {
  return value.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, MAX_STRING_LENGTH);
}

function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeVisionPart(value: any): boolean {
  if (!isPlainObject(value) || !isPlainObject(value.inlineData)) return false;
  const { data, mimeType } = value.inlineData;
  if (typeof data !== 'string' || typeof mimeType !== 'string') return false;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) return false;

  const sizeEstimateBytes = Math.floor((data.length * 3) / 4);
  return /^[A-Za-z0-9+/=]+$/.test(data) && sizeEstimateBytes <= MAX_IMAGE_BYTES;
}

function sanitizeMessages(messages: any[]): any[] | null {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', code: 405 });
  }

  try {
    const ip = req.headers['x-vercel-forwarded-for']?.split(',')[0].trim() || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

    if (isRateLimited(ip)) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Rate limit exceeded', code: 429 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Request could not be processed', code: 500 });
    }

    const messages = sanitizeMessages(req.body?.messages);
    const expectJson = req.body?.expectJson === true;

    if (!messages) {
      return res.status(400).json({ error: 'Invalid input', code: 400 });
    }

    let openAiMessages = [];
    let hasVision = false;

    for (const msg of messages) {
      if (typeof msg !== 'string' && msg?.inlineData) {
        hasVision = true;
      }
    }

    if (hasVision) {
      let userContent = [];
      for (const msg of messages) {
        if (typeof msg === 'string') {
          userContent.push({ type: 'text', text: msg });
        } else if (msg.inlineData) {
          userContent.push({
            type: 'image_url',
            image_url: { url: `data:${msg.inlineData.mimeType};base64,${msg.inlineData.data}` }
          });
        }
      }
      openAiMessages.push({ role: 'user', content: userContent });
    } else {
      if (messages.length === 1) {
        openAiMessages.push({ role: 'user', content: messages[0] });
      } else if (messages.length > 1) {
        openAiMessages.push({ role: 'system', content: messages[0] });
        openAiMessages.push({ role: 'user', content: messages.slice(1).join('\n\n') });
      }
    }

    const model = hasVision ? VISION_MODEL : TEXT_MODEL;

    const requestBody = {
      model,
      messages: openAiMessages,
      max_tokens: 1024,
      temperature: 0.6,
    };

    if (expectJson) {
      requestBody.response_format = { type: 'json_object' };
    }

    const start = Date.now();
    
    const fwRes = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (fwRes.status === 429) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Rate limit exceeded', code: 429 });
    }
    
    if (fwRes.status === 401) {
      return res.status(401).json({ error: 'Unauthorized', code: 401 });
    }

    if (!fwRes.ok) {
      throw new Error(`Fireworks API returned ${fwRes.status} ${fwRes.statusText}`);
    }

    const data = await fwRes.json();
    const latency = Date.now() - start;
    console.info('llm_latency', { latencyMs: latency });
    res.setHeader('X-Response-Time', `${latency}ms`);

    let responseText = data.choices?.[0]?.message?.content || '';
    
    if (!responseText) {
      return res.status(200).json({ text: "I can't help with that request." });
    }

    res.status(200).json({ text: responseText });
  } catch (error) {
    if (process.env.ENABLE_DIAGNOSTICS) {
      console.error('DIAGNOSTICS - req.body:', JSON.stringify(req.body));
      console.error('DIAGNOSTICS - Error status:', error.status);
      console.error('DIAGNOSTICS - Error statusText:', error.statusText);
      console.error('DIAGNOSTICS - Full Error Details:', error);
    }
    const safeErrorMsg = (error.message || '').replace(new RegExp(process.env.FIREWORKS_API_KEY || 'MISSING_KEY', 'g'), '***');
    console.error('LLM API Error:', safeErrorMsg);
    res.status(500).json({ error: 'Request could not be processed', code: 500 });
  }
}
