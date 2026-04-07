// Simple logger for server-side use
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, context: string, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] [${context}] ${message}`;
  return data ? `${base} ${JSON.stringify(data)}` : base;
}

export const log = {
  info: (ctx: string, msg: string, data?: unknown) => console.log(formatLog('info', ctx, msg, data)),
  warn: (ctx: string, msg: string, data?: unknown) => console.warn(formatLog('warn', ctx, msg, data)),
  error: (ctx: string, msg: string, data?: unknown) => console.error(formatLog('error', ctx, msg, data)),
  debug: (ctx: string, msg: string, data?: unknown) => { if (process.env.NODE_ENV !== 'production') console.log(formatLog('debug', ctx, msg, data)); },
};

export const logAuth = (msg: string, data?: unknown) => log.info('auth', msg, data);
export const logAPI = (msg: string, data?: unknown) => log.info('api', msg, data);
export const logAI = (msg: string, data?: unknown) => log.info('ai', msg, data);
export const logDB = (msg: string, data?: unknown) => log.info('db', msg, data);
