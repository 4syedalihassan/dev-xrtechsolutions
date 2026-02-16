/** @type {import('next').NextConfig} */
const nextConfig = {
  // DO NOT set output mode - let Netlify plugin handle deployment
  // The plugin automatically detects SSR needs from getServerSideProps

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable ESLint during build to unblock deployment (linting handled separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization for better SEO and performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xrtechsolutions.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Trailing slash for consistent URLs
  trailingSlash: false,

  // Compress responses for better performance
  compress: true,

  // Generate sitemap and robots.txt headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ];
  },

  // Turbopack config (empty to allow webpack config to work)
  turbopack: {},

  // Webpack config for Three.js
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;