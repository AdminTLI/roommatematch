'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Archive,
  ArchiveRestore,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { useDebounce } from '@/hooks/use-debounce'
import { HOST_TYPE_LABELS, type HostType } from '@/lib/host/types'
import { resolveListingHostDisplayName } from '@/lib/host/display-name'

type HostTrust = {
  display_name?: string
  host_type?: HostType
  email?: string | null
  email_verified?: boolean
  kvk_number?: string | null
  phone?: string | null
  account_age_days?: number | null
  prior_listings?: number
  prior_approvals?: number
  id_verified?: boolean
  host_verified?: boolean
}

type ListingRow = {
  id: string
  title: string
  description: string
  city: string
  postal_code: string
  address: string
  latitude?: number | string | null
  longitude?: number | string | null
  rent_monthly: number
  deposit_amount: number
  utilities_cost?: number
  agency_fee?: number
  seeking_people: number
  available_rooms: number
  total_rooms?: number
  total_bathrooms?: number
  square_meters?: number
  property_type: string
  room_type: string
  host_type?: HostType | null
  status: string
  moderation_status: string
  moderation_notes?: string | null
  photos?: string[]
  amenities?: string[]
  furnished?: boolean
  utilities_included?: boolean
  pet_friendly?: boolean
  smoking_allowed?: boolean
  lifestyle_prefs?: Record<string, unknown> | null
  dealbreakers?: Record<string, unknown> | null
  available_from?: string
  available_until?: string
  min_stay_months?: number
  max_stay_months?: number
  landlord_name?: string
  landlord_email?: string
  landlord_phone?: string
  agency_name?: string | null
  wws_status?: 'under_review' | 'certified' | 'not_certified' | null
  wws_documents?: string[] | null
  wws_reviewed_at?: string | null
  wws_review_notes?: string | null
  created_at: string
  host_profiles?: {
    display_name?: string
    host_type?: HostType
    company_name?: string | null
    kvk_number?: string | null
    phone?: string | null
    email_verified?: boolean
    auth_email?: string | null
  } | null
  host_trust?: HostTrust
}

type Stats = {
  pending: number
  approved: number
  rejected: number
  needs_review: number
  archived: number
  total: number
}

