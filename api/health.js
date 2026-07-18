function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com"
  );
  res.setHeader('X-XSS-Protection', '0');
  
  // CORS: pinned to deployment origin; ALLOWED_ORIGIN env var for local dev
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://omnipitch-2026.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const fireworksStatus = process.env.FIREWORKS_API_KEY ? 'configured' : 'missing';
  const supabaseStatus = process.env.VITE_SUPABASE_URL ? 'configured' : 'missing';
  
  // Determine LLM mode from env var presence only — no outbound API call
  const llmMode = fireworksStatus === 'configured' ? 'live' : 'offline';
  
  res.status(200).json({
    status: 'ok',
    llm: llmMode,
    fireworks: fireworksStatus,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString()
  });
}
