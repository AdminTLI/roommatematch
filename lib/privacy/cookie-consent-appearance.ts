'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export type CookieConsentAppearanceVariant = 'light' | 'dark'

export const cookieConsentGlass = {
  light: {
    panel:
      'rounded-3xl !border-slate-200/90 !bg-white/97 !text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl supports-[backdrop-filter]:!bg-white/95',
    overlay: 'bg-slate-900/40 backdrop-blur-md',
    icon: 'text-blue-600',
    title: '!text-slate-900',
    body: '!text-slate-700',
    muted: '!text-slate-600',
    link: 'text-blue-600 hover:text-blue-700',
    headerBorder: 'border-slate-200/90',
    footer: 'border-slate-200/90 !bg-white backdrop-blur-xl',
    row: 'border-slate-200/90 !bg-white',
    rowMuted: 'border-slate-200/90 !bg-slate-50',
    primaryBtn:
      'rounded-full !bg-blue-600 !text-white font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:!bg-blue-700',
    outlineBtn:
      'rounded-full !border-slate-300 !bg-white !text-slate-900 shadow-sm hover:!bg-slate-50 hover:!border-slate-400',
    ghostBtn:
      'rounded-full !text-slate-700 hover:!bg-slate-100 hover:!text-slate-900',
    closeBtn: '!text-slate-600 hover:!bg-slate-100 hover:!text-slate-900',
    reopenBtn:
      '!border-slate-300 !bg-white/95 !text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.1)] backdrop-blur-xl',
    scrollbar: '[&::-webkit-scrollbar-thumb]:bg-slate-300',
  },
  dark: {
    panel:
      'rounded-3xl border border-white/15 !bg-slate-900/90 !text-slate-50 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:!bg-slate-900/80',
    overlay: 'bg-black/55 backdrop-blur-sm',
    icon: 'text-violet-400',
    title: 'text-slate-50',
    body: 'text-slate-300',
    muted: 'text-slate-400',
    link: 'text-violet-400 hover:text-violet-300',
    headerBorder: 'border-slate-700',
    footer: 'border-slate-700 !bg-slate-900/70 backdrop-blur-sm',
    row: 'border-slate-600',
    rowMuted: 'border-slate-600 bg-slate-800/60',
    primaryBtn:
      'rounded-full !bg-violet-600 !text-white font-semibold shadow-lg shadow-violet-600/25 hover:!bg-violet-700',
    outlineBtn:
      'rounded-full !border-slate-600 !bg-slate-800/80 !text-slate-100 hover:!bg-slate-800',
    ghostBtn:
      'rounded-full !text-slate-300 hover:!bg-slate-800 hover:!text-slate-50',
    closeBtn: 'text-slate-400 hover:bg-slate-800 hover:text-slate-50',
    reopenBtn:
      '!border-slate-600 !bg-slate-900/90 !text-slate-100 shadow-md backdrop-blur-md',
    scrollbar: '[&::-webkit-scrollbar-thumb]:bg-slate-600',
  },
} as const

/** Picks light vs dark glass from the active theme (not the route). */
export function useCookieConsentAppearance() {
  const { resolvedTheme } = useTheme()
  const [variant, setVariant] = useState<CookieConsentAppearanceVariant>('dark')

  useEffect(() => {
    setVariant(resolvedTheme === 'light' ? 'light' : 'dark')
  }, [resolvedTheme])

  return cookieConsentGlass[variant]
}
