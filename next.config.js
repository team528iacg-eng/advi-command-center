/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@anthropic-ai/sdk',
    'bcryptjs',
    'pdf-parse',
    'mammoth',
  ],
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    }],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, net: false, tls: false,
        crypto: false, stream: false, zlib: false,
        http: false, https: false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;
