'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export const HOUSING_BUDGET_MIN = 300
export const HOUSING_BUDGET_MAX = 1500
export const HOUSING_BUDGET_STEP = 50
export const HOUSING_BUDGET_DEFAULT: [number, number] = [400, 800]

interface HousingBudgetSliderProps {
  budgetMin: number | null
  budgetMax: number | null
  budgetUnknown: boolean
  onChange: (next: {
    budgetMin: number | null
    budgetMax: number | null
    budgetUnknown: boolean
  }) => void
  error?: string
}

function formatEuro(value: number) {
  return `€${value.toLocaleString('en-NL')}`
}

export function HousingBudgetSlider({
  budgetMin,
  budgetMax,
  budgetUnknown,
  onChange,
  error,
}: HousingBudgetSliderProps) {
  const range: [number, number] = [
    budgetMin ?? HOUSING_BUDGET_DEFAULT[0],
    budgetMax ?? HOUSING_BUDGET_DEFAULT[1],
  ]

  const handleRangeChange = (values: number[]) => {
    const min = Math.min(values[0] ?? HOUSING_BUDGET_DEFAULT[0], values[1] ?? HOUSING_BUDGET_DEFAULT[1])
    const max = Math.max(values[0] ?? HOUSING_BUDGET_DEFAULT[0], values[1] ?? HOUSING_BUDGET_DEFAULT[1])
    onChange({
      budgetMin: min,
      budgetMax: max,
      budgetUnknown: false,
    })
  }

  const handleUnknownChange = (checked: boolean) => {
    if (checked) {
      onChange({
        budgetMin: null,
        budgetMax: null,
        budgetUnknown: true,
      })
      return
    }

    onChange({
      budgetMin: range[0],
      budgetMax: range[1],
      budgetUnknown: false,
    })
  }

  return (
    <div className="space-y-4 pt-5 border-t border-zinc-200 dark:border-white/5">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Monthly room budget
          </Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            What you&apos;re willing to spend on a room (min–max, euros).
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 text-sm font-semibold tabular-nums',
            budgetUnknown || (budgetMin == null && budgetMax == null)
              ? 'text-zinc-400 dark:text-zinc-500'
              : 'text-blue-600 dark:text-blue-400'
          )}
        >
          {budgetUnknown
            ? 'Not sure yet'
            : budgetMin == null && budgetMax == null
              ? 'Not set'
              : `${formatEuro(range[0])}–${formatEuro(range[1])}`}
        </span>
      </div>

      <div className={cn('space-y-3 px-1', budgetUnknown && 'opacity-40 pointer-events-none')}>
        <Slider
          value={range}
          onValueChange={handleRangeChange}
          min={HOUSING_BUDGET_MIN}
          max={HOUSING_BUDGET_MAX}
          step={HOUSING_BUDGET_STEP}
          disabled={budgetUnknown}
          aria-label="Monthly room budget range in euros"
          className="w-full"
        />
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          <span>{formatEuro(HOUSING_BUDGET_MIN)}</span>
          <span>{formatEuro(HOUSING_BUDGET_MAX)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <Checkbox
          id="budget-unknown"
          checked={budgetUnknown}
          onCheckedChange={(checked) => handleUnknownChange(checked === true)}
        />
        <Label
          htmlFor="budget-unknown"
          className="text-sm font-normal text-zinc-700 dark:text-zinc-300 cursor-pointer"
        >
          I don&apos;t know my budget yet
        </Label>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium px-1">{error}</p>
      )}
    </div>
  )
}
