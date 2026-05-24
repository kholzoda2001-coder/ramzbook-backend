/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Bundle pdfkit as an external server package to avoid tree-shaking issues
  serverExternalPackages: ['pdfkit'],
  // Include pdfkit AFM font data + our custom fonts in the serverless bundle
  outputFileTracingIncludes: {
    '/api/admin/books/[id]/generate-pdf': [
      './node_modules/pdfkit/js/data/**/*',
      './public/fonts/**/*',
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'pdfkit'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin',      value: '*' },
          { key: 'Access-Control-Allow-Methods',     value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          // Include all custom headers used across admin & mobile routes
          { key: 'Access-Control-Allow-Headers',     value: 'Content-Type, Authorization, x-user-id, x-admin-api-key, x-admin-key' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

