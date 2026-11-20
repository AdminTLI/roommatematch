import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getHostProfileForUser } from '@/lib/host/auth'
import {
  listingToDraft,
  resumeWizardSection,
  type ListingWizardDraft,
  type ListingWizardSection,
} from '@/lib/host/listing-wizard'
import { ListingWizardClient } from '@/components/host/listing-wizard-client'

type PageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function ListingWizardPage({ searchParams }: PageProps) {
  const { id } = await searchParams

  if (!id) {
    return <ListingWizardClient />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  const admin = createAdminClient()
  const { data: listing, error } = await admin
    .from('housing_listings')
    .select('*')
    .eq('id', id)
    .eq('host_id', host.id)
    .maybeSingle()

  if (error || !listing) {
    redirect('/host/listings')
  }

  const initialDraft = listingToDraft(listing as Record<string, unknown>) as ListingWizardDraft
  const initialSection = resumeWizardSection(listing as Record<string, unknown>) as ListingWizardSection

  return (
    <ListingWizardClient
      listingId={listing.id}
      initialDraft={initialDraft}
      initialSection={initialSection}
      initialStatus={listing.status}
    />
  )
}
