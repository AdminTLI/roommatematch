'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Home,
  MapPin,
  Sparkles,
  Shield,
  Wallet,
  Camera,
  type LucideIcon,
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OnboardingHeader } from '@/components/questionnaire/OnboardingHeader'
import { AddressAutocomplete } from '@/components/host/address-autocomplete'
import { COMMON_AMENITIES } from '@/lib/housing/types'
import {
  AMENITY_LABELS,
  EMPTY_LISTING_DRAFT,
  LISTING_SECTION_META,
  LISTING_WIZARD_SECTIONS,
  draftHasMeaningfulProgress,
  draftToApiBody,
  draftToDraftApiBody,
  validateListingSection,
  type ListingWizardDraft,
  type ListingWizardSection,
} from '@/lib/host/listing-wizard'
import { cn } from '@/lib/utils'

const SECTION_ICONS: Record<ListingWizardSection, LucideIcon> = {
  basics: FileText,
  location: MapPin,
  property: Home,
  pricing: Wallet,
  rules: Shield,
  lifestyle: Sparkles,
  review: Check,
}

const fieldClassName =
  'h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0F172A] shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/30'

const selectClassName =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0F172A] shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50'

const textareaClassName =
  'min-h-[120px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#0F172A] shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-sm font-bold text-[#1E293B] dark:text-slate-200">{children}</Label>
  )
}

function LikertRow({
  label,
  hint,
  value,
  onChange,
  left,
  right,
}: {
  label: string
  hint?: string
  value: number | null
  onChange: (n: number) => void
  left: string
  right: string
}) {
  return (
    <div className="space-y-2.5 rounded-xl bg-slate-50 px-3.5 py-3.5 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:ring-slate-700">
      <div>
        <p className="text-sm font-semibold text-[#0F172A] dark:text-slate-50">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            onClick={() => onChange(n)}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition',
              value === n
                ? 'bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
            )}
            aria-checked={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition',
        checked
          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/15'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800'
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold',
          checked
            ? 'border-indigo-500 bg-indigo-500 text-white'
            : 'border-slate-300 bg-white text-transparent dark:border-slate-500 dark:bg-slate-800'
        )}
      >
        ✓
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#0F172A] dark:text-slate-50">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  )
}

type ListingWizardClientProps = {
  listingId?: string | null
  initialDraft?: ListingWizardDraft
  initialSection?: ListingWizardSection
  /** Existing listing status when editing (draft | pending | active | …) */
  initialStatus?: string | null
}

