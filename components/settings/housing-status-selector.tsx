'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { HOUSING_STATUSES, type HousingStatusKey } from '@/lib/constants/housing-status'
import { cn } from '@/lib/utils'

interface HousingStatusSelectorProps {
  value: HousingStatusKey[]
  onChange: (statuses: HousingStatusKey[]) => void
  error?: string
}

export function HousingStatusSelector({
  value,
  onChange,
  error
}: HousingStatusSelectorProps) {
  const handleToggle = (statusKey: HousingStatusKey) => {
    if (value.includes(statusKey)) {
      // Deselect
      onChange(value.filter(key => key !== statusKey))
    } else {
      // Select (allow multiple)
      onChange([...value, statusKey])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Housing Status
        </label>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          value.length > 0 ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
        )}>
          {value.length} / {HOUSING_STATUSES.length} selected
        </span>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HOUSING_STATUSES.map((status) => {
          const isSelected = value.includes(status.key)
          
          return (
            <button
              key={status.key}
              type="button"
              onClick={() => handleToggle(status.key)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
                  : "border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-white/20",
                error && "border-red-500/50"
              )}
            >
              {/* Checkmark indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">{status.emoji}</span>
                  <h4 className={cn(
                    "text-sm font-semibold",
                    isSelected
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-zinc-900 dark:text-zinc-100"
                  )}>
                    {status.label}
                  </h4>
                </div>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isSelected
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {status.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium px-1">{error}</p>
      )}

      {/* Helper text */}
      {!error && (
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest px-1">
          Select all that apply
        </p>
      )}
    </div>
  )
}
