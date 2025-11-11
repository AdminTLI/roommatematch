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
import { createClient } from '@supabase/supabase-js'

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

    // Use service role key directly to bypass RLS completely
    // This is necessary because RLS policies can cause recursion issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error', cities: [] },
        { status: 500 }
      )
    }

    // Create client with service role key - this bypasses RLS completely
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // If no city parameter, return list of cities with universities
    if (!city) {
      const { data: citiesData, error: citiesError } = await supabase
        .from('universities')
        .select('city')
        .eq('is_active', true)
        .not('city', 'is', null)

      if (citiesError) {
        console.error('Error fetching cities:', citiesError)
        console.error('Error code:', citiesError.code)
        console.error('Error message:', citiesError.message)
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
        console.warn('No cities found in database')
        return NextResponse.json({ cities: [] })
      }

      // Get unique cities and sort them
      const uniqueCities = Array.from(
        new Set(citiesData.map(u => u.city).filter(Boolean))
      ).sort() as string[]

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
    const { data: universitiesData, error: universitiesError } = await supabase
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

    // Fetch all profiles for these universities in a single query
    // Count ALL profiles (not filtering by user active status)
    // Using service role key bypasses RLS completely
    const { data: profilesData, error: profilesError } = await supabase
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

