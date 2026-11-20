'use client'

import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Check,
  Clock,
  Flag,
  Heart,
  Home,
  MapPin,
  Share2,
  Shield,
  ShieldAlert,
  Square,
  Users,
  X,
} from 'lucide-react'
import { Listing } from '@/types/housing'
import { UniversityVerifiedBadge } from '@/components/trust/UniversityVerifiedBadge'
import { VerifiedBadge } from '@/components/verification/verified-badge'
import { ReportListingDialog } from './ReportListingDialog'
import { ApplyListingActions } from './ApplyListingActions'
import { NearbyPoisPanel } from './NearbyPoisPanel'
import { ListingPhotoGallery } from './ListingPhotoGallery'
import { cn, getCompatibilityLabel } from '@/lib/utils'
import { formatResponseTimeLabel } from '@/lib/host/response-time'
import { formatNlDate, formatNlNumber } from '@/lib/housing/format'
import { formatListingLocationLine } from '@/lib/housing/listing-location'

interface ListingDetailProps {
  listing: Listing
  onSave: (id: string) => void
  onShare: (id: string) => void
  onReport: (id: string) => void
  isSaved?: boolean
  showBackButton?: boolean
  plannedUniversityId?: string | null
  plannedUniversityName?: string | null
}

function formatDate(iso?: string | null) {
  return formatNlDate(iso)
}

/** European thousands separator: 2500 → "2.500" */
function formatEuroAmount(value: number) {
  return formatNlNumber(value)
}

function formatStayMonths(months?: number | null) {
  if (months == null || !Number.isFinite(months) || months <= 0) return null
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 year' : `${years} years`
  }
  return months === 1 ? '1 month' : `${months} months`
}

function formatAmenity(amenity: string) {
  return amenity.replace(/_/g, ' ')
}

function FitDonut({
  label,
  value,
  insight,
}: {
  label: string
  value?: number
  insight?: string
}) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const dash = value != null ? (pct / 100) * circumference : 0

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-16 w-16 shrink-0">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56" aria-hidden>
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-zinc-100 dark:text-zinc-800"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="text-indigo-500 transition-[stroke-dasharray] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold tabular-nums text-ink-900 dark:text-white">
            {value != null ? `${pct}%` : '-'}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-ink-800 dark:text-ink-200">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          {insight ||
            (value != null
              ? `Your ${label.toLowerCase()} alignment with this listing is ${pct}%.`
              : 'Not enough preference data yet for a clear read.')}
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  description,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3 border-t border-zinc-200/80 pt-8 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
        <p className="truncate text-sm font-medium text-ink-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

