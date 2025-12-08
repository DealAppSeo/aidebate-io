import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    // optimizePackageImports: ['lucide-react', 'framer-motion'], // Good practice but sticking to user request
  },
  images: {
    unoptimized: true,
    domains: ['qnnpjhlxljtqyigedwkb.supabase.co', 'ajpxpmkgkcaomqblkkme.supabase.co'],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Prevent audio fetch blocking render
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
