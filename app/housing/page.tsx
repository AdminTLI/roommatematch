import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HousingPageClient } from './HousingPageClient'
import { getDefaultFilters } from '@/lib/housing/url-sync'
import { Listing, Coords } from '@/types/housing'
import { HousingErrorBoundary } from '@/components/housing/ErrorBoundary'

export default async function HousingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user's campus information
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('campus_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Get campus coordinates if available
  let userCampusCoords: Coords | undefined
  if (userProfile?.campus_id) {
    const { data: campus } = await supabase
      .from('campuses')
      .select('latitude, longitude')
      .eq('id', userProfile.campus_id)
      .single()
    
    if (campus?.latitude && campus?.longitude) {
      userCampusCoords = {
        lat: campus.latitude,
        lng: campus.longitude
      }
    }
  }

  // Get campus options
  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name')
    .order('name')

  const campusOptions = campuses?.map(campus => ({
    id: campus.id,
    name: campus.name
  })) || []

  // Fetch real listings from database
  const { data: listings, error: listingsError } = await supabase
    .from('housing_listings')
    .select('*')
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)

  if (listingsError) {
    console.error('Failed to fetch listings:', listingsError)
  }

  // Always pass empty array if no listings, never null/undefined
  const initialListings = listings || []

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <HousingErrorBoundary>
        <HousingPageClient
          initialListings={initialListings}
          initialFilters={getDefaultFilters()}
          campusOptions={campusOptions}
          userCampusId={userProfile?.campus_id}
          userCampusCoords={userCampusCoords}
        />
      </HousingErrorBoundary>
    </AppShell>
  )
}
