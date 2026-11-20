'use client'

// Housing list empty state (filter miss / no live listings)

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  onBroadenLocation: () => void
  onLowerCompatibility: () => void
  onCreateAlert: () => void
  onClearFilters: () => void
  hasFilters: boolean
}

export function EmptyState({
  onBroadenLocation,
  onLowerCompatibility,
  onCreateAlert,
  onClearFilters,
  hasFilters,
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="flex min-h-[min(28rem,70vh)] flex-col justify-center px-2 py-10 sm:px-4"
    >
      <div className="mx-auto w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
          {hasFilters ? 'No matches' : 'Housing discovery'}
        </p>

        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
          {hasFilters ? 'Nothing fits these filters' : 'No places live yet'}
        </h3>

        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500 sm:text-[15px]">
          {hasFilters
            ? 'Widen the search a little, or clear filters and start from your ranked feed again.'
            : 'Hosts are still publishing. Save a search and we’ll nudge you when something new lands.'}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {hasFilters ? (
            <Button
              onClick={onClearFilters}
              className="h-11 rounded-full bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Clear filters
            </Button>
          ) : (
            <Button
              data-testid="create-alert-button"
              onClick={onCreateAlert}
              className="h-11 rounded-full bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Bell className="h-4 w-4" />
              Create alert
            </Button>
          )}

          <div className="flex flex-wrap gap-2">
            <SecondaryAction
              data-testid="broaden-location-button"
              onClick={onBroadenLocation}
              icon={MapPin}
              label="Broaden location"
            />
            <SecondaryAction
              data-testid="lower-compatibility-button"
              onClick={onLowerCompatibility}
              icon={SlidersHorizontal}
              label="Lower compatibility"
            />
            {hasFilters && (
              <SecondaryAction
                data-testid="create-alert-button"
                onClick={onCreateAlert}
                icon={Bell}
                label="Create alert"
              />
            )}
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-400">
          Need a hand?{' '}
          <Link
            href="/help-center"
            className="font-medium text-indigo-600 underline-offset-4 transition hover:text-indigo-500 hover:underline dark:text-indigo-400"
          >
            Visit the help center
          </Link>
        </p>
      </div>
    </div>
  )
}

function SecondaryAction({
  onClick,
  icon: Icon,
  label,
  'data-testid': testId,
}: {
  onClick: () => void
  icon: typeof MapPin
  label: string
  'data-testid'?: string
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-ink-700 transition',
        'hover:border-zinc-300 hover:bg-zinc-50',
        'dark:border-zinc-700 dark:bg-zinc-900 dark:text-ink-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
      )}
    >
      <Icon className="h-4 w-4 text-ink-400" />
      {label}
    </button>
  )
}

/** Empty state when the marketplace has no listings at all */
export function NoListingsEmptyState({
  onCreateAlert,
}: {
  onCreateAlert?: () => void
}) {
  return (
    <div className="flex min-h-[min(24rem,60vh)] flex-col justify-center px-2 py-10 sm:px-4">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
          Housing discovery
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
          No places live yet
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500 sm:text-[15px]">
          Check back soon, or create an alert so you’re first to know when hosts publish nearby.
        </p>
        <div className="mt-7">
          <Button
            onClick={onCreateAlert}
            className="h-11 rounded-full bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Sparkles className="h-4 w-4" />
            Create alert for new listings
          </Button>
        </div>
      </div>
    </div>
  )
}
