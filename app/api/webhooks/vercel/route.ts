import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/webhooks/vercel
 * Webhook endpoint for Vercel deployments
 * Automatically creates update entries when deployments complete
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET
    const authHeader = request.headers.get('authorization')
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      safeLogger.warn('[Vercel Webhook] Unauthorized request - invalid secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    safeLogger.info('[Vercel Webhook] Received deployment event', {
      type: body.type,
      deploymentId: body.deployment?.id,
      state: body.deployment?.state
    })

    // Only process successful production deployments
    if (body.type !== 'deployment' || body.deployment?.state !== 'READY') {
      safeLogger.info('[Vercel Webhook] Skipping - not a ready deployment', {
        type: body.type,
        state: body.deployment?.state
      })
      return NextResponse.json({ message: 'Skipped' }, { status: 200 })
    }

    // Only process production deployments
    const target = body.deployment?.target
    if (target !== 'production') {
      safeLogger.info('[Vercel Webhook] Skipping - not production deployment', { target })
      return NextResponse.json({ message: 'Skipped - not production' }, { status: 200 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      safeLogger.error('[Vercel Webhook] Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract version information
    const deployment = body.deployment
    const commitMessage = deployment.meta?.githubCommitMessage || ''
    const commitSha = deployment.meta?.githubCommitSha || deployment.url?.split('/').pop() || ''
    const branch = deployment.meta?.githubCommitRef || 'main'
    
    // Try to extract version from commit message or use auto-increment
    let version = extractVersionFromCommit(commitMessage)
    
    if (!version) {
      // Auto-increment version based on latest in database
      version = await getNextVersion(supabase)
    }

    // Extract changes from commit message or use default
    const changes = extractChangesFromCommit(commitMessage, deployment)
    
    // Determine change type
    const changeType = determineChangeType(commitMessage, changes)

    // Check if this version already exists
    const { data: existing } = await supabase
      .from('updates')
      .select('id')
      .eq('version', version)
      .maybeSingle()

    if (existing) {
      safeLogger.info('[Vercel Webhook] Version already exists', { version })
      return NextResponse.json({ 
        message: 'Version already exists',
        version 
      }, { status: 200 })
    }

    // Create update entry
    const releaseDate = new Date().toISOString().split('T')[0] // Today's date
    
    const { error: insertError } = await supabase
      .from('updates')
      .insert({
        version,
        release_date: releaseDate,
        change_type: changeType,
        changes: changes.length > 0 ? changes : [
          `Deployment ${deployment.id?.substring(0, 8) || 'unknown'}`,
          `Branch: ${branch}`,
          `Commit: ${commitSha.substring(0, 7)}`
        ]
      })

    if (insertError) {
      safeLogger.error('[Vercel Webhook] Failed to insert update', { 
        error: insertError,
        version 
      })
      return NextResponse.json(
        { error: 'Failed to create update entry' },
        { status: 500 }
      )
    }

    safeLogger.info('[Vercel Webhook] Created update entry', {
      version,
      changeType,
      changesCount: changes.length
    })

    return NextResponse.json({
      success: true,
      version,
      changeType,
      changesCount: changes.length
    }, { status: 200 })

  } catch (error) {
    safeLogger.error('[Vercel Webhook] Error processing webhook', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Extract version from commit message (e.g., "v1.2.3" or "V1.2.3")
 */
function extractVersionFromCommit(message: string): string | null {
  if (!message) return null
  
  // Look for version patterns: v1.2.3, V1.2.3, version 1.2.3, etc.
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

  // Split commit message by newlines or common separators
  const lines = message
    .split(/\n|;|•/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):/i))

  // Clean up and format changes
  for (const line of lines) {
    // Remove common prefixes
    let cleaned = line
      .replace(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):\s*/i, '')
      .replace(/^[-*•]\s*/, '')
      .trim()

    // Skip version strings and very short lines
    if (cleaned.length < 5 || cleaned.match(/^[vV]?\d+\.\d+\.\d+/)) {
      continue
    }

    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      changes.push(cleaned)
    }
  }

  // If no meaningful changes extracted, use commit message as single change
  if (changes.length === 0 && message.length > 10) {
    const cleaned = message
      .replace(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):\s*/i, '')
      .trim()
    if (cleaned.length > 0) {
      changes.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1))
    }
  }

  return changes.slice(0, 10) // Limit to 10 changes
}

/**
 * Determine change type from commit message
 */
function determineChangeType(message: string, changes: string[]): 'major' | 'minor' | 'patch' {
  const lowerMessage = message.toLowerCase()
  const allText = [message, ...changes].join(' ').toLowerCase()

  // Major changes
  const majorKeywords = ['security', 'cve', 'breaking', 'major', 'migration', 'platform']
  if (majorKeywords.some(keyword => allText.includes(keyword))) {
    return 'major'
  }

  // Minor changes (features, new functionality)
  const minorKeywords = ['feat', 'feature', 'add', 'implement', 'new', 'integrate', 'optimize', 'performance']
  if (minorKeywords.some(keyword => allText.includes(keyword))) {
    return 'minor'
  }

  // Default to patch
  return 'patch'
}

/**
 * Get next version by auto-incrementing from latest version in database
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
      // No existing versions, start at V1.0.0
      return 'V1.0.0'
    }

    // Parse version string (e.g., "V14.0.0" -> major=14, minor=0, patch=0)
    const versionMatch = latest.version.match(/V?(\d+)\.(\d+)\.(\d+)/)
    if (!versionMatch) {
      // Can't parse, start fresh
      return 'V1.0.0'
    }

    const major = parseInt(versionMatch[1], 10)
    const minor = parseInt(versionMatch[2], 10)
    const patch = parseInt(versionMatch[3], 10)

    // Increment patch version
    return `V${major}.${minor}.${patch + 1}`
  } catch (error) {
    safeLogger.error('[Vercel Webhook] Error getting next version', { error })
    // Fallback: use timestamp-based version
    const now = new Date()
    return `V${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`
  }
}

