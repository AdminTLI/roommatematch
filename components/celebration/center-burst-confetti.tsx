'use client'

import { useEffect, useRef, type RefObject } from 'react'

const COLORS = [
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

type CenterBurstConfettiProps = {
  /** Element whose center is the burst origin. Falls back to viewport center. */
  originRef?: RefObject<HTMLElement | null>
  /** Re-run the burst when this changes (e.g. dialog open). */
  active?: boolean
  className?: string
}

/**
 * Full-viewport confetti burst from the center of `originRef` (or the screen).
 * Same feel as the questionnaire module completion celebration.
 */
export function CenterBurstConfetti({
  originRef,
  active = true,
  className = 'pointer-events-none absolute inset-0 z-[5]',
}: CenterBurstConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
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

    const spawn = () => {
      if (cancelled) return
      resize()

      const originEl = originRef?.current
      const rect = originEl?.getBoundingClientRect()
      const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
      const isMobile =
        typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 1023px)').matches

      const duration = isMobile ? 250 : 110
      const fadeStart = isMobile ? 140 : 45
      const particleCount = isMobile ? 80 : 180

      const particles = Array.from({ length: particleCount }, () => {
        let angle: number
        let speed: number
        if (isMobile) {
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
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
  }, [active, originRef])

  if (!active) return null

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
