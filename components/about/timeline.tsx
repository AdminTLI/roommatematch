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
        <div className="w-px self-stretch bg-gradient-to-b from-slate-900/5 via-slate-900/15 to-slate-900/5" />
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
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_0_0_3px_rgba(15,23,42,0.10)]"
                  aria-hidden
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span
                  className={cn(
                    'rounded-full bg-slate-900/10 ring-2 ring-slate-900/10',
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
                  'p-5 sm:p-6 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                  'border-l-2 border-blue-700/30 -ml-px',
                  'transition-all duration-300 hover:bg-white/60 hover:border-blue-700/40'
                )}
              >
                {item.date && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1.5">
                    {item.date}
                  </p>
                )}
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
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
