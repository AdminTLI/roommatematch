'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Users, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvidenceTileProps {
  statistic: string
  title: string
  explanation: string
  source: string
  solution: string
  icon: 'Users' | 'TrendingUp' | 'Shield'
}

const iconMap = {
  Users,
  TrendingUp,
  Shield,
}

export function EvidenceTile({
  statistic,
  title,
  explanation,
  source,
  solution,
  icon,
}: EvidenceTileProps) {
  const Icon = iconMap[icon]
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(
        'h-full flex flex-col p-6 md:p-8 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
        'transition-all duration-300 hover:bg-white/60'
      )}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
          {statistic}
        </div>
        <div className="h-10 w-10 rounded-2xl bg-white/70 border border-white/80 flex items-center justify-center flex-shrink-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4 flex-1 flex flex-col">
        <div>
          <p className="text-slate-700 text-sm leading-relaxed mb-3">{explanation}</p>
          <p className="text-xs text-slate-600 italic border-l-2 border-blue-700/25 pl-3">
            {source}
          </p>
        </div>

        <div className="pt-4 border-t border-white/70 mt-auto">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-1">How we solve it:</p>
              <p className="text-sm text-slate-700 leading-relaxed">{solution}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
