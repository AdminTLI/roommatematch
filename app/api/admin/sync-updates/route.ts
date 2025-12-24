import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/admin/sync-updates
 * Admin endpoint to manually sync recent deployments and create update entries
 * Can fetch from Vercel API or accept manual deployment data
 */
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json().catch(() => ({}))
    
    // Audit log admin action
    await logAdminAction(user!.id, 'sync_updates', null, null, {
      action: 'Manually syncing deployment updates',
      role: adminRecord!.role,
      source: body.source || 'manual'
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      safeLogger.error('[Sync Updates] Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    // Option 1: Fetch from Vercel API if token is provided
    if (body.fetchFromVercel && process.env.VERCEL_TOKEN) {
      try {
        const vercelToken = process.env.VERCEL_TOKEN
        const teamId = process.env.VERCEL_TEAM_ID
        const projectId = process.env.VERCEL_PROJECT_ID || body.projectId

        if (!projectId) {
          return NextResponse.json(
            { error: 'Vercel project ID required' },
            { status: 400 }
          )
        }

        // Fetch recent deployments from Vercel API
        const vercelUrl = teamId 
          ? `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=20&target=production`
          : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=20&target=production`

        const vercelResponse = await fetch(vercelUrl, {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!vercelResponse.ok) {
          const errorText = await vercelResponse.text()
          safeLogger.error('[Sync Updates] Vercel API error', { 
            status: vercelResponse.status,
            error: errorText 
          })
          return NextResponse.json(
            { error: 'Failed to fetch from Vercel API', details: errorText },
            { status: vercelResponse.status }
          )
        }

        const vercelData = await vercelResponse.json()
        const deployments = vercelData.deployments || []

        const results = await processDeployments(deployments, supabase)
        
        return NextResponse.json({
          success: true,
          fetched: deployments.length,
          processed: results.processed,
          created: results.created,
          updated: results.updated,
          skipped: results.skipped
        })

      } catch (error) {
        safeLogger.error('[Sync Updates] Error fetching from Vercel', { error })
        return NextResponse.json(
          { error: 'Failed to fetch from Vercel API', details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    }

    // Option 2: Process manual deployment data
    if (body.deployments && Array.isArray(body.deployments)) {
      const results = await processDeployments(body.deployments, supabase)
      
      return NextResponse.json({
        success: true,
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped
      })
    }

    // Option 3: Create a single update entry manually
    if (body.version && body.changes) {
      const releaseDate = body.release_date || new Date().toISOString().split('T')[0]
      const changeType = body.change_type || 'patch'
      const changes = Array.isArray(body.changes) ? body.changes : [body.changes]

      // Check if update for today exists
      const { data: existingToday } = await supabase
        .from('updates')
        .select('id, changes, version, change_type')
        .eq('release_date', releaseDate)
        .maybeSingle()

      if (existingToday) {
        // Append to existing
        const existingChanges = Array.isArray(existingToday.changes) 
          ? existingToday.changes 
          : (typeof existingToday.changes === 'string' ? JSON.parse(existingToday.changes) : [])
        
        const mergedChanges = [...existingChanges]
        for (const change of changes) {
          if (!mergedChanges.includes(change)) {
            mergedChanges.push(change)
          }
        }

        const { error: updateError } = await supabase
          .from('updates')
          .update({
            changes: mergedChanges,
            change_type: getMostSignificantChangeType(existingToday.change_type || 'patch', changeType)
          })
          .eq('id', existingToday.id)

        if (updateError) {
          safeLogger.error('[Sync Updates] Failed to update', { error: updateError })
          return NextResponse.json(
            { error: 'Failed to update existing entry' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          action: 'updated',
          version: existingToday.version,
          changesCount: mergedChanges.length
        })
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('updates')
          .insert({
            version: body.version,
            release_date: releaseDate,
            change_type: changeType,
            changes: changes
          })

        if (insertError) {
          safeLogger.error('[Sync Updates] Failed to create', { error: insertError })
          return NextResponse.json(
            { error: 'Failed to create update entry' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          action: 'created',
          version: body.version,
          changesCount: changes.length
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide either fetchFromVercel, deployments array, or version+changes' },
      { status: 400 }
    )

  } catch (error) {
    safeLogger.error('[Sync Updates] Error processing request', { error })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * Process deployments and create/update entries
 */
async function processDeployments(deployments: any[], supabase: any) {
  const results = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0
  }

  for (const deployment of deployments) {
    try {
      // Only process ready production deployments
      if (deployment.state !== 'READY' || deployment.target !== 'production') {
        results.skipped++
        continue
      }

      const commitMessage = deployment.meta?.githubCommitMessage || deployment.meta?.gitCommitMessage || ''
      const commitSha = deployment.meta?.githubCommitSha || deployment.meta?.gitCommitSha || deployment.url?.split('/').pop() || ''
      const branch = deployment.meta?.githubCommitRef || deployment.meta?.gitCommitRef || 'main'
      
      // Extract version
      let version = extractVersionFromCommit(commitMessage)
      if (!version) {
        version = await getNextVersion(supabase)
      }

      // Extract changes
      const changes = extractChangesFromCommit(commitMessage, deployment)
      const changeType = determineChangeType(commitMessage, changes)

      // Get deployment date (use created timestamp)
      const deploymentDate = deployment.createdAt 
        ? new Date(deployment.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      // Check if update for this day exists
      const { data: existingToday } = await supabase
        .from('updates')
        .select('id, changes, version, change_type')
        .eq('release_date', deploymentDate)
        .maybeSingle()

      const newChanges = changes.length > 0 ? changes : [
        `Deployment ${deployment.id?.substring(0, 8) || 'unknown'}`,
        `Branch: ${branch}`,
        `Commit: ${commitSha.substring(0, 7)}`
      ]

      if (existingToday) {
        // Append to existing
        let existingChanges: string[] = []
        if (Array.isArray(existingToday.changes)) {
          existingChanges = existingToday.changes
        } else if (typeof existingToday.changes === 'string') {
          try {
            const parsed = JSON.parse(existingToday.changes)
            existingChanges = Array.isArray(parsed) ? parsed : []
          } catch {
            existingChanges = []
          }
        }

        const mergedChanges = [...existingChanges]
        for (const change of newChanges) {
          if (!mergedChanges.includes(change)) {
            mergedChanges.push(change)
          }
        }

        const { error: updateError } = await supabase
          .from('updates')
          .update({
            changes: mergedChanges,
            change_type: getMostSignificantChangeType(existingToday.change_type || 'patch', changeType)
          })
          .eq('id', existingToday.id)

        if (!updateError) {
          results.updated++
        } else {
          results.skipped++
        }
      } else {
        // Check if version already exists
        const { data: existingVersion } = await supabase
          .from('updates')
          .select('id')
          .eq('version', version)
          .maybeSingle()

        if (existingVersion) {
          // Generate new version
          version = await getNextVersion(supabase)
        }

        // Create new
        const { error: insertError } = await supabase
          .from('updates')
          .insert({
            version,
            release_date: deploymentDate,
            change_type: changeType,
            changes: newChanges
          })

        if (!insertError) {
          results.created++
        } else {
          results.skipped++
        }
      }

      results.processed++
    } catch (error) {
      safeLogger.error('[Sync Updates] Error processing deployment', { 
        error, 
        deploymentId: deployment.id 
      })
      results.skipped++
    }
  }

  return results
}

/**
 * Extract version from commit message
 */
function extractVersionFromCommit(message: string): string | null {
  if (!message) return null
  
  const versionPatterns = [
    /[vV](\d+\.\d+\.\d+)/,
    /version\s+(\d+\.\d+\.\d+)/i,
    /release\s+(\d+\.\d+\.\d+)/i
  ]

  for (const pattern of versionPatterns) {
    const match = message.match(pattern)
    if (match) {
      return `V${match[1]}`
    }
  }

  return null
}

/**
 * Extract changes from commit message
 */
function extractChangesFromCommit(message: string, deployment: any): string[] {
  const changes: string[] = []
  
  if (!message) return changes

  const lines = message
    .split(/\n|;|•/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):/i))

  for (const line of lines) {
    let cleaned = line
      .replace(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):\s*/i, '')
      .replace(/^[-*•]\s*/, '')
      .trim()

    if (cleaned.length < 5 || cleaned.match(/^[vV]?\d+\.\d+\.\d+/)) {
      continue
    }

    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      changes.push(cleaned)
    }
  }

  if (changes.length === 0 && message.length > 10) {
    const cleaned = message
      .replace(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):\s*/i, '')
      .trim()
    if (cleaned.length > 0) {
      changes.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1))
    }
  }

  return changes.slice(0, 10)
}

/**
 * Determine change type
 */
function determineChangeType(message: string, changes: string[]): 'major' | 'minor' | 'patch' {
  const lowerMessage = message.toLowerCase()
  const allText = [message, ...changes].join(' ').toLowerCase()

  const majorKeywords = ['security', 'cve', 'breaking', 'major', 'migration', 'platform']
  if (majorKeywords.some(keyword => allText.includes(keyword))) {
    return 'major'
  }

  const minorKeywords = ['feat', 'feature', 'add', 'implement', 'new', 'integrate', 'optimize', 'performance']
  if (minorKeywords.some(keyword => allText.includes(keyword))) {
    return 'minor'
  }

  return 'patch'
}

/**
 * Get most significant change type
 */
function getMostSignificantChangeType(type1: string, type2: string): 'major' | 'minor' | 'patch' {
  if (type1 === 'major' || type2 === 'major') return 'major'
  if (type1 === 'minor' || type2 === 'minor') return 'minor'
  return 'patch'
}

/**
 * Get next version
 */
async function getNextVersion(supabase: any): Promise<string> {
  try {
    const { data: latest } = await supabase
      .from('updates')
      .select('version')
      .order('release_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest || !latest.version) {
      return 'V1.0.0'
    }

    const versionMatch = latest.version.match(/V?(\d+)\.(\d+)\.(\d+)/)
    if (!versionMatch) {
      return 'V1.0.0'
    }

    const major = parseInt(versionMatch[1], 10)
    const minor = parseInt(versionMatch[2], 10)
    const patch = parseInt(versionMatch[3], 10)

    return `V${major}.${minor}.${patch + 1}`
  } catch (error) {
    safeLogger.error('[Sync Updates] Error getting next version', { error })
    const now = new Date()
    return `V${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`
  }
}

