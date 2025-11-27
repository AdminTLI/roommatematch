import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'
import { sanitizeSearchInput, validateSearchInputLength } from '@/lib/utils/sanitize'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const supabase = await createAdminClient()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const verificationStatuses = searchParams.get('verification_statuses')?.split(',') || []
    const emailDomains = searchParams.get('email_domains')?.split(',') || []
    const accountStatuses = searchParams.get('account_statuses')?.split(',') || []
    const createdMonths = searchParams.get('created_months')?.split(',') || [] // Format: MM/YY
    const universityIds = searchParams.get('university_ids')?.split(',') || []
    const includeFilters = searchParams.get('include_filters') === 'true' // Return filter metadata

    // Build query - get university from user_academic (filled from questionnaire) instead of profiles
    // First get all profiles with users
    let query = supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        verification_status,
        created_at,
        users!inner(
          id,
          email,
          is_active,
          created_at
        )
      `)

    if (search) {
      // Sanitize and validate search input to prevent SQL injection
      if (!validateSearchInputLength(search, 100)) {
        return NextResponse.json({ error: 'Search query too long' }, { status: 400 })
      }
      const sanitizedSearch = sanitizeSearchInput(search)
      query = query.or(`first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,users.email.ilike.%${sanitizedSearch}%`)
    }

    if (verificationStatuses.length > 0) {
      query = query.in('verification_status', verificationStatuses)
    }

    if (accountStatuses.length > 0) {
      const activeStatuses = accountStatuses.filter(s => s === 'active')
      const suspendedStatuses = accountStatuses.filter(s => s === 'suspended')
      
      if (activeStatuses.length > 0 && suspendedStatuses.length > 0) {
        // Both selected - no filter needed (show all)
      } else if (activeStatuses.length > 0) {
        query = query.eq('users.is_active', true)
      } else if (suspendedStatuses.length > 0) {
        query = query.eq('users.is_active', false)
      }
    }

    // Get all profiles first (we'll filter by email domain and created date in memory)
    // Note: We fetch all profiles to extract filter metadata, but will limit results later
    const { data: profiles, error } = await query.order('created_at', { ascending: false })

    if (error) {
      safeLogger.error('[Admin Users] Failed to fetch users', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get user IDs to fetch academic data
    const userIds = (profiles || []).map((p: any) => p.user_id)
    
    // Fetch academic data (university from questionnaire)
    let academicData: any[] = []
    if (userIds.length > 0) {
      const { data } = await supabase
        .from('user_academic')
        .select(`
          user_id,
          university_id,
          universities(name)
        `)
        .in('user_id', userIds)
      
      academicData = data || []
    }

    // Create a map of user_id -> academic data
    const academicMap = new Map()
    academicData.forEach((academic: any) => {
      academicMap.set(academic.user_id, academic)
    })

    // Filter profiles in memory
    let filteredProfiles = profiles || []
    
    // Filter by email domain
    if (emailDomains.length > 0) {
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        const email = profile.users?.email || ''
        const domain = email.split('@')[1]?.toLowerCase() || ''
        return emailDomains.some(filterDomain => domain === filterDomain.toLowerCase())
      })
    }

    // Filter by created date (MM/YY)
    if (createdMonths.length > 0) {
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        const createdAt = profile.users?.created_at || profile.created_at
        if (!createdAt) return false
        
        const date = new Date(createdAt)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const monthYear = `${month}/${year}`
        
        return createdMonths.includes(monthYear)
      })
    }

    // Filter by university
    if (universityIds.length > 0) {
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        const academic = academicMap.get(profile.user_id)
        return academic && universityIds.includes(academic.university_id)
      })
    }

    // Transform the data to match the expected format
    // Limit to 1000 results for performance
    const limitedProfiles = filteredProfiles.slice(0, 1000)
    const users = limitedProfiles.map((profile: any) => {
      // Get university from user_academic (questionnaire data) if available
      const academic = academicMap.get(profile.user_id)
      const university = academic?.universities || null
      
      return {
        id: profile.id,
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.users?.email || 'N/A',
        verification_status: profile.verification_status,
        university_name: university?.name || 'N/A',
        university_id: academic?.university_id || null,
        is_active: profile.users?.is_active !== false, // Default to true if not explicitly false
        created_at: profile.users?.created_at || profile.created_at
      }
    })

    // Extract filter metadata if requested
    let filterMetadata: any = null
    if (includeFilters) {
      // Get all profiles for filter extraction (not filtered)
      const allProfiles = profiles || []
      
      // Extract unique email domains
      const emailDomainSet = new Set<string>()
      allProfiles.forEach((profile: any) => {
        const email = profile.users?.email || ''
        const domain = email.split('@')[1]?.toLowerCase()
        if (domain) {
          emailDomainSet.add(domain)
        }
      })
      const emailDomainsList = Array.from(emailDomainSet).sort()

      // Extract unique verification statuses
      const verificationStatusSet = new Set<string>()
      allProfiles.forEach((profile: any) => {
        if (profile.verification_status) {
          verificationStatusSet.add(profile.verification_status)
        }
      })
      const verificationStatusesList = Array.from(verificationStatusSet).sort()

      // Extract unique account statuses
      const accountStatusSet = new Set<string>()
      allProfiles.forEach((profile: any) => {
        const isActive = profile.users?.is_active !== false
        accountStatusSet.add(isActive ? 'active' : 'suspended')
      })
      const accountStatusesList = Array.from(accountStatusSet).sort()

      // Extract unique created months (MM/YY)
      const createdMonthSet = new Set<string>()
      allProfiles.forEach((profile: any) => {
        const createdAt = profile.users?.created_at || profile.created_at
        if (createdAt) {
          const date = new Date(createdAt)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = String(date.getFullYear()).slice(-2)
          createdMonthSet.add(`${month}/${year}`)
        }
      })
      const createdMonthsList = Array.from(createdMonthSet).sort((a, b) => {
        // Sort by year then month (descending - newest first)
        const [monthA, yearA] = a.split('/')
        const [monthB, yearB] = b.split('/')
        const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1)
        const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1)
        return dateB.getTime() - dateA.getTime()
      })

      // Extract unique universities
      const universityMap = new Map<string, { id: string; name: string }>()
      academicData.forEach((academic: any) => {
        if (academic.university_id && academic.universities?.name) {
          universityMap.set(academic.university_id, {
            id: academic.university_id,
            name: academic.universities.name
          })
        }
      })
      const universitiesList = Array.from(universityMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      )

      filterMetadata = {
        emailDomains: emailDomainsList,
        verificationStatuses: verificationStatusesList,
        accountStatuses: accountStatusesList,
        createdMonths: createdMonthsList,
        universities: universitiesList
      }
    }

    return NextResponse.json({ 
      users,
      filters: filterMetadata
    })
  } catch (error) {
    safeLogger.error('[Admin Users] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const { user } = adminCheck
    const body = await request.json()
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const admin = await createAdminClient()

    switch (action) {
      case 'suspend':
        const { error: suspendError } = await admin
          .from('users')
          .update({ is_active: false })
          .in('id', userIds)
        
        if (suspendError) {
          safeLogger.error('[Admin Users] Failed to suspend users', suspendError)
          return NextResponse.json({ error: 'Failed to suspend users' }, { status: 500 })
        }
        
        await logAdminAction(user!.id, 'suspend_users', 'user', null, { userIds })
        break
      
      case 'activate':
        const { error: activateError } = await admin
          .from('users')
          .update({ is_active: true })
          .in('id', userIds)
        
        if (activateError) {
          safeLogger.error('[Admin Users] Failed to activate users', activateError)
          return NextResponse.json({ error: 'Failed to activate users' }, { status: 500 })
        }
        
        await logAdminAction(user!.id, 'activate_users', 'user', null, { userIds })
        break
      
      case 'verify':
        const { error: verifyError } = await admin
          .from('profiles')
          .update({ verification_status: 'verified' })
          .in('user_id', userIds)
        
        if (verifyError) {
          safeLogger.error('[Admin Users] Failed to verify users', verifyError)
          return NextResponse.json({ error: 'Failed to verify users' }, { status: 500 })
        }
        
        await logAdminAction(user!.id, 'verify_users', 'user', null, { userIds })
        break
      
      case 'unverify':
        const { error: unverifyError } = await admin
          .from('profiles')
          .update({ verification_status: 'unverified' })
          .in('user_id', userIds)
        
        if (unverifyError) {
          safeLogger.error('[Admin Users] Failed to unverify users', unverifyError)
          return NextResponse.json({ error: 'Failed to unverify users' }, { status: 500 })
        }
        
        await logAdminAction(user!.id, 'unverify_users', 'user', null, { userIds })
        break
      
      case 'delete':
        // Delete user - this will cascade delete profile, responses, etc. due to ON DELETE CASCADE
        // First delete from auth.users (requires admin client)
        const deleteErrors: string[] = []
        for (const userId of userIds) {
          const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
          if (deleteError) {
            safeLogger.error('[Admin Users] Failed to delete user', { userId, error: deleteError })
            deleteErrors.push(`Failed to delete user ${userId}: ${deleteError.message}`)
          }
        }
        
        if (deleteErrors.length > 0) {
          return NextResponse.json(
            { error: deleteErrors.join('; ') },
            { status: 500 }
          )
        }
        
        await logAdminAction(user!.id, 'delete_users', 'user', null, { userIds })
        break
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Admin Users] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

