import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { adminRecord } = adminCheck
    const admin = createAdminClient()
    const isSuperAdmin = adminRecord?.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord?.university_id

    // Get date range from query params (default to all time)
    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get('days')
    const startDate = days 
      ? new Date(Date.now() - parseInt(days, 10) * 24 * 60 * 60 * 1000)
      : null

    // Get unique users with geographic data
    let usersQuery = admin
      .from('user_journey_events')
      .select('user_id, country_code, country_name, city, region')
      .not('country_code', 'is', null)

    if (startDate) {
      usersQuery = usersQuery.gte('event_timestamp', startDate.toISOString())
    }

    // Filter by university if needed
    if (universityId) {
      const { data: academic } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)
      
      const universityUserIds = new Set(academic?.map(a => a.user_id) || [])
      
      if (universityUserIds.size > 0) {
        usersQuery = usersQuery.in('user_id', Array.from(universityUserIds))
      } else {
        return NextResponse.json({
          countries: [],
          cities: [],
          regions: []
        })
      }
    }

    const { data: events, error } = await usersQuery

    if (error) {
      safeLogger.error('[Admin Analytics] Geographic error', { error })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Get unique users per country
    const countryUsers = new Map<string, Set<string>>()
    const countryNames = new Map<string, string>()
    const cityUsers = new Map<string, Set<string>>()
    const regionUsers = new Map<string, Set<string>>()

    events?.forEach(event => {
      if (!event.user_id) return

      // Country data
      if (event.country_code) {
        if (!countryUsers.has(event.country_code)) {
          countryUsers.set(event.country_code, new Set())
        }
        countryUsers.get(event.country_code)!.add(event.user_id)
        
        if (event.country_name) {
          countryNames.set(event.country_code, event.country_name)
        }
      }

      // City data
      if (event.city && event.country_code) {
        const cityKey = `${event.city}, ${event.country_code}`
        if (!cityUsers.has(cityKey)) {
          cityUsers.set(cityKey, new Set())
        }
        cityUsers.get(cityKey)!.add(event.user_id)
      }

      // Region data
      if (event.region && event.country_code) {
        const regionKey = `${event.region}, ${event.country_code}`
        if (!regionUsers.has(regionKey)) {
          regionUsers.set(regionKey, new Set())
        }
        regionUsers.get(regionKey)!.add(event.user_id)
      }
    })

    // Convert to arrays
    const countries = Array.from(countryUsers.entries())
      .map(([code, users]) => ({
        code,
        name: countryNames.get(code) || code,
        userCount: users.size
      }))
      .sort((a, b) => b.userCount - a.userCount)

    const cities = Array.from(cityUsers.entries())
      .map(([city, users]) => ({
        city,
        userCount: users.size
      }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 20) // Top 20 cities

    const regions = Array.from(regionUsers.entries())
      .map(([region, users]) => ({
        region,
        userCount: users.size
      }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 20) // Top 20 regions

    return NextResponse.json({
      countries,
      cities,
      regions,
      totalUsers: new Set(events?.map(e => e.user_id).filter(Boolean) || []).size
    })
  } catch (error) {
    safeLogger.error('[Admin Analytics] Geographic error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

