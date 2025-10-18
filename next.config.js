/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    },
  },
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Completely disable CSS processing
    config.module.rules = config.module.rules.map(rule => {
      if (rule.test && rule.test.toString().includes('css')) {
        return {
          ...rule,
          use: ['style-loader', 'css-loader']
        }
      }
      return rule
    })
    
    // Remove CSS minimizer completely
    if (config.optimization && config.optimization.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        plugin => {
          const pluginName = plugin.constructor.name
          return !['CssMinimizerPlugin', 'OptimizeCSSAssetsPlugin'].includes(pluginName)
        }
      )
    }
    
    // Disable CSS extraction
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        styles: false,
      }
    }
    
    return config
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig// Force deployment with latest fixes
// Fix TypeScript error and force deployment
