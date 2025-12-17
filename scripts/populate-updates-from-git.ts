#!/usr/bin/env tsx

/**
 * Populate Updates from Git History
 * Analyzes git commit history and creates versioned updates in the database
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import * as dotenv from 'dotenv'

// Load environment variables if .env.local exists
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface Commit {
  hash: string
  date: string
  message: string
}

type ChangeType = 'major' | 'minor' | 'patch'

interface UpdateData {
  version: string
  release_date: string
  change_type: ChangeType
  changes: string[]
}

/**
 * Parse git log to extract commits
 */
function getGitCommits(): Commit[] {
  try {
    const gitLog = execSync(
      'git log --oneline --date=short --pretty=format:"%h|%ad|%s" --all',
      { encoding: 'utf-8', cwd: process.cwd() }
    )

    return gitLog
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, date, ...messageParts] = line.split('|')
        return {
          hash: hash?.trim() || '',
          date: date?.trim() || '',
          message: messageParts.join('|').trim()
        }
      })
      .filter(commit => commit.hash && commit.date && commit.message)
  } catch (error) {
    console.error('❌ Error reading git log:', error)
    return []
  }
}

/**
 * Categorize a commit message to determine change type
 */
function categorizeChange(message: string): ChangeType {
  const lowerMessage = message.toLowerCase()

  // Major changes
  const majorKeywords = ['security', 'migration', 'breaking', 'major', 'platform', 'cve']
  if (majorKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'major'
  }

  // Minor changes (features, integrations, optimizations)
  const minorKeywords = ['feat', 'feature', 'integrate', 'add', 'implement', 'optimize', 'performance', 'new']
  if (minorKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'minor'
  }

  // Default to patch for fixes and improvements
  return 'patch'
}

/**
 * Group commits by date and generate updates
 */
function generateUpdates(commits: Commit[]): UpdateData[] {
  // Group commits by date
  const commitsByDate = new Map<string, Commit[]>()
  
  commits.forEach(commit => {
    const date = commit.date
    if (!commitsByDate.has(date)) {
      commitsByDate.set(date, [])
    }
    commitsByDate.get(date)!.push(commit)
  })

  // Sort dates (oldest first)
  const sortedDates = Array.from(commitsByDate.keys()).sort()

  // Generate versions starting from V1.0.0
  let major = 1
  let minor = 0
  let patch = 0
  const updates: UpdateData[] = []

  for (const date of sortedDates) {
    const dayCommits = commitsByDate.get(date) || []
    
    // Determine the highest change type for this day
    const changeTypes = dayCommits.map(c => categorizeChange(c.message))
    const hasMajor = changeTypes.includes('major')
    const hasMinor = changeTypes.includes('minor')
    
    // Increment version based on changes
    if (hasMajor) {
      major++
      minor = 0
      patch = 0
    } else if (hasMinor) {
      minor++
      patch = 0
    } else {
      patch++
    }

    const version = `V${major}.${minor}.${patch}`
    const changeType: ChangeType = hasMajor ? 'major' : hasMinor ? 'minor' : 'patch'

    // Format commit messages as bullet points
    const changes = dayCommits.map(commit => {
      // Clean up commit message
      let message = commit.message
      
      // Remove common prefixes
      message = message.replace(/^(feat|fix|chore|refactor|style|docs|test|perf|ci|build|revert):\s*/i, '')
      
      // Capitalize first letter
      if (message.length > 0) {
        message = message.charAt(0).toUpperCase() + message.slice(1)
      }
      
      return message
    })

    // Only create update if there are meaningful changes
    if (changes.length > 0) {
      updates.push({
        version,
        release_date: date,
        change_type: changeType,
        changes
      })
    }
  }

  return updates.reverse() // Most recent first
}

/**
 * Insert updates into database
 */
async function insertUpdates(updates: UpdateData[]): Promise<void> {
  console.log(`\n📝 Inserting ${updates.length} updates into database...`)

  for (const update of updates) {
    try {
      // Check if version already exists
      const { data: existing } = await supabase
        .from('updates')
        .select('id')
        .eq('version', update.version)
        .single()

      if (existing) {
        console.log(`   ⏭️  Skipping ${update.version} (already exists)`)
        continue
      }

      // Insert new update
      const { error } = await supabase
        .from('updates')
        .insert({
          version: update.version,
          release_date: update.release_date,
          change_type: update.change_type,
          changes: update.changes
        })

      if (error) {
        console.error(`   ❌ Error inserting ${update.version}:`, error.message)
      } else {
        console.log(`   ✅ Inserted ${update.version} (${update.release_date}) - ${update.changes.length} changes`)
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${update.version}:`, error)
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting updates population from git history...\n')

  // Get commits from git
  console.log('📖 Reading git commit history...')
  const commits = getGitCommits()
  console.log(`   Found ${commits.length} commits\n`)

  if (commits.length === 0) {
    console.log('⚠️  No commits found. Make sure you are in a git repository.')
    process.exit(1)
  }

  // Generate updates
  console.log('🔢 Generating versioned updates...')
  const updates = generateUpdates(commits)
  console.log(`   Generated ${updates.length} updates\n`)

  // Display summary
  console.log('📊 Summary:')
  const byType = {
    major: updates.filter(u => u.change_type === 'major').length,
    minor: updates.filter(u => u.change_type === 'minor').length,
    patch: updates.filter(u => u.change_type === 'patch').length
  }
  console.log(`   Major: ${byType.major}`)
  console.log(`   Minor: ${byType.minor}`)
  console.log(`   Patch: ${byType.patch}`)
  console.log(`   Latest: ${updates[0]?.version} (${updates[0]?.release_date})`)

  // Insert into database
  await insertUpdates(updates)

  console.log('\n✅ Done!')
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
}

