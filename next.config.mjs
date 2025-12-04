/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Type checking enabled
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'accucoder.app',
      },
      {
        protocol: 'https',
        hostname: 'www.accucoder.app',
      },
    ],
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },
  
  // Redirect HTTP to HTTPS (when not handled by platform)
  async redirects() {
    return [
      // Redirect www to non-www (or vice versa)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.accucoder.app',
          },
        ],
        destination: 'https://accucoder.app/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
