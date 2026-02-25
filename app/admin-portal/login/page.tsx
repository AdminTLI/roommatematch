import type { Metadata } from 'next'
import { AdminLoginForm } from '@/app/admin/components/admin-login-form'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'

export const metadata: Metadata = {
  title: 'Admin Login | Domu Match',
  description: 'Secure Domu Match portal for university and platform administrators.',
}

export default function AdminPortalLoginPage() {
  return (
    <>
      <MarketingLayoutFix />
      <main
        id="main-content"
        className="relative min-h-screen overflow-hidden pt-16 md:pt-20"
      >
        <MarketingPageBackground />

        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <section className="w-full max-w-md">
            <AdminLoginForm />
          </section>
        </div>
      </main>
    </>
  )
}

