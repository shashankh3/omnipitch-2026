function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com"
  );
  res.setHeader('X-XSS-Protection', '0');
  
  // CORS Headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const geminiStatus = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY ? 'configured' : 'missing';
  const supabaseStatus = process.env.VITE_SUPABASE_URL ? 'configured' : 'missing';
  
  let llmMode = 'offline';
  if (geminiStatus === 'configured') {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (r.ok) llmMode = 'live';
    } catch {
      llmMode = 'offline';
    }
  }
  
  res.status(200).json({
    status: 'ok',
    llm: llmMode,
    gemini: geminiStatus,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString()
  });
}
