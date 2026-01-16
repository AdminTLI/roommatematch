/** @type {import('next').NextConfig} */
// Force Vercel rebuild - Last updated: 2025-10-21
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL].filter(Boolean)
        : ['localhost:3000'],
    },
  },
  // Force SWC to transpile packages that ship modern syntax (Sentry client utilities)
  transpilePackages: ['@sentry-internal/browser-utils'],
  eslint: {
    // TODO: Fix ESLint errors and remove this flag
    // Run: npm run lint to identify errors, then fix them
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Fix TypeScript errors and remove this flag
    // Run: npm run type-check to identify errors, then fix them
    ignoreBuildErrors: true,
  },
  compiler: {
    // Remove console.log, console.info, console.debug in production
    // Keep console.error and console.warn for error tracking
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { dev, isServer }) => {
    // Fix date-fns module resolution issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'date-fns/esm': 'date-fns',
    }

    if (dev) {
      // Use native file system events instead of aggressive polling to avoid chunk loading issues
      // Native events are faster and more reliable for most development environments
      // If you're using Docker, WSL, or network filesystems and need polling, set ENABLE_WEBPACK_POLLING=true
      config.watchOptions = {
        poll: process.env.ENABLE_WEBPACK_POLLING === 'true' ? 1000 : false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      }
      
      // Improve chunk loading reliability in development
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Ensure Sentry and other large dependencies are properly chunked
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]/,
                priority: 20,
                reuseExistingChunk: true,
              },
            },
          },
        }
      }
    }

    return config
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.persona.com https://cdn.withpersona.com https://*.vercel-insights.com https://va.vercel-scripts.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://*.supabase.co https://*.persona.com https://cdn.withpersona.com https://*.sentry.io https://*.vercel-insights.com",
              "worker-src 'self' blob:",
              "frame-src https://*.persona.com https://cdn.withpersona.com https://inquiry.withpersona.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'domu-match',
  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
