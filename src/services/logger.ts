type LogMeta = Record<string, string | number | boolean | any>;

const BANNED_KEYS = ['apiKey', 'key', 'token', 'password',
                     'question', 'email', 'GEMINI_API_KEY'];

function sanitizeMeta(meta: LogMeta): LogMeta {
  const safe: LogMeta = {};
  Object.entries(meta).forEach(([k, v]) => {
    if (BANNED_KEYS.some(banned => k.toLowerCase().includes(banned.toLowerCase()))) {
      safe[k] = '[REDACTED]';
    } else {
      safe[k] = v;
    }
  });
  return safe;
}

export const logger = {
  info(event: string, meta?: LogMeta) {
    if (import.meta.env.DEV) {
      console.info(`[OmniPitch] ${event}`, meta ? sanitizeMeta(meta) : '');
    }
  },
  warn(event: string, meta?: LogMeta) {
    console.warn(`[OmniPitch:WARN] ${event}`, meta ? sanitizeMeta(meta) : '');
  },
  error(event: string, code?: number | any) {
    // Never log the raw Error object — only event name + numeric code
    console.error(`[OmniPitch:ERROR] ${event}`, code !== undefined ? code : '');
  },
  ai(event: 'llm_call' | 'llm_fallback' | 'llm_offline' | 'llm_success',
     meta?: { zoneId?: string; intent?: string; language?: string; mode?: string }) {
    // AI-specific log — only structural metadata, never prompt content
    this.info(`AI:${event}`, meta as LogMeta);
  }
};
