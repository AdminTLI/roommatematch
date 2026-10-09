import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper'
import { RouteProviders } from '@/app/route-providers'
import { ConditionalAnalytics } from '@/components/privacy/conditional-analytics'
import { GlobalRealtimeCleanupHandler } from '@/components/realtime/global-cleanup-handler'
import { AuthHashRedirect } from '@/components/auth/auth-hash-redirect'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

import { getPlatformSettings } from '@/lib/platform-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription } = await getPlatformSettings()
  return {
    title: `${siteName} - From strangers to roommates`,
    description: siteDescription,
    icons: {
      icon: '/images/logo.png',
      apple: '/images/logo.png',
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
    },
    verification: {
      // Add your Google Search Console verification code here after claiming the property
      // google: 'your-verification-code',
    },
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#7a3bb6',
  /** Resize the layout viewport when the virtual keyboard opens (Android Chrome + modern browsers). */
  interactiveWidget: 'resizes-content' as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseOrigin = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      return url ? new URL(url).origin : null
    } catch {
      return null
    }
  })()

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundaryWrapper>
          <RouteProviders>
            <AuthHashRedirect />
            {children}
          </RouteProviders>
        </ErrorBoundaryWrapper>
        <ConditionalAnalytics />
        <GlobalRealtimeCleanupHandler />
      </body>
    </html>
  )
}