import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

interface HealthCheckResult {
  status: 'online' | 'offline' | 'degraded'
  responseTime: number
  error?: string
  lastCheck: string
  details?: Record<string, any>
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    
    // Test database connection with a simple query
    const { error, data } = await adminClient
      .from('users')
      .select('id')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        status: 'offline',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }

    // Check response time thresholds
    let status: 'online' | 'degraded' = 'online'
    if (responseTime > 1000) {
      status = 'degraded'
    }

    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        querySuccessful: true,
        recordCount: data?.length || 0
      }
    }
  } catch (error: any) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: error.message || 'Database connection failed',
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkAuthentication(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    const supabase = await createClient()
    
    // Test authentication service by getting current user (authenticated via server)
    const { error, data } = await supabase.auth.getUser()
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        status: 'offline',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }

    let status: 'online' | 'degraded' = 'online'
    if (responseTime > 500) {
      status = 'degraded'
    }

    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        authServiceAvailable: true,
        userAuthenticated: !!data.user
      }
    }
  } catch (error: any) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: error.message || 'Authentication service unavailable',
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkMatchingEngine(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    
    // Test matching engine by checking if match_suggestions table is accessible
    // and if we can query match records
    const { error, data } = await adminClient
      .from('match_suggestions')
      .select('id, status')
      .limit(1)
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        status: 'offline',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }

    // Also check if match_records table exists and is accessible
    const { error: recordsError } = await adminClient
      .from('match_records')
      .select('id')
      .limit(1)

    let status: 'online' | 'degraded' = 'online'
    if (responseTime > 1000 || recordsError) {
      status = 'degraded'
    }

    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        suggestionsTableAccessible: !error,
        recordsTableAccessible: !recordsError,
        matchCount: data?.length || 0
      }
    }
  } catch (error: any) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: error.message || 'Matching engine unavailable',
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkFileStorage(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    
    // Test storage by checking if we can list buckets
    const { data: buckets, error } = await adminClient.storage.listBuckets()
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        status: 'offline',
        responseTime,
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }

    // Test access to verification-documents bucket if it exists
    const verificationBucket = buckets?.find(b => b.id === 'verification-documents')
    
    let bucketAccessible = false
    if (verificationBucket) {
      try {
        const { error: listError } = await adminClient.storage
          .from('verification-documents')
          .list('', { limit: 1 })
        bucketAccessible = !listError
      } catch {
        bucketAccessible = false
      }
    }

    let status: 'online' | 'degraded' = 'online'
    if (responseTime > 2000 || !bucketAccessible) {
      status = 'degraded'
    }

    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        bucketsAvailable: buckets?.length || 0,
        verificationBucketExists: !!verificationBucket,
        verificationBucketAccessible: bucketAccessible
      }
    }
  } catch (error: any) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: error.message || 'File storage unavailable',
      lastCheck: new Date().toISOString()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    // Run all health checks in parallel
    const healthCheckPromises = [
      checkDatabase(),
      checkAuthentication(),
      checkMatchingEngine(),
      checkFileStorage(),
    ]
    const [database, authentication, matchingEngine, fileStorage] = await Promise.all(healthCheckPromises)

    // Calculate overall system health
    const allChecks = [database, authentication, matchingEngine, fileStorage]
    const onlineCount = allChecks.filter(c => c.status === 'online').length
    const degradedCount = allChecks.filter(c => c.status === 'degraded').length
    const offlineCount = allChecks.filter(c => c.status === 'offline').length

    let overallStatus: 'online' | 'degraded' | 'offline' = 'online'
    if (offlineCount > 0) {
      overallStatus = 'offline'
    } else if (degradedCount > 0 || onlineCount < allChecks.length) {
      overallStatus = 'degraded'
    }

    return NextResponse.json({
      overall: {
        status: overallStatus,
        lastCheck: new Date().toISOString(),
        summary: {
          online: onlineCount,
          degraded: degradedCount,
          offline: offlineCount,
          total: allChecks.length
        }
      },
      services: {
        database,
        authentication,
        matchingEngine,
        fileStorage
      }
    })
  } catch (error) {
    safeLogger.error('[Admin] System health check error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

