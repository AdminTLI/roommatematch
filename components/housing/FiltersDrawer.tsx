'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { FiltersState } from '@/types/housing'
import { OptionChip } from './FilterPill'
import { LocationFilterFields } from './LocationFilterFields'

interface FiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FiltersState
  onFiltersChange: (
    filters: FiltersState | ((prev: FiltersState) => FiltersState)
  ) => void
}

const ROOM_TYPES = [
  { value: 'room' as const, label: 'Private room' },
  { value: 'studio' as const, label: 'Studio' },
  { value: 'apartment' as const, label: 'Apartment' },
  { value: 'shared' as const, label: 'Shared house' },
]

const LEASE_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '12+ months' },
] as const

const ACCESS_OPTIONS = [
  { value: 'elevator' as const, label: 'Elevator' },
  { value: 'stepFree' as const, label: 'Step-free' },
  { value: 'groundFloor' as const, label: 'Ground floor' },
]

const QUIET_OPTIONS = [
  { value: 'strict' as const, label: 'Strict' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'flexible' as const, label: 'Flexible' },
]

const CLEANLINESS_OPTIONS = [
  { value: 1 as const, label: 'Relaxed' },
  { value: 3 as const, label: 'Moderate' },
  { value: 5 as const, label: 'Strict' },
]

const fieldClass =
  'h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white'

const currencyShellClass =
  'flex h-10 w-full items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5'

