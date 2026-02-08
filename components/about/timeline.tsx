'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineItem {
  title: string
  description: string
  date?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

const TRACK_WIDTH = 48 // px; line and dots live in this column

export function Timeline({ items }: TimelineProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative">
      {/* Single vertical line, centered in the track column */}
      <div
        className="absolute top-0 bottom-0 hidden md:flex justify-center"
        style={{ width: TRACK_WIDTH }}
        aria-hidden
      >
        <div className="w-px self-stretch bg-gradient-to-b from-white/10 via-white/25 to-white/10" />
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="relative flex gap-5 md:gap-6"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-24px' }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            {/* Dot: same-width column so line and dot stay aligned */}
            <div
              className={cn(
                'flex-shrink-0 flex items-start justify-center pt-5',
                'relative z-10'
              )}
              style={{ width: TRACK_WIDTH }}
            >
              {index === items.length - 1 ? (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/90 text-white shadow-[0_0_0_3px_rgba(99,102,241,0.25)]"
                  aria-hidden
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span
                  className={cn(
                    'rounded-full bg-white/25 ring-2 ring-white/20',
                    'h-2.5 w-2.5'
                  )}
                  aria-hidden
                />
              )}
            </div>

            {/* Content card with subtle left accent */}
            <div className="flex-1 min-w-0 pb-10 md:pb-12">
              <div
                className={cn(
                  'glass noise-overlay p-5 sm:p-6',
                  'border-l-2 border-indigo-400/40 -ml-px',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15 hover:border-l-indigo-400/60'
                )}
              >
                {item.date && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400/90 mb-1.5">
                    {item.date}
                  </p>
                )}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
