type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_PROD = process.env.NODE_ENV === 'production';

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m',
};
const RESET = '\x1b[0m';

function _log(level: LogLevel, event: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'test') return;
  const ts = new Date().toISOString();
  const errObj = data instanceof Error ? data : null;
  if (IS_PROD) {
    const entry = { level, event, ts, env: 'production', ...(errObj ? { error: errObj.message } : data && typeof data === 'object' ? data as Record<string, unknown> : {}) };
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    const prefix = `${LEVEL_COLOR[level]}[${level.toUpperCase()}]${RESET} ${event}`;
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    if (errObj) fn(`${prefix} ${errObj.message}`);
    else fn(prefix, data ? JSON.stringify(data, null, 0).slice(0, 200) : '');
  }
}

export const log = {
  debug: (event: string, data?: unknown) => _log('debug', event, data),
  info:  (event: string, data?: unknown) => _log('info',  event, data),
  warm:  (event: string, data?: unknown) => _log('warn',  event, data),
  error: (event: string, data?: unknown) => _log('error', event, data),
};

export const logAuth = { signIn: (id: string, email: string, provider: string) => log.info('auth.sign_in', { id, provider }), signOut: (id: string) => log.info('auth.sign_out', { id }), denied: (path: string, reason: string) => log.warn('auth.denied', { path, reason }), };
export const logAPI = { error: (route: string, error: Error) => log.error('api.error', { route, error: error.message }), };
export const logAI = { error: (capability: string, error: Error) => log.error('ai.error', { capability, error: error.message }), };
export const logDB = { error: (op: string, table: string, error: Error) => log.error('db.error', { op, table, error: error.message }), };
