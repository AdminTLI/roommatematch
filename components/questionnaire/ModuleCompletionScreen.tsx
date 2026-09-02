'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { OnboardingChromeHeader } from '@/components/questionnaire/OnboardingChromeHeader'
import { ModuleTracker } from '@/components/questionnaire/ModuleTracker'
import { cn } from '@/lib/utils'

const SHORT_LABELS = [
  'Logistics',
  'Environment',
  'Cleanliness',
  'Communication',
  'Social Life',
] as const

const MODULE_INTROS: Record<
  number,
  { next: string | null; intro: string }
> = {
  0: {
    next: 'Environment and Rhythms',
    intro: 'How you sleep, study/work, and share space.',
  },
  1: {
    next: 'Cleanliness and Operations',
    intro: 'Kitchen habits, chores, and household upkeep.',
  },
  2: {
    next: 'Communication and Resolution',
    intro: 'How you give feedback and handle conflict.',
  },
  3: {
    next: 'Social Life and Spaces',
    intro: 'Guests, gatherings, and how you use shared areas.',
  },
  4: {
    next: null,
    intro: "You've completed all 5 modules.",
  },
}

interface ModuleCompletionScreenProps {
  moduleIndex: number
  moduleLabel: string
  nextUrl: string
  answeredCount: number
  totalCount: number
}

export function ModuleCompletionScreen({
  moduleIndex,
  moduleLabel,
  nextUrl,
  answeredCount,
  totalCount,
}: ModuleCompletionScreenProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { next, intro } = MODULE_INTROS[moduleIndex] ?? { next: null, intro: '' }
  const isLast = moduleIndex === 4
  const displayModule = moduleIndex + 1
  const headerLabel = SHORT_LABELS[moduleIndex] ?? moduleLabel

  useEffect(() => {
    const canvas = canvasRef.current
    const card = cardRef.current
    if (!canvas || !card) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let startId = 0
    let cancelled = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const colors = [
      '#6366F1',
      '#6366F1',
      '#818CF8',
      '#A5B4FC',
      '#C7D2FE',
      '#34D399',
      '#6EE7B7',
      '#F59E0B',
      '#FBBF24',
      '#F472B6',
    ]

    const spawn = () => {
      if (cancelled) return
      resize()

      const rect = card.getBoundingClientRect()
      const originX = rect.left + rect.width / 2
      const originY = rect.top + rect.height / 2
      const isMobile =
        typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 1023px)').matches

      // Desktop: wide celebratory burst. Mobile: tighter upward cone that lingers longer.
      const duration = isMobile ? 250 : 110
      const fadeStart = isMobile ? 140 : 45
      const particleCount = isMobile ? 80 : 180

      const particles = Array.from({ length: particleCount }, () => {
        let angle: number
        let speed: number
        if (isMobile) {
          // Upward cone (~±55°) so pieces stay on the small screen longer
          angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.7)
          speed = 4 + Math.random() * 7
        } else {
          angle = Math.random() * Math.PI * 2
          speed = 12 + Math.random() * 18
        }
        const w = Math.random() * 8 + 4
        const h = Math.random() * 5 + 2.5
        return {
          x: originX + (Math.random() - 0.5) * (isMobile ? 40 : 72),
          y: originY + (Math.random() - 0.5) * (isMobile ? 28 : 48),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isMobile ? 0.8 : 1.5),
          color: colors[Math.floor(Math.random() * colors.length)],
          w: isMobile ? w * 0.85 : w,
          h: isMobile ? h * 0.85 : h,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * (isMobile ? 0.18 : 0.28),
          gravity: isMobile ? 0.055 + Math.random() * 0.04 : 0.12 + Math.random() * 0.08,
          drag: isMobile ? 0.988 + Math.random() * 0.008 : 0.985 + Math.random() * 0.01,
          alpha: 1,
        }
      })

      let frame = 0
      const animate = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        particles.forEach((p) => {
          p.vx *= p.drag
          p.vy = p.vy * p.drag + p.gravity
          p.x += p.vx
          p.y += p.vy
          p.rotation += p.rotSpeed
          p.alpha =
            frame < fadeStart
              ? 1
              : Math.max(0, 1 - (frame - fadeStart) / (duration - fadeStart))
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()
        })
        frame++
        if (frame < duration) animId = requestAnimationFrame(animate)
      }
      animId = requestAnimationFrame(animate)
    }

    startId = requestAnimationFrame(() => {
      startId = requestAnimationFrame(spawn)
    })

    window.addEventListener('resize', resize)
    return () => {
      cancelled = true
      cancelAnimationFrame(startId)
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[5]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingChromeHeader
          moduleIndex={displayModule}
          moduleTotal={5}
          moduleLabel={headerLabel}
          belowProgress={
            <ModuleTracker
              currentModuleIndex={isLast ? moduleIndex : Math.min(moduleIndex + 1, 4)}
              answeredInCurrent={isLast ? totalCount : 0}
              totalInCurrent={totalCount}
            />
          }
        />

        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-8">
          <div
            ref={cardRef}
            className="relative z-20 w-full max-w-[560px] rounded-2xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80 sm:p-10"
          >
            <div className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500">
              <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden />
            </div>

            <h2 className="text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[1.75rem]">
              Module {displayModule} of 5 done
            </h2>

            {!isLast && next ? (
              <div className="mt-5 rounded-xl bg-[#F8FAFC] px-4 py-3.5 text-left ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Up next
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A] dark:text-slate-50">
                  {next}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {intro}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {intro}
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push(nextUrl)}
              className={cn(
                'mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
              )}
            >
              {isLast ? 'Review your answers' : 'Continue'}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
