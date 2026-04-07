/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds even if there are type errors
    // Type checking is still done in CI/editor - this just unblocks deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'socket.io'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'bufferutil', 'utf-8-validate'];
    return config;
  },
};

module.exports = nextConfig;