export function ListingWizardClient({
  listingId: initialListingId = null,
  initialDraft = EMPTY_LISTING_DRAFT,
  initialSection = 'basics',
  initialStatus = null,
}: ListingWizardClientProps) {
  const router = useRouter()
  const [listingId, setListingId] = useState<string | null>(initialListingId)
  const [listingStatus, setListingStatus] = useState<string | null>(initialStatus)
  const [section, setSection] = useState<ListingWizardSection>(initialSection)
  const [draft, setDraft] = useState<ListingWizardDraft>(initialDraft)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    initialListingId ? Date.now() : null
  )
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const allowLeaveRef = useRef(false)
  const draftRef = useRef(draft)
  draftRef.current = draft

  const isDraftListing = !listingStatus || listingStatus === 'draft'
  const sectionIndex = LISTING_WIZARD_SECTIONS.indexOf(section)
  const meta = LISTING_SECTION_META[section]
  const hasProgress = draftHasMeaningfulProgress(draft)

  const patch = (partial: Partial<ListingWizardDraft>) => {
    setDraft((d) => ({ ...d, ...partial }))
    setError(null)
  }

  const parseApiError = (j: { error?: unknown }, fallback: string) => {
    if (typeof j.error === 'string') return j.error
    const formErrors = (j.error as { formErrors?: string[] } | undefined)?.formErrors
    if (formErrors?.[0]) return formErrors[0]
    return fallback
  }

  const persistProgress = async (
    nextSection: ListingWizardSection,
    currentDraft: ListingWizardDraft = draftRef.current
  ) => {
    if (!draftHasMeaningfulProgress(currentDraft) && !listingId) return listingId

    setSaving(true)
    try {
      const body = draftToDraftApiBody(currentDraft, nextSection)
      if (listingId) {
        const res = await fetchWithCSRF(`/api/host/listings/${listingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = await res.json()
        if (!res.ok) throw new Error(parseApiError(j, 'Failed to save draft'))
        if (j.listing?.status) setListingStatus(j.listing.status)
      } else {
        const res = await fetchWithCSRF('/api/host/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = await res.json()
        if (!res.ok) throw new Error(parseApiError(j, 'Failed to save draft'))
        const id = j.listing?.id as string | undefined
        if (!id) throw new Error('Draft saved but no listing id returned')
        setListingId(id)
        setListingStatus(j.listing?.status || 'draft')
        setLastSavedAt(Date.now())
        // Keep URL shareable / refreshable for resume
        router.replace(`/host/listings/wizard?id=${id}`)
        return id
      }
      setLastSavedAt(Date.now())
      return listingId
    } finally {
      setSaving(false)
    }
  }

  const goTo = async (next: ListingWizardSection) => {
    const err = validateListingSection(section, draft)
    if (err && LISTING_WIZARD_SECTIONS.indexOf(next) > sectionIndex) {
      setError(err)
      return
    }
    setError(null)
    try {
      if (LISTING_WIZARD_SECTIONS.indexOf(next) > sectionIndex) {
        await persistProgress(next)
      }
      setSection(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft')
    }
  }

  const goNext = async () => {
    const err = validateListingSection(section, draft)
    if (err) {
      setError(err)
      return
    }
    const next = LISTING_WIZARD_SECTIONS[sectionIndex + 1]
    if (!next) return
    setError(null)
    try {
      await persistProgress(next)
      setSection(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft')
    }
  }

  const goBack = () => {
    const prev = LISTING_WIZARD_SECTIONS[sectionIndex - 1]
    if (prev) {
      setError(null)
      setSection(prev)
    }
  }

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetchWithCSRF('/api/host/photos', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Upload failed')
      if (j.url) patch({ photos: [...draft.photos, j.url] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const uploadWwsDocument = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetchWithCSRF('/api/host/wws-documents', {
        method: 'POST',
        body: fd,
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Upload failed')
      if (j.url) patch({ wws_documents: [...draft.wws_documents, j.url] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    for (const s of LISTING_WIZARD_SECTIONS) {
      if (s === 'review') continue
      const err = validateListingSection(s, draft)
      if (err) {
        setSection(s)
        setError(err)
        return
      }
    }
    setLoading(true)
    setError(null)
    try {
      const body = draftToApiBody(draft, true)
      const res = listingId
        ? await fetchWithCSRF(`/api/host/listings/${listingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetchWithCSRF('/api/host/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
      const j = await res.json()
      if (!res.ok) {
        throw new Error(parseApiError(j, 'Failed to submit listing'))
      }
      allowLeaveRef.current = true
      router.push('/host/listings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const requestLeave = () => {
    if (allowLeaveRef.current || !hasProgress) return true
    setLeaveOpen(true)
    return false
  }

  const confirmLeaveKeepDraft = async () => {
    try {
      if (hasProgress) {
        await persistProgress(section)
      }
    } catch {
      // Still allow leave; draft may already exist from prior steps
    }
    allowLeaveRef.current = true
    setLeaveOpen(false)
    router.push('/host/listings')
  }

  const confirmDiscardAndLeave = async () => {
    setDiscarding(true)
    try {
      if (listingId && isDraftListing) {
        await fetchWithCSRF(`/api/host/listings/${listingId}`, { method: 'DELETE' })
      }
      allowLeaveRef.current = true
      setLeaveOpen(false)
      router.push('/host/listings')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to discard draft')
      setLeaveOpen(false)
    } finally {
      setDiscarding(false)
    }
  }

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowLeaveRef.current || !hasProgress) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasProgress])

  const completionHints = useMemo(() => {
    return LISTING_WIZARD_SECTIONS.filter((s) => s !== 'review').map((s) => ({
      id: s,
      ok: validateListingSection(s, draft) === null,
    }))
  }, [draft])

  const saveChipLabel = saving
    ? 'Saving…'
    : lastSavedAt
      ? `Draft saved ${new Date(lastSavedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : `Step ${sectionIndex + 1} of ${LISTING_WIZARD_SECTIONS.length}`

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave listing editor?</DialogTitle>
            <DialogDescription>
              {isDraftListing
                ? 'Your progress can be kept as a draft under Your listings, or discarded permanently.'
                : 'Changes from completed steps are already saved. Leave the editor?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setLeaveOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Keep editing
            </button>
            {isDraftListing ? (
              <button
                type="button"
                disabled={discarding}
                onClick={confirmDiscardAndLeave}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {discarding ? 'Discarding…' : 'Discard draft'}
              </button>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={confirmLeaveKeepDraft}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
            >
              {isDraftListing ? 'Save draft & leave' : 'Leave'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingHeader
          statusMode="autosave"
          saveLabel={saveChipLabel}
          exitHref="/host/listings"
          onExit={requestLeave}
        />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:py-8 lg:flex-row lg:gap-8">
          {/* Section nav (settings-style) */}
          <aside className="lg:w-64 lg:shrink-0">
            <div className="hidden rounded-2xl bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700/80 lg:block">
              <nav className="space-y-1">
                {LISTING_WIZARD_SECTIONS.map((id, i) => {
                  const Icon = SECTION_ICONS[id]
                  const active = section === id
                  const done = completionHints.find((h) => h.id === id)?.ok
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goTo(id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition',
                        active
                          ? 'bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-slate-400')} />
                      <span className="min-w-0 flex-1 truncate">{LISTING_SECTION_META[id].label}</span>
                      {done && !active && id !== 'review' ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
                      ) : (
                        <span
                          className={cn(
                            'text-[11px] font-semibold',
                            active ? 'text-indigo-100' : 'text-slate-400'
                          )}
                        >
                          {i + 1}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {LISTING_WIZARD_SECTIONS.map((id) => {
                  const active = section === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goTo(id)}
                      className={cn(
                        'shrink-0 rounded-full px-4 py-2 text-xs font-semibold ring-1 transition',
                        active
                          ? 'bg-indigo-500 text-white ring-indigo-500'
                          : 'bg-white text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                      )}
                    >
                      {LISTING_SECTION_META[id].label}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Content card */}
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl bg-white p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80 sm:p-8">
              <header className="space-y-1.5 border-b border-slate-100 pb-6 dark:border-slate-700">
                <h1 className="text-[1.45rem] font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[1.75rem]">
                  {meta.label}
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {meta.description}
                </p>
              </header>

              <form
                className="mt-6 space-y-5"
                autoComplete="off"
                onSubmit={(e) => e.preventDefault()}
              >
                {section === 'basics' && (
                  <>
                    <div className="space-y-2">
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        value={draft.title}
                        onChange={(e) => patch({ title: e.target.value })}
                        placeholder="Bright room near campus"
                        className={fieldClassName}
                        autoComplete="off"
                        name="listing-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        value={draft.description}
                        onChange={(e) => patch({ description: e.target.value })}
                        rows={6}
                        placeholder="Who thrives here, what’s nearby, and how the house feels day to day…"
                        className={textareaClassName}
                        autoComplete="off"
                        name="listing-description"
                      />
                    </div>
                    <div className="space-y-3">
                      <FieldLabel>Photos</FieldLabel>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-600 dark:bg-slate-900/50">
                        <Camera className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {uploading ? 'Uploading…' : 'Add photos (JPEG, PNG, WebP)'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={uploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) await uploadPhoto(file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                      {draft.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {draft.photos.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={url}
                              src={url}
                              alt=""
                              className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {section === 'location' && (
                  <>
                    <div className="space-y-2">
                      <FieldLabel>Street address</FieldLabel>
                      <AddressAutocomplete
                        value={draft.address}
                        onChange={(address) =>
                          patch({ address, latitude: '', longitude: '' })
                        }
                        onResolved={(a) =>
                          patch({
                            address: a.addressLine,
                            city: a.city,
                            postal_code: a.postalCode,
                            house_number: a.houseNumber,
                            house_letter: a.houseLetter,
                            house_number_addition: a.houseNumberAddition,
                            latitude: a.latitude != null ? String(a.latitude) : '',
                            longitude: a.longitude != null ? String(a.longitude) : '',
                          })
                        }
                        inputClassName={fieldClassName}
                      />
                      <p className="text-xs text-slate-500">
                        Choose a suggestion so the map pin matches the street. Students see
                        the street address on the listing page.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>City</FieldLabel>
                        <Input
                          value={draft.city}
                          onChange={(e) => patch({ city: e.target.value })}
                          className={fieldClassName}
                          autoComplete="address-level2"
                          name="listing-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Postal code</FieldLabel>
                        <Input
                          value={draft.postal_code}
                          onChange={(e) => patch({ postal_code: e.target.value })}
                          className={fieldClassName}
                          autoComplete="postal-code"
                          name="listing-postal-code"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <FieldLabel>House number</FieldLabel>
                        <Input
                          value={draft.house_number}
                          onChange={(e) => patch({ house_number: e.target.value })}
                          placeholder="23"
                          className={fieldClassName}
                          autoComplete="off"
                          name="listing-house-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>House letter</FieldLabel>
                        <Input
                          value={draft.house_letter}
                          onChange={(e) => patch({ house_letter: e.target.value })}
                          placeholder="A"
                          maxLength={5}
                          className={fieldClassName}
                          autoComplete="off"
                          name="listing-house-letter"
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Addition</FieldLabel>
                        <Input
                          value={draft.house_number_addition}
                          onChange={(e) => patch({ house_number_addition: e.target.value })}
                          placeholder="2 / bis"
                          className={fieldClassName}
                          autoComplete="off"
                          name="listing-house-addition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {section === 'property' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>Property type</FieldLabel>
                        <select
                          value={draft.property_type}
                          onChange={(e) =>
                            patch({
                              property_type: e.target.value as ListingWizardDraft['property_type'],
                            })
                          }
                          className={selectClassName}
                          autoComplete="off"
                        >
                          <option value="">Select property type</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="studio">Studio</option>
                          <option value="private_room">Private room</option>
                          <option value="shared_room">Shared room</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Room type offered</FieldLabel>
                        <select
                          value={draft.room_type}
                          onChange={(e) =>
                            patch({ room_type: e.target.value as ListingWizardDraft['room_type'] })
                          }
                          className={selectClassName}
                          autoComplete="off"
                        >
                          <option value="">Select room type</option>
                          <option value="private">Private room</option>
                          <option value="shared">Shared room</option>
                          <option value="studio">Studio</option>
                          <option value="entire_place">Entire place</option>
                        </select>
                      </div>
                    </div>
                    {['apartment', 'studio', 'private_room', 'shared_room'].includes(
                      draft.property_type
                    ) ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel>Floor</FieldLabel>
                          <select
                            value={draft.floor_level}
                            onChange={(e) => patch({ floor_level: e.target.value })}
                            className={selectClassName}
                          >
                            <option value="">Select floor</option>
                            <option value="basement">Basement</option>
                            <option value="ground">Ground floor</option>
                            <option value="1">1st floor</option>
                            <option value="2">2nd floor</option>
                            <option value="3">3rd floor</option>
                            <option value="4">4th floor</option>
                            <option value="5">5th floor</option>
                            <option value="6+">6th floor or higher</option>
                            <option value="attic">Attic / loft</option>
                          </select>
                          <p className="text-xs text-slate-500">
                            Students care about stairs, elevators, and noise from the street.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Apartment / unit number</FieldLabel>
                          <Input
                            value={draft.unit_label}
                            onChange={(e) => patch({ unit_label: e.target.value })}
                            placeholder="e.g. 3B, links, boven"
                            className={fieldClassName}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FieldLabel>Unit label (optional)</FieldLabel>
                        <Input
                          value={draft.unit_label}
                          onChange={(e) => patch({ unit_label: e.target.value })}
                          placeholder="e.g. annex, achterhuis"
                          className={fieldClassName}
                        />
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {(
                        [
                          ['total_rooms', 'Total rooms'],
                          ['available_rooms', 'Available now'],
                          ['seeking_people', 'Seeking people'],
                          ['total_bathrooms', 'Bathrooms'],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key} className="space-y-2">
                          <FieldLabel>{label}</FieldLabel>
                          <Input
                            type="number"
                            step={key === 'total_bathrooms' ? '0.5' : '1'}
                            min={key === 'total_bathrooms' ? '0.5' : '1'}
                            value={draft[key]}
                            onChange={(e) => patch({ [key]: e.target.value })}
                            className={fieldClassName}
                            autoComplete="off"
                            name={`listing-${key}`}
                            placeholder=""
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Size (m², optional)</FieldLabel>
                      <Input
                        type="number"
                        value={draft.square_meters}
                        onChange={(e) => patch({ square_meters: e.target.value })}
                        className={fieldClassName}
                        autoComplete="off"
                        name="listing-square-meters"
                      />
                    </div>
                    <div className="space-y-3">
                      <FieldLabel>Amenities</FieldLabel>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {COMMON_AMENITIES.map((id) => {
                          const on = draft.amenities.includes(id)
                          return (
                            <ToggleRow
                              key={id}
                              label={AMENITY_LABELS[id]}
                              checked={on}
                              onChange={(v) =>
                                patch({
                                  amenities: v
                                    ? [...draft.amenities, id]
                                    : draft.amenities.filter((a) => a !== id),
                                })
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ToggleRow
                        label="Furnished"
                        checked={draft.furnished}
                        onChange={(v) => patch({ furnished: v })}
                      />
                      <ToggleRow
                        label="Parking available"
                        checked={draft.parking_available}
                        onChange={(v) => patch({ parking_available: v })}
                      />
                    </div>
                  </>
                )}

                {section === 'pricing' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>Rent € / month</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          value={draft.rent_monthly}
                          onChange={(e) => patch({ rent_monthly: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Deposit €</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          value={draft.deposit_amount}
                          onChange={(e) => patch({ deposit_amount: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    </div>
                    <ToggleRow
                      label="Utilities included in rent"
                      description="Heating, water, electricity, internet if applicable"
                      checked={draft.utilities_included}
                      onChange={(v) => patch({ utilities_included: v })}
                    />
                    {!draft.utilities_included && (
                      <div className="space-y-2">
                        <FieldLabel>Estimated utilities € / month</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          value={draft.utilities_cost}
                          onChange={(e) => patch({ utilities_cost: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <FieldLabel>Agency fee € (optional)</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        value={draft.agency_fee}
                        onChange={(e) => patch({ agency_fee: e.target.value })}
                        className={fieldClassName}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>Available from</FieldLabel>
                        <Input
                          type="date"
                          value={draft.available_from}
                          onChange={(e) => patch({ available_from: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Available until (optional)</FieldLabel>
                        <Input
                          type="date"
                          value={draft.available_until}
                          onChange={(e) => patch({ available_until: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel>Minimum stay (months)</FieldLabel>
                        <Input
                          type="number"
                          min="1"
                          value={draft.min_stay_months}
                          onChange={(e) => patch({ min_stay_months: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Maximum stay (optional)</FieldLabel>
                        <Input
                          type="number"
                          min="1"
                          value={draft.max_stay_months}
                          onChange={(e) => patch({ max_stay_months: e.target.value })}
                          className={fieldClassName}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200/80 pt-5 dark:border-slate-700">
                      <div>
                        <FieldLabel>WWS certification proof</FieldLabel>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          Upload a points calculation, Huurcommissie sheet, or screenshot that
                          supports your WWS rent. Our team reviews this before showing a WWS badge.
                        </p>
                      </div>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-600 dark:bg-slate-900/50">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {uploading
                            ? 'Uploading…'
                            : 'Add WWS proof (JPEG, PNG, WebP, PDF)'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          disabled={uploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) await uploadWwsDocument(file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                      {draft.wws_documents.length > 0 && (
                        <ul className="space-y-2">
                          {draft.wws_documents.map((url, i) => {
                            const isPdf = url.toLowerCase().includes('.pdf')
                            return (
                              <li
                                key={url}
                                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:ring-slate-700"
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="min-w-0 truncate font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                >
                                  {isPdf ? `WWS document ${i + 1}.pdf` : `WWS image ${i + 1}`}
                                </a>
                                <button
                                  type="button"
                                  className="shrink-0 text-xs font-medium text-slate-500 hover:text-rose-600"
                                  onClick={() =>
                                    patch({
                                      wws_documents: draft.wws_documents.filter((u) => u !== url),
                                    })
                                  }
                                >
                                  Remove
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {section === 'rules' && (
                  <>
                    <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-amber-950 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/70">
                      These become hard filters when ranking applicants: the same gates students
                      answer in onboarding (smoking, pets, short-lets, registration).
                    </p>
                    <ToggleRow
                      label="Pet friendly"
                      description="Applicants who need pets can pass this gate"
                      checked={draft.pet_friendly}
                      onChange={(v) => patch({ pet_friendly: v })}
                    />
                    <ToggleRow
                      label="Smoking allowed indoors"
                      description="Leave off for a smoke-free home (most student matches)"
                      checked={draft.smoking_allowed}
                      onChange={(v) => patch({ smoking_allowed: v })}
                    />
                    <ToggleRow
                      label="No Airbnb / short-lets"
                      description="Block applicants open to subletting or short-term hosting"
                      checked={draft.no_airbnb}
                      onChange={(v) => patch({ no_airbnb: v })}
                    />
                    <ToggleRow
                      label="BRP / registration support required"
                      description="Prefer applicants who need municipal registration help"
                      checked={draft.brp_required}
                      onChange={(v) => patch({ brp_required: v })}
                    />
                    <ToggleRow
                      label="Study-friendly home"
                      description="Quiet enough for focused coursework most evenings"
                      checked={draft.study_friendly}
                      onChange={(v) => patch({ study_friendly: v })}
                    />
                  </>
                )}

                {section === 'lifestyle' && (
                  <>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      These mirror living questions students answer. Soft scores rank applicants.
                      We never use nationality, gender, or similar filters.
                    </p>
                    <div className="space-y-2">
                      <FieldLabel>Ideal daily rhythm</FieldLabel>
                      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                        {(
                          [
                            ['early', 'Early bird'],
                            ['flexible', 'Flexible'],
                            ['late', 'Night owl'],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => patch({ preferred_schedule: value })}
                            className={cn(
                              'rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:text-sm',
                              draft.preferred_schedule === value
                                ? 'bg-white text-[#6366F1] shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-400'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <LikertRow
                      label="Cleanliness standard"
                      hint="Same scale as student shared-space tidiness"
                      value={draft.cleanliness}
                      onChange={(n) => patch({ cleanliness: n })}
                      left="Relaxed"
                      right="Very tidy"
                    />
                    <LikertRow
                      label="Quiet hours importance"
                      hint="How strictly evenings should stay calm"
                      value={draft.quiet_hours_importance}
                      onChange={(n) => patch({ quiet_hours_importance: n })}
                      left="Flexible"
                      right="Strict"
                    />
                    <LikertRow
                      label="Day guests"
                      hint="How often visitors during the day feel okay"
                      value={draft.guests_frequency}
                      onChange={(n) => patch({ guests_frequency: n })}
                      left="Rarely"
                      right="Often"
                    />
                    <LikertRow
                      label="Overnight / partner stays"
                      hint="Comfort with overnight guests"
                      value={draft.overnight_guests}
                      onChange={(n) => patch({ overnight_guests: n })}
                      left="Rarely"
                      right="Often"
                    />
                    <LikertRow
                      label="Parties & gatherings at home"
                      value={draft.parties_frequency}
                      onChange={(n) => patch({ parties_frequency: n })}
                      left="Never"
                      right="Often"
                    />
                    <LikertRow
                      label="Social energy in shared spaces"
                      value={draft.social_level}
                      onChange={(n) => patch({ social_level: n })}
                      left="Quiet house"
                      right="Lively house"
                    />
                    <LikertRow
                      label="Chore & upkeep expectation"
                      hint="How structured shared cleaning should be"
                      value={draft.chores_expectation}
                      onChange={(n) => patch({ chores_expectation: n })}
                      left="Loose"
                      right="Rota / structured"
                    />
                  </>
                )}

                {section === 'review' && (
                  <div className="space-y-4">
                    {(
                      [
                        ['Basics', `${draft.title || 'Untitled'} · ${draft.photos.length} photo(s)`],
                        [
                          'Location',
                          [
                            draft.address,
                            draft.house_letter ? `letter ${draft.house_letter}` : null,
                            draft.house_number_addition
                              ? `addition ${draft.house_number_addition}`
                              : null,
                            `${draft.postal_code} ${draft.city}`.trim(),
                          ]
                            .filter(Boolean)
                            .join(', '),
                        ],
                        [
                          'Property',
                          [
                            draft.property_type
                              ? draft.property_type.replace('_', ' ')
                              : 'Type not set',
                            draft.floor_level ? `floor ${draft.floor_level}` : null,
                            draft.unit_label ? `unit ${draft.unit_label}` : null,
                            draft.available_rooms
                              ? `${draft.available_rooms} room(s)`
                              : null,
                            draft.seeking_people
                              ? `seeking ${draft.seeking_people}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · '),
                        ],
                        [
                          'Pricing',
                          `€${draft.rent_monthly || '-'} / mo · from ${draft.available_from || '-'} · ${draft.wws_documents.length} WWS proof file(s)`,
                        ],
                        [
                          'Rules',
                          [
                            draft.pet_friendly ? 'Pets OK' : 'Pets not allowed',
                            draft.smoking_allowed ? 'Smoking OK' : 'Smoke-free',
                            draft.no_airbnb ? 'No short-lets' : 'Short-lets allowed',
                          ].join(' · '),
                        ],
                        [
                          'Lifestyle',
                          [
                            draft.cleanliness != null ? `Clean ${draft.cleanliness}/5` : null,
                            draft.quiet_hours_importance != null
                              ? `Quiet ${draft.quiet_hours_importance}/5`
                              : null,
                            draft.guests_frequency != null
                              ? `Guests ${draft.guests_frequency}/5`
                              : null,
                            draft.preferred_schedule || null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Not set',
                        ],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:ring-slate-700"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#0F172A] dark:text-slate-50">
                            {value}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xs font-semibold text-indigo-500 hover:text-indigo-600"
                          onClick={() =>
                            setSection(
                              label === 'Basics'
                                ? 'basics'
                                : label === 'Location'
                                  ? 'location'
                                  : label === 'Property'
                                    ? 'property'
                                    : label === 'Pricing'
                                      ? 'pricing'
                                      : label === 'Rules'
                                        ? 'rules'
                                        : 'lifestyle'
                            )
                          }
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Submitting sends the listing for moderation. Lifestyle answers rank anonymous
                      applicants against this home.
                    </p>
                  </div>
                )}

                {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
              </form>

              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-700">
                {sectionIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                    Back
                  </button>
                ) : null}

                {section !== 'review' ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={goNext}
                    className={cn(
                      'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition',
                      saving
                        ? 'cursor-not-allowed bg-indigo-500/40'
                        : 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600'
                    )}
                  >
                    {saving ? 'Saving…' : 'Continue'}
                    {!saving && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={submit}
                    className={cn(
                      'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition',
                      loading
                        ? 'cursor-not-allowed bg-indigo-500/40'
                        : 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600'
                    )}
                  >
                    {loading ? 'Submitting…' : 'Submit for review'}
                    {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
