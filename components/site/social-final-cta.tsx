'use client'

import { useRouter } from 'next/navigation'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    title: 'Ready to meet your future housemates?',
    subtitle: 'Create your profile in minutes. Start with verified people.',
    primary: 'Get started',
    secondary: 'Safety',
  },
  nl: {
    title: 'Klaar om je toekomstige huisgenoten te ontmoeten?',
    subtitle: 'Maak je profiel in een paar minuten. Start met geverifieerde mensen.',
    primary: 'Begin nu',
    secondary: 'Veiligheid',
  },
}

export function SocialFinalCTA() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  return null
}

