interface AppConfig {
  supabaseUrl: string; supabaseAnonKey: string; supabaseServiceKey: string;
  nextAuthSecret: string; nextAuthUrl: string;
  anthropicApiKey: string | null; googleClientId: string | null; googleClientSecret: string | null;
  socketUrl: string; socketPort: number; socketInternalKey: string;
  voyageApiKey: string | null; openAIApiKey: string | null;
  nodeEnv: 'development' | 'production' | 'test'; isProduction: boolean; isDevelopment: boolean;
}

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_config) return _config;
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'];
  _config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ?? '',
    nextAuthUrl: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    voyageApiKey: process.env.VOYAGE_API_KEY || null,
    openAIApiKey: process.env.OPENABE_API_KEY || null,
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
    socketPort: parseInt(process.env.SOCKET_PORT ?? '3001', 10),
    socketInternalKey: process.env.SOCKET_INTERNAL_KEY ?? 'advi-internal',
    nodeEnv, isProduction: nodeEnv === 'production', isDevelopment: nodeEnv === 'development',
  };
  return _config;
}

export const isProduction = () => getConfig().isProduction;
export const isDevelopment = () => getConfig().isDevelopment;
