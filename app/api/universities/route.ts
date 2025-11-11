/**
 * Universities API
 * 
 * GET /api/universities?city=<cityName>
 * 
 * Returns:
 * - If city provided: universities in that city with user counts
 * - If no city: list of all cities that have universities (for dropdown)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * GET /api/universities
 * 
 * Query parameters:
 * - city: Optional city name to filter universities
 * 
 * Returns:
 * - 200: { cities?: string[], universities?: UniversityWithCount[] }
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    const supabase = await createClient()

    // If no city parameter, return list of cities with universities
    if (!city) {
      // Try using service client first (simpler, more reliable)
      let citiesData: any[] | null = null
      let citiesError: any = null
      
      try {
        const serviceClient = createServiceClient()
        const result = await serviceClient
          .from('universities')
          .select('city')
          .eq('is_active', true)
          .not('city', 'is', null)
        
        citiesData = result.data
        citiesError = result.error
      } catch (err: any) {
        console.error('Error creating service client, trying admin client:', err)
        // Fallback to admin client
        try {
          const adminSupabase = createAdminClient()
          const result = await adminSupabase
            .from('universities')
            .select('city')
            .eq('is_active', true)
            .not('city', 'is', null)
          
          citiesData = result.data
          citiesError = result.error
        } catch (adminErr: any) {
          console.error('Error with admin client, trying regular client:', adminErr)
          // Last resort: try regular client (might work if RLS allows)
          const result = await supabase
            .from('universities')
            .select('city')
            .eq('is_active', true)
            .not('city', 'is', null)
          
          citiesData = result.data
          citiesError = result.error
        }
      }

      if (citiesError) {
        console.error('Error fetching cities:', citiesError)
        console.error('Error code:', citiesError.code)
        console.error('Error message:', citiesError.message)
        console.error('Error details:', JSON.stringify(citiesError, null, 2))
        return NextResponse.json(
          { 
            error: 'Internal server error', 
            cities: [], 
            details: citiesError.message,
            code: citiesError.code
          },
          { status: 500 }
        )
      }

      if (!citiesData || citiesData.length === 0) {
        console.warn('No cities found in database - this should not happen if migration was applied')
        return NextResponse.json({ cities: [] })
      }

      // Get unique cities and sort them
      const uniqueCities = Array.from(
        new Set(citiesData.map(u => u.city).filter(Boolean))
      ).sort() as string[]

      console.log(`✅ Returning ${uniqueCities.length} cities`)

      // Set cache headers (cities list is relatively static)
      const response = NextResponse.json({ cities: uniqueCities })
      response.headers.set(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400'
      )

      return response
    }

    // If city provided, return universities in that city with user counts
    // Count ALL users who selected that university (not just active users)
    // Use service client for reliable access
    const serviceClient = createServiceClient()
    
    const { data: universitiesData, error: universitiesError } = await serviceClient
      .from('universities')
      .select('id, name, slug, city')
      .eq('is_active', true)
      .eq('city', city)
      .order('name')

    if (universitiesError) {
      console.error('Error fetching universities:', universitiesError)
      return NextResponse.json(
        { error: 'Internal server error', universities: [] },
        { status: 500 }
      )
    }

    if (!universitiesData || universitiesData.length === 0) {
      return NextResponse.json({ universities: [] })
    }

    // Get all university IDs
    const universityIds = universitiesData.map(u => u.id)

    // Use service client to bypass RLS for counting profiles
    // This is safe as we're only counting, not exposing sensitive data
    
    // Fetch all profiles for these universities in a single query
    // Count ALL profiles (not filtering by user active status)
    const { data: profilesData, error: profilesError } = await serviceClient
      .from('profiles')
      .select('university_id')
      .in('university_id', universityIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // Continue with user_count = 0 for all universities
    }

    // Count profiles per university
    const userCounts = new Map<string, number>()
    if (profilesData) {
      profilesData.forEach(profile => {
        const count = userCounts.get(profile.university_id) || 0
        userCounts.set(profile.university_id, count + 1)
      })
    }

    // Combine universities with user counts
    const universitiesWithCounts = universitiesData.map(uni => ({
      id: uni.id,
      name: uni.name,
      slug: uni.slug,
      city: uni.city,
      user_count: userCounts.get(uni.id) || 0
    }))

    // Sort by user count (descending), then by name
    universitiesWithCounts.sort((a, b) => {
      if (b.user_count !== a.user_count) {
        return b.user_count - a.user_count
      }
      return a.name.localeCompare(b.name)
    })

    // Set cache headers (user counts change frequently, so shorter cache)
    const response = NextResponse.json({
      universities: universitiesWithCounts
    })
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    )

    return response
  } catch (error) {
    console.error('Unexpected error in universities API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

