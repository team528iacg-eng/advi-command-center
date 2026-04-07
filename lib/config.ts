// App configuration - reads from environment variables
interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  anthropicApiKey: string;
  socketInternalKey: string;
  nextauthUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_config) return _config;
  _config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    socketInternalKey: process.env.SOCKET_INTERNAL_KEY ?? '',
    nextauthUrl: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
    nodeEnv: (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'],
  };
  return _config;
}

export const isDev = () => process.env.NODE_ENV !== 'production';
export const isProd = () => process.env.NODE_ENV === 'production';
