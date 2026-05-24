'use client'

import { motion } from 'framer-motion'

interface PillToggleProps {
  value: boolean
  onChange: (next: boolean) => void
  ariaLabel?: string
}

/**
 * Sliding pill toggle — two segments ("Off" / "On") with an animated
 * indicator that slides between them. Styled to match the platform's
 * settings page (rounded, soft borders, violet accent).
 */
export function PillToggle({ value, onChange, ariaLabel }: PillToggleProps) {
  const handleToggle = () => onChange(!value)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={handleToggle}
      className="relative inline-flex h-9 w-[124px] shrink-0 cursor-pointer items-center rounded-full bg-slate-100 p-1 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute top-1 bottom-1 w-[58px] rounded-full shadow-sm ${
          value
            ? 'left-[62px] bg-gradient-to-br from-violet-500 to-violet-600'
            : 'left-1 bg-white ring-1 ring-slate-200'
        }`}
        aria-hidden
      />
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center text-[11px] font-semibold uppercase tracking-wider transition-colors ${
          value ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        Off
      </span>
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center text-[11px] font-semibold uppercase tracking-wider transition-colors ${
          value ? 'text-white' : 'text-slate-400'
        }`}
      >
        On
      </span>
    </button>
  )
}