export function ListingDetail({
  listing,
  onSave,
  onShare,
  onReport,
  isSaved = false,
  showBackButton = false,
  plannedUniversityId = null,
  plannedUniversityName = null,
}: ListingDetailProps) {
  const [showReportDialog, setShowReportDialog] = useState(false)

  const photos = Array.isArray(listing.photos)
    ? listing.photos.filter((p) => typeof p === 'string' && p.length > 0)
    : listing.coverImageUrl
      ? [listing.coverImageUrl]
      : []
  const amenities = Array.isArray(listing.amenities) ? listing.amenities : []
  const hostVerified = Boolean(listing.hostVerified)
  const actionsEnabled = listing.actionsEnabled !== false && hostVerified

  const rent =
    typeof listing.priceMonthly === 'number' && Number.isFinite(listing.priceMonthly)
      ? listing.priceMonthly
      : null
  const utilities =
    typeof listing.utilitiesCost === 'number' && Number.isFinite(listing.utilitiesCost)
      ? listing.utilitiesCost
      : 0
  const deposit =
    typeof listing.depositAmount === 'number' && Number.isFinite(listing.depositAmount)
      ? listing.depositAmount
      : 0
  const agencyFee =
    typeof listing.agencyFee === 'number' && Number.isFinite(listing.agencyFee)
      ? listing.agencyFee
      : 0
  const monthlyTotal =
    rent == null ? null : rent + (listing.utilitiesIncluded ? 0 : utilities)

  const moveInLabel = formatDate(listing.moveInISO) || 'Flexible'
  const roomLabel = listing.roomType?.replace(/_/g, ' ') || 'Room'
  const seeking = listing.seekingPeople ?? listing.availableRooms ?? null

  const keyFacts = useMemo(
    () =>
      [
        {
          icon: Bed,
          label: 'Type',
          value: roomLabel.charAt(0).toUpperCase() + roomLabel.slice(1),
        },
        listing.squareMeters
          ? { icon: Square, label: 'Size', value: `${listing.squareMeters} m²` }
          : null,
        {
          icon: Bath,
          label: 'Baths',
          value: String(listing.baths ?? listing.totalBathrooms ?? '-'),
        },
        {
          icon: Users,
          label: seeking != null && seeking > 0 ? 'Looking for' : 'Roommates',
          value:
            seeking != null && seeking > 0
              ? `${seeking}`
              : `${listing.roommatesCount ?? 0}`,
        },
        {
          icon: Calendar,
          label: 'Move-in',
          value: moveInLabel,
        },
        {
          icon: Home,
          label: 'Min. stay',
          value:
            formatStayMonths(listing.minStayMonths || listing.leaseMonths) ||
            '-',
        },
        listing.maxStayMonths
          ? {
              icon: Calendar,
              label: 'Max. stay',
              value: formatStayMonths(listing.maxStayMonths) || '-',
            }
          : null,
      ].filter(Boolean) as Array<{
        icon: ComponentType<{ className?: string }>
        label: string
        value: string
      }>,
    [
      listing.baths,
      listing.leaseMonths,
      listing.maxStayMonths,
      listing.minStayMonths,
      listing.roommatesCount,
      listing.squareMeters,
      listing.totalBathrooms,
      moveInLabel,
      roomLabel,
      seeking,
    ]
  )

  const minStayLabel =
    formatStayMonths(listing.minStayMonths || listing.leaseMonths) || '-'
  const maxStayLabel = formatStayMonths(listing.maxStayMonths)

  const houseRules = [
    {
      ok: Boolean(listing.petsAllowed),
      label: listing.petsAllowed ? 'Pets allowed' : 'No pets',
    },
    {
      ok:
        listing.smokingPolicy === 'allowed' ||
        listing.smokingPolicy === 'outdoor',
      label:
        listing.smokingPolicy === 'allowed'
          ? 'Smoking allowed'
          : listing.smokingPolicy === 'outdoor'
            ? 'Outdoor smoking only'
            : 'No smoking',
    },
    {
      ok: Boolean(listing.furnished),
      label: listing.furnished ? 'Furnished' : 'Unfurnished',
    },
    {
      ok: Boolean(listing.utilitiesIncluded),
      label: listing.utilitiesIncluded
        ? 'Utilities included'
        : 'Utilities separate',
    },
  ]

  const hostMeta = listing.agencyOrHost
  // Host onboarding sometimes pasted the listing blurb into bio — never repeat About here.
  const hostBio = (() => {
    const bio = hostMeta?.bio?.trim() || ''
    if (!bio) return null
    const listingAbout = (listing.description || '').trim()
    if (listingAbout && bio.toLowerCase() === listingAbout.toLowerCase()) return null
    return bio
  })()
  const hostJoinedLabel = (() => {
    if (!hostMeta?.joinedAt) return null
    const joined = new Date(hostMeta.joinedAt)
    if (Number.isNaN(joined.getTime())) return null
    const months = Math.max(
      0,
      (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )
    if (months < 1) return 'Joined this month'
    if (months < 12) {
      const m = Math.round(months)
      return m === 1 ? 'Hosting for 1 month' : `Hosting for ${m} months`
    }
    const years = Math.floor(months / 12)
    return years === 1 ? 'Hosting for 1 year' : `Hosting for ${years} years`
  })()
  const hostTypeLabel =
    hostMeta?.hostType === 'agency'
      ? 'Agency'
      : hostMeta?.hostType === 'private_landlord'
        ? 'Private landlord'
        : null
  const otherListings = hostMeta?.otherListingsCount ?? 0

  const panelFacts = [
    { label: 'Move-in', value: moveInLabel },
    { label: 'Min. stay', value: minStayLabel },
    ...(maxStayLabel ? [{ label: 'Max. stay', value: maxStayLabel }] : []),
    {
      label: 'Living area',
      value: listing.squareMeters
        ? `${listing.squareMeters} m²`
        : roomLabel.charAt(0).toUpperCase() + roomLabel.slice(1),
    },
    {
      label: 'Deposit',
      value: deposit > 0 ? `€${formatEuroAmount(deposit)}` : 'Not listed',
    },
    {
      label: 'Type',
      value: roomLabel.charAt(0).toUpperCase() + roomLabel.slice(1),
    },
    {
      label: 'Baths',
      value: String(listing.baths ?? listing.totalBathrooms ?? '-'),
    },
    seeking != null && seeking > 0
      ? {
          label: 'Looking for',
          value: `${seeking} ${seeking === 1 ? 'person' : 'people'}`,
        }
      : {
          label: 'Roommates',
          value: String(listing.roommatesCount ?? 0),
        },
    {
      label: 'Interior',
      value: listing.furnished ? 'Furnished' : 'Unfurnished',
    },
  ]

  const ActionPanel = (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="min-w-0 shrink-0 space-y-5">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white lg:text-2xl">
              {rent != null ? `€${formatEuroAmount(rent)}` : 'Price TBD'}
            </p>
            <span className="text-sm text-ink-500">/ month</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500 sm:text-sm">
            {listing.utilitiesIncluded
              ? 'Utilities included'
              : utilities > 0 && monthlyTotal != null
                ? `≈ €${formatEuroAmount(monthlyTotal)}/mo (incl. service costs)`
                : 'Service costs not specified'}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-zinc-200/80 py-4 text-sm dark:border-zinc-800">
          {panelFacts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-ink-400">{fact.label}</dt>
              <dd className="mt-1 font-medium text-ink-900 dark:text-white">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          {hostVerified ? (
            <>
              <Shield className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              Verified Host
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              Unverified host
            </>
          )}
        </p>
      </div>

      <div className="mt-auto flex min-w-0 shrink-0 flex-col gap-2 pt-5">
        <ApplyListingActions
          listingId={listing.id}
          actionsEnabled={actionsEnabled}
          seekingPeople={listing.seekingPeople ?? listing.availableRooms ?? null}
        />

        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onSave(listing.id)}
            className={cn(
              'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition',
              isSaved
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                : 'bg-zinc-100 text-ink-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-ink-200 dark:hover:bg-zinc-700'
            )}
          >
            <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onShare(listing.id)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-ink-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-ink-300 dark:hover:bg-zinc-700"
            aria-label="Share listing"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/*
        Shell leaves this route unpadded. Match Topbar exactly:
        max-w-7xl + px-3/4/6 so the right edge lines up with the profile icon.
      */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {showBackButton && (
          <Link
            href="/housing"
            className="mb-5 inline-flex items-center gap-2 text-sm text-ink-500 transition-colors hover:text-ink-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to housing
          </Link>
        )}

        {/* 3:1 photo | apply — ratio + stretch defined in globals.css ([data-listing-hero]) */}
        <div data-listing-hero="photo-apply-3-1">
          <div data-listing-hero-photo>
            <ListingPhotoGallery
              photos={photos}
              title={listing.title}
              fill
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div
            data-listing-hero-apply
            className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
          >
            {ActionPanel}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {listing.compatibilityScore != null && (
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {listing.compatibilityScore}% fit
                </span>
              )}
              {listing.compatibilityScore != null && (
                <span className="text-ink-300">·</span>
              )}
              {hostVerified ? (
                <span className="inline-flex items-center gap-1 text-sm text-ink-600 dark:text-ink-300">
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  Verified host
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-rose-600">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Unverified host
                </span>
              )}
              <span className="text-ink-300">·</span>
              {listing.wwsStatus === 'certified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                  WWS certified
                </span>
              ) : listing.wwsStatus === 'not_certified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-sm font-medium text-ink-600 dark:bg-zinc-800 dark:text-ink-300">
                  <X className="h-3.5 w-3.5" />
                  Not WWS certified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  <Clock className="h-3.5 w-3.5" />
                  WWS under review
                </span>
              )}
              <UniversityVerifiedBadge
                verification={listing.verification}
                size="sm"
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              {listing.title}
            </h1>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {formatListingLocationLine({
                  address: listing.address,
                  city: listing.city,
                  postalCode: listing.postalCode,
                })}
              </span>
              {listing.distanceKmToCampus != null && (
                <span>
                  · {listing.distanceKmToCampus.toFixed(1)} km to campus
                </span>
              )}
            </p>
          </header>

          {/* Facts: open row, no cards */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            {keyFacts.map((fact) => (
              <Fact key={fact.label} {...fact} />
            ))}
          </div>

          {listing.compatibilityScore != null && (
            <Section title="Your fit">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                    Overall match
                  </p>
                  <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums text-ink-900 dark:text-white">
                    {listing.compatibilityScore}
                    <span className="text-2xl font-medium text-ink-400">%</span>
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {getCompatibilityLabel(listing.compatibilityScore / 100)} Match
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {listing.scoreInsights?.overall ||
                      'Hosts rank by lifestyle fit, not who applies first. Higher fit usually means a stronger application.'}
                  </p>
                  {listing.watchOuts && listing.watchOuts.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-amber-800 dark:text-amber-200">
                      {listing.watchOuts.slice(0, 4).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="min-w-0 space-y-6">
                  {listing.scoreBreakdown && (
                    <>
                      <FitDonut
                        label="Lifestyle"
                        value={listing.scoreBreakdown.lifestyle}
                        insight={listing.scoreInsights?.lifestyle}
                      />
                      <FitDonut
                        label="Budget"
                        value={listing.scoreBreakdown.budget}
                        insight={listing.scoreInsights?.budget}
                      />
                      <FitDonut
                        label="Timeline"
                        value={listing.scoreBreakdown.timeline}
                        insight={listing.scoreInsights?.timeline}
                      />
                    </>
                  )}
                </div>
              </div>
            </Section>
          )}

          <div className="grid w-full max-w-full grid-cols-1 gap-8 border-t border-zinc-200/80 pt-8 dark:border-zinc-800 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0 space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
                About
              </h2>
              {listing.description ? (
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-ink-700 dark:text-ink-300">
                  {listing.description}
                </p>
              ) : (
                <p className="text-sm text-ink-500">No description provided.</p>
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
                Cost
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-500">Rent</dt>
                  <dd className="font-medium text-ink-900 dark:text-white">
                    {rent != null ? `€${formatEuroAmount(rent)}` : 'TBD'}
                  </dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-ink-500">Utilities</dt>
                  <dd className="font-medium text-ink-900 dark:text-white">
                    {listing.utilitiesIncluded
                      ? 'Included'
                      : utilities > 0
                        ? `€${formatEuroAmount(utilities)}/mo`
                        : 'Not specified'}
                  </dd>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-500">Deposit</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">
                      €{formatEuroAmount(deposit)}
                    </dd>
                  </div>
                )}
                {agencyFee > 0 && (
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-500">Agency fee</dt>
                    <dd className="font-medium text-ink-900 dark:text-white">
                      €{formatEuroAmount(agencyFee)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-6 border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
                  <dt className="font-medium text-ink-800 dark:text-ink-200">
                    Estimated monthly
                  </dt>
                  <dd className="font-semibold text-ink-900 dark:text-white">
                    {monthlyTotal != null
                      ? `€${formatEuroAmount(monthlyTotal)}`
                      : 'TBD'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {amenities.length > 0 && (
            <Section title="Amenities">
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="inline-flex items-center gap-1.5 text-left text-sm capitalize text-ink-700 dark:text-ink-300"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <span>{formatAmenity(amenity)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="House rules">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {houseRules.map((rule) => (
                <li
                  key={rule.label}
                  className="inline-flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300"
                >
                  {rule.ok ? (
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-ink-500 dark:text-ink-400" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Around this place"
            description="Walk and bike times to groceries, transit, parks, study spots, food, and more."
          >
            <NearbyPoisPanel
              listingId={listing.id}
              listingCity={listing.city}
              listingCoords={listing.coords}
              plannedUniversityId={plannedUniversityId}
              plannedUniversityName={plannedUniversityName}
            />
          </Section>

          <Section title="Host">
            {/* Equal column rhythm: heading → stacked label/value blocks */}
            <div className="grid grid-cols-1 divide-y divide-zinc-200/80 dark:divide-zinc-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              <div className="min-w-0 space-y-4 pb-6 lg:pb-0 lg:pr-10">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Who they are
                </p>
                <div className="flex items-center gap-3">
                  {hostMeta?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hostMeta.avatarUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-ink-500 dark:bg-zinc-800">
                      <Home className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex min-w-0 items-center gap-1.5 font-medium text-ink-900 dark:text-white">
                      <span className="truncate">
                        {hostMeta?.name ||
                          listing.landlordName ||
                          listing.agencyName ||
                          'Host'}
                      </span>
                      <VerifiedBadge
                        verified={hostVerified}
                        size="md"
                        tooltip={
                          hostVerified
                            ? 'Verified host — email confirmed on Domu Match'
                            : undefined
                        }
                      />
                    </p>
                    <p className="mt-0.5 truncate text-sm text-ink-500">
                      {[hostTypeLabel, hostMeta?.idVerified ? 'ID checked' : null]
                        .filter(Boolean)
                        .join(' · ') || 'Host'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  {hostMeta?.companyName &&
                    hostMeta.companyName !== hostMeta.name && (
                      <div className="space-y-1">
                        <p className="text-ink-500">Company</p>
                        <p className="font-medium text-ink-900 dark:text-white">
                          {hostMeta.companyName}
                        </p>
                      </div>
                    )}
                  <div className="space-y-1">
                    <p className="text-ink-500">About</p>
                    <p className="leading-relaxed text-ink-700 dark:text-ink-300">
                      {hostBio || 'No host bio yet.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-4 py-6 lg:px-10 lg:py-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Track record
                </p>
                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-ink-500">Domu Match</p>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {hostJoinedLabel || 'New host'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-ink-500">Listings</p>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {otherListings > 0 ? otherListings + 1 : 1} active
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-ink-500">Reply time</p>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {formatResponseTimeLabel(hostMeta?.responseTimeHrs)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-4 pt-6 lg:pl-10 lg:pt-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  How contact works
                </p>
                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-ink-500">Privacy</p>
                    <p className="leading-relaxed text-ink-700 dark:text-ink-300">
                      Identity stays private until an offer.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-ink-500">Contact</p>
                    <p className="leading-relaxed text-ink-700 dark:text-ink-300">
                      {hostVerified
                        ? 'Apply and viewings go through Domu Match only.'
                        : 'Browse now. Apply unlocks after host verifies.'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-ink-500">Direct info</p>
                    <p className="leading-relaxed text-ink-700 dark:text-ink-300">
                      No phone or email shared early.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <div className="border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setShowReportDialog(true)
                onReport(listing.id)
              }}
              className="inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-rose-600"
            >
              <Flag className="h-3.5 w-3.5" />
              Report listing
            </button>
          </div>
        </div>
      </div>

      <ReportListingDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        listingId={listing.id}
        listingTitle={listing.title}
      />
    </>
  )
}
