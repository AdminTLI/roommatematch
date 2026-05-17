import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlatformSettings } from '@/lib/platform-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPlatformSettings()
  return {
    title: `Maintenance | ${siteName}`,
    description: `${siteName} is temporarily unavailable while we perform maintenance.`,
    robots: { index: false, follow: false },
  }
}

export default async function MaintenancePage() {
  const { siteName } = await getPlatformSettings()

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-lg text-center space-y-6">
        <p className="text-sm font-semibold tracking-wide text-violet-700">{siteName}</p>
        <h1 className="text-3xl font-bold text-slate-900">We&apos;ll be back soon</h1>
        <p className="text-slate-600 text-lg">
          We&apos;re performing scheduled maintenance. Please check again in a little while.
        </p>
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-violet-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