const currencyInputClass =
  'h-full min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 border-b border-zinc-100 py-6 last:border-b-0 dark:border-zinc-800">
      <div>
        <h3 className="text-sm font-medium text-ink-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FiltersDrawerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [local, setLocal] = useState<FiltersState>(filters)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) setLocal(filters)
  }, [open, filters])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  const update = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArray = <K extends 'roomTypes' | 'leaseMonths' | 'accessibility'>(
    key: K,
    value: NonNullable<FiltersState[K]>[number]
  ) => {
    setLocal((prev) => {
      const current = (prev[key] as unknown[] | undefined) || []
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return {
        ...prev,
        [key]: next.length ? next : undefined,
      }
    })
  }

  const handleApply = () => {
    onFiltersChange(local)
    onOpenChange(false)
  }

  const handleClear = () => {
    setLocal({
      sort: filters.sort || 'best',
      view: filters.view || 'split',
      page: 1,
    })
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[1400]" role="presentation">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state="open"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="relative shrink-0 space-y-1 border-b border-zinc-100 px-5 py-5 pr-12 dark:border-zinc-800 sm:px-6 sm:pr-14">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
          >
            Filters
          </h2>
          <p id={descriptionId} className="text-sm text-ink-500">
            Narrow results to places that fit how you live
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-zinc-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          <Section title="Budget" description="Monthly rent in euros">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm text-ink-500">Min</span>
                <div className={currencyShellClass}>
                  <span className="shrink-0 text-sm text-ink-400">€</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={local.priceMin ?? ''}
                    onChange={(e) =>
                      update(
                        'priceMin',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    className={currencyInputClass}
                  />
                </div>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm text-ink-500">Max</span>
                <div className={currencyShellClass}>
                  <span className="shrink-0 text-sm text-ink-400">€</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Any"
                    value={local.priceMax ?? ''}
                    onChange={(e) =>
                      update(
                        'priceMax',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    className={currencyInputClass}
                  />
                </div>
              </label>
            </div>
          </Section>

          <Section
            title="Location"
            description="Pick a city, or search a Dutch address"
          >
            <LocationFilterFields
              city={local.city}
              address={local.address}
              radiusKm={local.radiusKm ?? 5}
              onCityChange={(next) => update('city', next)}
              onAddressChange={(next) => {
                setLocal((prev) => ({
                  ...prev,
                  address: next,
                  ...(next ? {} : { lat: undefined, lng: undefined }),
                }))
              }}
              onAddressResolved={(resolved) => {
                setLocal((prev) => ({
                  ...prev,
                  address: resolved.addressLine || prev.address,
                  city: resolved.city || prev.city,
                  lat: resolved.latitude ?? undefined,
                  lng: resolved.longitude ?? undefined,
                }))
              }}
              onRadiusChange={(value) => update('radiusKm', value)}
            />
          </Section>

          <Section title="Home type">
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((type) => (
                <OptionChip
                  key={type.value}
                  selected={Boolean(local.roomTypes?.includes(type.value))}
                  onClick={() => toggleArray('roomTypes', type.value)}
                >
                  {type.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Lease length">
            <div className="flex flex-wrap gap-2">
              {LEASE_OPTIONS.map((option) => (
                <OptionChip
                  key={option.value}
                  selected={Boolean(local.leaseMonths?.includes(option.value))}
                  onClick={() => toggleArray('leaseMonths', option.value)}
                >
                  {option.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Move-in dates">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-sm text-ink-500">From</span>
                <input
                  type="date"
                  value={local.moveInFrom ?? ''}
                  onChange={(e) =>
                    update('moveInFrom', e.target.value || undefined)
                  }
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm text-ink-500">To</span>
                <input
                  type="date"
                  value={local.moveInTo ?? ''}
                  onChange={(e) =>
                    update('moveInTo', e.target.value || undefined)
                  }
                  className={fieldClass}
                />
              </label>
            </div>
          </Section>

          <Section title="Must-haves">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['furnished', 'Furnished'],
                  ['utilitiesIncluded', 'Utilities included'],
                  ['petsAllowed', 'Pets allowed'],
                  ['universityVerifiedOnly', 'Verified only'],
                ] as const
              ).map(([key, label]) => (
                <OptionChip
                  key={key}
                  selected={Boolean(local[key])}
                  onClick={() => update(key, local[key] ? undefined : true)}
                >
                  {label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Accessibility">
            <div className="flex flex-wrap gap-2">
              {ACCESS_OPTIONS.map((option) => (
                <OptionChip
                  key={option.value}
                  selected={Boolean(
                    local.accessibility?.includes(option.value)
                  )}
                  onClick={() => toggleArray('accessibility', option.value)}
                >
                  {option.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section
            title="Compatibility"
            description="Minimum lifestyle match with your profile"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">Minimum match</span>
                <span className="font-medium tabular-nums text-ink-900 dark:text-white">
                  {local.minCompatibility ?? 70}%
                </span>
              </div>
              <Slider
                value={[local.minCompatibility ?? 70]}
                onValueChange={([value]) => update('minCompatibility', value)}
                min={0}
                max={100}
                step={5}
              />
              {(local.minCompatibility ?? 70) < 50 ? (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Your chances of being accepted reduce when the match is that
                    low.
                  </p>
                </div>
              ) : null}
            </div>
          </Section>

          <Section title="Lifestyle preferences">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-ink-500">Quiet hours</p>
                <div className="flex flex-wrap gap-2">
                  {QUIET_OPTIONS.map((option) => (
                    <OptionChip
                      key={option.value}
                      selected={local.quietHours === option.value}
                      onClick={() =>
                        update(
                          'quietHours',
                          local.quietHours === option.value
                            ? undefined
                            : option.value
                        )
                      }
                    >
                      {option.label}
                    </OptionChip>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-ink-500">Cleanliness</p>
                <div className="flex flex-wrap gap-2">
                  {CLEANLINESS_OPTIONS.map((option) => (
                    <OptionChip
                      key={option.value}
                      selected={local.cleanlinessLevel === option.value}
                      onClick={() =>
                        update(
                          'cleanlinessLevel',
                          local.cleanlinessLevel === option.value
                            ? undefined
                            : option.value
                        )
                      }
                    >
                      {option.label}
                    </OptionChip>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="shrink-0 border-t border-zinc-100 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium text-ink-500 underline-offset-2 transition hover:text-ink-900 hover:underline dark:hover:text-white"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="ml-auto inline-flex h-11 flex-1 items-center justify-center rounded-full bg-indigo-500 px-5 text-sm font-medium text-white transition hover:bg-indigo-600 sm:flex-none sm:px-8"
            >
              Show places
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
