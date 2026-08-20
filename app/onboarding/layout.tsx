import { Plus_Jakarta_Sans } from 'next/font/google'
import type { CSSProperties, ReactNode } from 'react'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-onboarding',
  display: 'swap',
})

const onboardingTokens = {
  '--ob-bg': '#F8FAFC',
  '--ob-primary': '#4F46E5',
  '--ob-text': '#0F172A',
  '--ob-muted': '#64748B',
  '--ob-card-radius': '16px',
  '--ob-btn-radius': '12px',
  '--ob-shadow': '0 10px 25px -5px rgba(0,0,0,0.05)',
} as CSSProperties

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${plusJakarta.variable} font-[family-name:var(--font-onboarding)] antialiased`}
      style={onboardingTokens}
    >
      {children}
    </div>
  )
}
