import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper'
import { RouteProviders } from '@/app/route-providers'
import { ConditionalAnalytics } from '@/components/privacy/conditional-analytics'
import { GlobalRealtimeCleanupHandler } from '@/components/realtime/global-cleanup-handler'
import { AuthHashRedirect } from '@/components/auth/auth-hash-redirect'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundaryWrapper>
          <RouteProviders>
            <AuthHashRedirect />
            {children}
          </RouteProviders>
        </ErrorBoundaryWrapper>
        <Toaster position="top-right" richColors />
        <ConditionalAnalytics />
        <GlobalRealtimeCleanupHandler />
      </body>
    </html>
  )
}