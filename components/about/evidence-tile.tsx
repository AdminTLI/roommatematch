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
        'glass noise-overlay h-full flex flex-col p-6 md:p-8',
        'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
      )}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          {statistic}
        </div>
        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4 flex-1 flex flex-col">
        <div>
          <p className="text-white/70 text-sm leading-relaxed mb-3">{explanation}</p>
          <p className="text-xs text-white/50 italic border-l-2 border-indigo-400/30 pl-3">
            {source}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 mt-auto">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white mb-1">How we solve it:</p>
              <p className="text-sm text-white/70 leading-relaxed">{solution}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
