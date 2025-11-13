'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  label: string
  helperText?: string
  checked?: boolean
  onChange: (v: boolean) => void
}

export function ToggleYesNo({ id, label, helperText, checked, onChange }: Props) {
  return (
    <div>
      {helperText && <p className="text-base sm:text-sm text-gray-600 mb-3 sm:mb-2">{helperText}</p>}
      <div className="flex gap-3 sm:gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 h-12 sm:h-11 rounded-xl border text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 sm:px-3',
            checked === true
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 h-12 sm:h-11 rounded-xl border text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 sm:px-3',
            checked === false
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          No
        </button>
      </div>
    </div>
  )
}