export function AdminHousingListingsContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('moderation_status') || 'pending'

  const [listings, setListings] = useState<ListingRow[]>([])
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    needs_review: 0,
    archived: 0,
    total: 0,
  })
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [hostTypeFilter, setHostTypeFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedCity = useDebounce(cityFilter, 300)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<ListingRow | null>(null)
  const [notes, setNotes] = useState('')
  const [acting, setActing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editHostName, setEditHostName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editPostal, setEditPostal] = useState('')
  const [editLatitude, setEditLatitude] = useState('')
  const [editLongitude, setEditLongitude] = useState('')
  const [editAmenities, setEditAmenities] = useState('')
  const [editMaxStay, setEditMaxStay] = useState('')
  const [editMinStay, setEditMinStay] = useState('')
  const [editPets, setEditPets] = useState(false)
  const [editSmoking, setEditSmoking] = useState(false)
  const [editFurnished, setEditFurnished] = useState(false)
  const [editUtilities, setEditUtilities] = useState(false)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      try {
        const params = new URLSearchParams({
          moderation_status: statusFilter,
        })
        if (debouncedSearch) params.set('q', debouncedSearch)
        if (debouncedCity) params.set('city', debouncedCity)
        if (hostTypeFilter !== 'all') params.set('host_type', hostTypeFilter)
        const res = await fetch(`/api/admin/housing/listings?${params.toString()}`, {
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load listings')
        setListings(json.listings || [])
        if (json.stats) setStats(json.stats)
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : 'Failed to load listings')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [statusFilter, debouncedSearch, debouncedCity, hostTypeFilter]
  )

  useEffect(() => {
    void load()
  }, [load])

  const hostVerified = (listing: ListingRow) =>
    Boolean(listing.host_trust?.host_verified ?? listing.host_trust?.email_verified)

  const moderate = async (
    id: string,
    moderation_status: 'approved' | 'rejected' | 'needs_review',
    listing?: ListingRow | null
  ) => {
    if (moderation_status === 'approved' && listing && !hostVerified(listing)) {
      showErrorToast('Cannot approve until the host verifies their email')
      return
    }
    setActing(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/housing/listings/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderation_status,
          notes: notes.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || json.error || 'Moderation failed')
      showSuccessToast(
        moderation_status === 'approved'
          ? 'Listing approved — visible to students when active'
          : moderation_status === 'rejected'
            ? 'Listing rejected'
            : 'Marked for review'
      )
      setSelected(null)
      setNotes('')
      await load(true)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Moderation failed')
    } finally {
      setActing(false)
    }
  }

  const setArchived = async (id: string, archived: boolean) => {
    setActing(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/housing/listings/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archived,
          notes: notes.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || json.error || 'Archive update failed')
      showSuccessToast(
        archived
          ? 'Listing archived — hidden from students'
          : 'Listing restored from archive'
      )
      setSelected(null)
      setNotes('')
      await load(true)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Archive update failed')
    } finally {
      setActing(false)
    }
  }

  const studentFacingHostName = (listing: ListingRow) =>
    resolveListingHostDisplayName({
      landlordName: listing.landlord_name,
      hostDisplayName:
        listing.host_trust?.display_name || listing.host_profiles?.display_name,
      agencyName: listing.agency_name,
      hostCompanyName: listing.host_profiles?.company_name,
    })

  const openListing = (listing: ListingRow) => {
    setSelected(listing)
    setEditTitle(listing.title || '')
    setEditHostName(studentFacingHostName(listing))
    setEditDescription(listing.description || '')
    setEditAddress(listing.address || '')
    setEditCity(listing.city || '')
    setEditPostal(listing.postal_code || '')
    setEditLatitude(
      listing.latitude != null && listing.latitude !== ''
        ? String(listing.latitude)
        : ''
    )
    setEditLongitude(
      listing.longitude != null && listing.longitude !== ''
        ? String(listing.longitude)
        : ''
    )
    setEditAmenities((listing.amenities || []).join(', '))
    setEditMinStay(
      listing.min_stay_months != null ? String(listing.min_stay_months) : ''
    )
    setEditMaxStay(
      listing.max_stay_months != null ? String(listing.max_stay_months) : ''
    )
    setEditPets(Boolean(listing.pet_friendly))
    setEditSmoking(Boolean(listing.smoking_allowed))
    setEditFurnished(Boolean(listing.furnished))
    setEditUtilities(Boolean(listing.utilities_included))
  }

  const saveListingEdits = async () => {
    if (!selected) return
    setActing(true)
    try {
      const amenities = editAmenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
      const lat = editLatitude.trim() ? Number(editLatitude) : undefined
      const lng = editLongitude.trim() ? Number(editLongitude) : undefined
      const body: Record<string, unknown> = {
        title: editTitle.trim(),
        landlord_name: editHostName.trim() || undefined,
        description: editDescription.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
        postal_code: editPostal.trim(),
        amenities,
        pet_friendly: editPets,
        smoking_allowed: editSmoking,
        furnished: editFurnished,
        utilities_included: editUtilities,
        min_stay_months: editMinStay ? Number(editMinStay) : undefined,
        max_stay_months: editMaxStay.trim() ? Number(editMaxStay) : null,
      }
      if (lat != null && Number.isFinite(lat) && lng != null && Number.isFinite(lng)) {
        body.latitude = lat
        body.longitude = lng
      }
      const res = await fetchWithCSRF(`/api/admin/housing/listings/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save listing edits')
      showSuccessToast('Listing details updated')
      if (json.listing) {
        setSelected({ ...selected, ...json.listing })
      }
      await load(true)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to save listing edits')
    } finally {
      setActing(false)
    }
  }

  const setWwsStatus = async (
    id: string,
    wws_status: 'under_review' | 'certified' | 'not_certified'
  ) => {
    setActing(true)
    try {
      const res = await fetchWithCSRF(`/api/admin/housing/listings/${id}/wws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wws_status,
          notes: notes.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'WWS update failed')
      showSuccessToast(
        wws_status === 'certified'
          ? 'Marked WWS certified'
          : wws_status === 'not_certified'
            ? 'Marked not WWS certified'
            : 'WWS set back to under review'
      )
      setSelected((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              wws_status: json.listing?.wws_status ?? wws_status,
              wws_reviewed_at: json.listing?.wws_reviewed_at ?? prev.wws_reviewed_at,
              wws_review_notes: json.listing?.wws_review_notes ?? prev.wws_review_notes,
            }
          : prev
      )
      await load(true)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'WWS update failed')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Pending', value: stats.pending, icon: Clock, tone: 'text-amber-600' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, tone: 'text-emerald-600' },
          { label: 'Needs review', value: stats.needs_review, icon: Eye, tone: 'text-indigo-600' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, tone: 'text-rose-600' },
          { label: 'Archived', value: stats.archived, icon: Archive, tone: 'text-slate-600' },
        ].map((card) => (
          <Card
            key={card.label}
            className="rounded-2xl border-white/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40"
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.tone}`} />
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search title, city, host…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Input
          className="w-[140px]"
          placeholder="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        />
        <Select value={hostTypeFilter} onValueChange={setHostTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Host type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hosts</SelectItem>
            <SelectItem value="private_landlord">Landlord</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="needs_review">Needs review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading listings…</p>
      ) : !listings.length ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No listings with status “{statusFilter}”.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const hostType = (listing.host_type ||
              listing.host_profiles?.host_type ||
              'private_landlord') as HostType
            const verified = hostVerified(listing)
            return (
              <Card
                key={listing.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                    {listing.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.photos[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-indigo-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                        {listing.title}
                      </h3>
                      <Badge variant="secondary">{HOST_TYPE_LABELS[hostType]}</Badge>
                      <Badge
                        variant={
                          listing.moderation_status === 'pending'
                            ? 'outline'
                            : listing.moderation_status === 'approved'
                              ? 'default'
                              : 'destructive'
                        }
                      >
                        {listing.moderation_status}
                      </Badge>
                      {listing.status === 'archived' && (
                        <Badge className="gap-1 border-0 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <Archive className="h-3 w-3" />
                          Archived
                        </Badge>
                      )}
                      {verified ? (
                        <Badge className="gap-1 border-0 bg-indigo-100 text-indigo-800">
                          <ShieldCheck className="h-3 w-3" />
                          Host verified
                        </Badge>
                      ) : (
                        <Badge className="gap-1 border-0 bg-rose-100 text-rose-800">
                          <ShieldAlert className="h-3 w-3" />
                          Host unverified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {listing.city} · €{Number(listing.rent_monthly).toLocaleString()}/mo · deposit €
                      {Number(listing.deposit_amount || 0).toLocaleString()} · seeking{' '}
                      {listing.seeking_people || listing.available_rooms}
                    </p>
                    <p className="text-xs text-slate-500">
                      Shown to students:{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {studentFacingHostName(listing) || '—'}
                      </span>
                      {' · '}
                      Account: {listing.host_trust?.display_name || '—'} ·{' '}
                      {listing.host_trust?.email || listing.landlord_email}
                      {listing.host_trust?.kvk_number
                        ? ` · KvK ${listing.host_trust.kvk_number}`
                        : ''}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {listing.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        openListing(listing)
                        setNotes(listing.moderation_notes || '')
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit / review
                    </Button>
                    {listing.moderation_status !== 'approved' &&
                      listing.status !== 'archived' && (
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        disabled={acting || !verified}
                        title={
                          !verified
                            ? 'Host must verify email before approval'
                            : undefined
                        }
                        onClick={() => moderate(listing.id, 'approved', listing)}
                      >
                        Approve
                      </Button>
                    )}
                    {listing.moderation_status !== 'rejected' &&
                      listing.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        disabled={acting}
                        onClick={() => moderate(listing.id, 'rejected', listing)}
                      >
                        Reject
                      </Button>
                    )}
                    {listing.status === 'archived' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acting}
                        onClick={() => setArchived(listing.id, false)}
                      >
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Unarchive
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-600"
                        disabled={acting}
                        onClick={() => setArchived(listing.id, true)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.address}, {selected?.postal_code} {selected?.city}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              {/* Host trust strip */}
              <div
                className={`rounded-2xl border px-3 py-3 ${
                  hostVerified(selected)
                    ? 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-950/40'
                    : 'border-rose-200 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-950/40'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  {hostVerified(selected) ? (
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                  )}
                  Host trust
                  {!hostVerified(selected) && (
                    <Badge className="border-0 bg-rose-600 text-white">Unverified</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Name: </span>
                    {selected.host_trust?.display_name || selected.landlord_name || '—'}
                  </div>
                  <div>
                    <span className="text-slate-500">Type: </span>
                    {HOST_TYPE_LABELS[
                      (selected.host_trust?.host_type ||
                        selected.host_type ||
                        'private_landlord') as HostType
                    ]}
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Email: </span>
                    {selected.host_trust?.email || selected.landlord_email || '—'}{' '}
                    {selected.host_trust?.email_verified ? (
                      <span className="text-emerald-700">(verified)</span>
                    ) : (
                      <span className="text-rose-700">(not verified)</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">KvK: </span>
                    {selected.host_trust?.kvk_number || '—'}{' '}
                    {selected.host_trust?.kvk_number ? (
                      <span className="text-slate-400">(self-reported)</span>
                    ) : null}
                  </div>
                  <div>
                    <span className="text-slate-500">Phone: </span>
                    {selected.host_trust?.phone || selected.landlord_phone || '—'}
                  </div>
                  <div>
                    <span className="text-slate-500">Account age: </span>
                    {selected.host_trust?.account_age_days != null
                      ? `${selected.host_trust.account_age_days}d`
                      : '—'}
                  </div>
                  <div>
                    <span className="text-slate-500">Listings / approved: </span>
                    {selected.host_trust?.prior_listings ?? 0} /{' '}
                    {selected.host_trust?.prior_approvals ?? 0}
                  </div>
                </div>
                {!hostVerified(selected) && (
                  <p className="mt-2 text-xs font-medium text-rose-800 dark:text-rose-200">
                    Approval is blocked until the host confirms their email.
                  </p>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Edit listing (admin)
                  </p>
                  <Button size="sm" disabled={acting} onClick={() => void saveListingEdits()}>
                    Save changes
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600" htmlFor="edit-title">
                    Title
                  </label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Listing title"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600" htmlFor="edit-host-name">
                    Host name shown to students
                  </label>
                  <Input
                    id="edit-host-name"
                    value={editHostName}
                    onChange={(e) => setEditHostName(e.target.value)}
                    placeholder="Name listed on this listing"
                  />
                  <p className="text-[11px] text-slate-500">
                    This updates the host profile name students see (same as Host Settings → Display
                    name) and syncs it onto this host&apos;s listings.
                    {selected.host_trust?.display_name
                      ? ` Current account name: ${selected.host_trust.display_name}.`
                      : ''}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600" htmlFor="edit-description">
                    About / description
                  </label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-address">
                      Street address
                    </label>
                    <Input
                      id="edit-address"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-city">
                      City
                    </label>
                    <Input
                      id="edit-city"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-postal">
                      Postal code
                    </label>
                    <Input
                      id="edit-postal"
                      value={editPostal}
                      onChange={(e) => setEditPostal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-min-stay">
                      Min stay (mo)
                    </label>
                    <Input
                      id="edit-min-stay"
                      type="number"
                      min={1}
                      value={editMinStay}
                      onChange={(e) => setEditMinStay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-max-stay">
                      Max stay (mo)
                    </label>
                    <Input
                      id="edit-max-stay"
                      type="number"
                      min={1}
                      value={editMaxStay}
                      onChange={(e) => setEditMaxStay(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-lat">
                      Latitude
                    </label>
                    <Input
                      id="edit-lat"
                      value={editLatitude}
                      onChange={(e) => setEditLatitude(e.target.value)}
                      placeholder="Leave blank to keep"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600" htmlFor="edit-lng">
                      Longitude
                    </label>
                    <Input
                      id="edit-lng"
                      value={editLongitude}
                      onChange={(e) => setEditLongitude(e.target.value)}
                      placeholder="Leave blank to keep"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600" htmlFor="edit-amenities">
                    Amenities (comma-separated)
                  </label>
                  <Input
                    id="edit-amenities"
                    value={editAmenities}
                    onChange={(e) => setEditAmenities(e.target.value)}
                    placeholder="wifi, heating, balcony"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editPets}
                      onChange={(e) => setEditPets(e.target.checked)}
                    />
                    Pets allowed
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editSmoking}
                      onChange={(e) => setEditSmoking(e.target.checked)}
                    />
                    Smoking allowed
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFurnished}
                      onChange={(e) => setEditFurnished(e.target.checked)}
                    />
                    Furnished
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editUtilities}
                      onChange={(e) => setEditUtilities(e.target.checked)}
                    />
                    Utilities included
                  </label>
                </div>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={acting}
                  onClick={() => void saveListingEdits()}
                >
                  Save listing changes
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-xs dark:bg-zinc-900/50">
                <div>Rent: €{Number(selected.rent_monthly).toLocaleString()}/mo</div>
                <div>Deposit: €{Number(selected.deposit_amount || 0).toLocaleString()}</div>
                <div>Utilities: €{Number(selected.utilities_cost || 0).toLocaleString()}</div>
                <div>Agency fee: €{Number(selected.agency_fee || 0).toLocaleString()}</div>
                <div>Rooms: {selected.total_rooms ?? '—'} (avail {selected.available_rooms})</div>
                <div>Seeking: {selected.seeking_people || selected.available_rooms}</div>
                <div>Baths: {selected.total_bathrooms ?? '—'}</div>
                <div>Size: {selected.square_meters ? `${selected.square_meters}m²` : '—'}</div>
                <div>Property: {selected.property_type}</div>
                <div>Room: {selected.room_type}</div>
                <div>Furnished: {selected.furnished ? 'yes' : 'no'}</div>
                <div>Utilities incl: {selected.utilities_included ? 'yes' : 'no'}</div>
                <div>Pets: {selected.pet_friendly ? 'yes' : 'no'}</div>
                <div>Smoking: {selected.smoking_allowed ? 'yes' : 'no'}</div>
                <div>From: {selected.available_from || '—'}</div>
                <div>Until: {selected.available_until || '—'}</div>
                <div>
                  Stay: {selected.min_stay_months ?? '—'}–
                  {selected.max_stay_months ?? '∞'} mo
                </div>
                <div>Photos: {selected.photos?.length || 0}</div>
              </div>

              {(selected.amenities || []).length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.amenities!.map((a) => (
                      <Badge key={a} variant="outline" className="text-xs">
                        {a.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selected.lifestyle_prefs && Object.keys(selected.lifestyle_prefs).length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Lifestyle prefs</p>
                  <pre className="overflow-x-auto rounded-xl bg-slate-50 p-2 text-[11px] dark:bg-zinc-900">
                    {JSON.stringify(selected.lifestyle_prefs, null, 2)}
                  </pre>
                </div>
              )}

              {selected.dealbreakers && Object.keys(selected.dealbreakers).length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Dealbreakers</p>
                  <pre className="overflow-x-auto rounded-xl bg-slate-50 p-2 text-[11px] dark:bg-zinc-900">
                    {JSON.stringify(selected.dealbreakers, null, 2)}
                  </pre>
                </div>
              )}

              {(selected.photos || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.photos!.slice(0, 8).map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-zinc-900/50">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    WWS certification
                  </p>
                  <Badge
                    className={
                      selected.wws_status === 'certified'
                        ? 'border-0 bg-emerald-600 text-white'
                        : selected.wws_status === 'not_certified'
                          ? 'border-0 bg-slate-500 text-white'
                          : 'border-0 bg-amber-500 text-white'
                    }
                  >
                    {selected.wws_status === 'certified'
                      ? 'WWS certified'
                      : selected.wws_status === 'not_certified'
                        ? 'Not WWS certified'
                        : 'Under review'}
                  </Badge>
                </div>
                {(selected.wws_documents || []).length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selected.wws_documents!.map((url, i) => {
                      const isPdf = url.toLowerCase().includes('.pdf')
                      return isPdf ? (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-16 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-indigo-600 dark:border-slate-600 dark:bg-zinc-800"
                        >
                          Doc {i + 1}.pdf
                        </a>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt={`WWS proof ${i + 1}`}
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <p className="mb-3 text-xs text-slate-500">
                    Host has not uploaded WWS proof yet.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting}
                    onClick={() => setWwsStatus(selected.id, 'under_review')}
                  >
                    Under review
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={acting}
                    onClick={() => setWwsStatus(selected.id, 'certified')}
                  >
                    Certify WWS
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-700"
                    disabled={acting}
                    onClick={() => setWwsStatus(selected.id, 'not_certified')}
                  >
                    Not certified
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600" htmlFor="mod-notes">
                  Moderation notes
                </label>
                <Textarea
                  id="mod-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional note for the host / audit trail"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <Button
              variant="ghost"
              className="text-slate-600"
              disabled={acting || !selected}
              onClick={() =>
                selected && setArchived(selected.id, selected.status !== 'archived')
              }
            >
              {selected?.status === 'archived' ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={acting || !selected || selected?.status === 'archived'}
                onClick={() => selected && moderate(selected.id, 'needs_review', selected)}
              >
                Needs review
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600"
                disabled={acting || !selected || selected?.status === 'archived'}
                onClick={() => selected && moderate(selected.id, 'rejected', selected)}
              >
                Reject
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={
                  acting ||
                  !selected ||
                  selected.status === 'archived' ||
                  !hostVerified(selected)
                }
                title={
                  selected && !hostVerified(selected)
                    ? 'Host must verify email before approval'
                    : undefined
                }
                onClick={() => selected && moderate(selected.id, 'approved', selected)}
              >
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
