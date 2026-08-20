import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-onboarding',
  display: 'swap',
})

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${plusJakarta.variable} onboarding-root font-[family-name:var(--font-onboarding)] antialiased`}
    >
      {children}
    </div>
  )
}
