import { GoogleGenerativeAI } from '@google/generative-ai';

const rateLimitCache = new Map();

export default async function handler(req, res) {
  // CORS Headers for Vercel (if needed for cross-origin, but usually same-origin is fine)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Simple memory rate limit (10 reqs / min per IP)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    if (!rateLimitCache.has(ip)) {
      rateLimitCache.set(ip, { count: 1, firstRequest: now });
    } else {
      const rateData = rateLimitCache.get(ip);
      if (now - rateData.firstRequest > 60000) {
        // Reset after 1 minute
        rateLimitCache.set(ip, { count: 1, firstRequest: now });
      } else {
        rateData.count++;
        if (rateData.count > 10) {
          return res.status(429).json({ error: 'Too Many Requests - Rate Limit Exceeded' });
        }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ error: 'API_KEY_MISSING' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { model = 'gemini-2.5-flash', messages, systemInstruction, tools } = req.body;
    
    const aiModel = genAI.getGenerativeModel({ model, tools });
    const result = await aiModel.generateContent(messages);
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
