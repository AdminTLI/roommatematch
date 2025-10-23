#!/usr/bin/env tsx

/**
 * Demo Data Scanner
 * 
 * Scans the codebase for suspicious demo/fake data patterns.
 * Fails CI if violations are found (exit code 1).
 * 
 * Allowlist: demo@account.com (the whitelisted demo user)
 */

import * as fs from 'fs'
import * as path from 'path'

// Patterns to detect demo data
const SUSPICIOUS_PATTERNS = [
  { pattern: /lorem ipsum/gi, name: 'Lorem ipsum placeholder text' },
  { pattern: /john doe|jane doe/gi, name: 'Fake names (John/Jane Doe)' },
  { pattern: /\bsample user\b/gi, name: 'Sample user references' },
  { pattern: /\btest user\b/gi, name: 'Test user references' },
  { pattern: /\bdemo user\b/gi, name: 'Demo user references' },
  { pattern: /example@(?!example\.com\b)/gi, name: 'Example email addresses' },
  { pattern: /picsum\.photos/gi, name: 'Lorem Picsum image URLs' },
  { pattern: /placekitten/gi, name: 'Placekitten image URLs' },
  { pattern: /unsplash\.com\/random/gi, name: 'Random Unsplash images' },
  { pattern: /acme corp/gi, name: 'ACME Corporation references' },
  { pattern: /\+1[\s-]?555[\s-]?\d{4}/g, name: 'Fake phone numbers (555)' },
  { pattern: /0000[-\s]?0000/g, name: 'Fake phone numbers (0000)' },
  { pattern: /fake chat|demo chat/gi, name: 'Fake chat references' },
  { pattern: /seed data|seeded data/gi, name: 'Seed data comments' },
  { pattern: /student\d+@student\./gi, name: 'Fake student emails' },
  { pattern: /test\.student\d+@/gi, name: 'Test student emails' }
]

// Exact strings that are allowed (case-insensitive)
const ALLOWLIST = [
  'demo@account.com', // The whitelisted demo user
  'example.com', // Common in documentation
  'example@example.com' // Common in examples
]

// Directories to scan
const SCAN_DIRS = [
  'app',
  'components',
  'lib',
  'types'
]

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '__tests__',
  'cypress',
  'stories',
  'devonly'
]

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

interface Violation {
  file: string
  line: number
  column: number
  pattern: string
  match: string
  context: string
}

const violations: Violation[] = []

function isAllowlisted(match: string): boolean {
  const lowerMatch = match.toLowerCase()
  return ALLOWLIST.some(allowed => lowerMatch.includes(allowed.toLowerCase()))
}

function shouldSkipDirectory(dir: string): boolean {
  const dirName = path.basename(dir)
  return SKIP_DIRS.some(skip => dirName === skip || dirName.startsWith('.'))
}

function shouldScanFile(file: string): boolean {
  const ext = path.extname(file)
  return SCAN_EXTENSIONS.includes(ext)
}

function scanFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]

      for (const { pattern, name } of SUSPICIOUS_PATTERNS) {
        const matches = line.matchAll(pattern)

        for (const match of matches) {
          const matchText = match[0]
          
          // Skip if allowlisted
          if (isAllowlisted(matchText)) {
            continue
          }

          // Get context (30 chars before and after)
          const matchIndex = match.index || 0
          const contextStart = Math.max(0, matchIndex - 30)
          const contextEnd = Math.min(line.length, matchIndex + matchText.length + 30)
          const context = line.substring(contextStart, contextEnd)

          violations.push({
            file: filePath,
            line: lineNum + 1,
            column: matchIndex + 1,
            pattern: name,
            match: matchText,
            context: context.trim()
          })
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not scan ${filePath}:`, error)
  }
}

function scanDirectory(dir: string): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (!shouldSkipDirectory(fullPath)) {
          scanDirectory(fullPath)
        }
      } else if (entry.isFile()) {
        if (shouldScanFile(fullPath)) {
          scanFile(fullPath)
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not scan directory ${dir}:`, error)
  }
}

function main() {
  console.log('🔍 Scanning codebase for demo data...\n')
  console.log('📁 Scanning directories:', SCAN_DIRS.join(', '))
  console.log('✅ Allowlist:', ALLOWLIST.join(', '))
  console.log('')

  const startTime = Date.now()

  // Scan each directory
  for (const dir of SCAN_DIRS) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      scanDirectory(fullPath)
    } else {
      console.warn(`⚠️  Directory not found: ${dir}`)
    }
  }

  const duration = Date.now() - startTime

  // Report results
  console.log('='.repeat(70))
  console.log(`\n📊 Scan completed in ${duration}ms\n`)

  if (violations.length === 0) {
    console.log('✅ No demo data violations found!')
    console.log('\n💡 Your codebase is clean and ready for production.')
    process.exit(0)
  } else {
    console.log(`❌ Found ${violations.length} violation(s):\n`)

    // Group violations by file
    const violationsByFile = violations.reduce((acc, v) => {
      if (!acc[v.file]) acc[v.file] = []
      acc[v.file].push(v)
      return acc
    }, {} as Record<string, Violation[]>)

    for (const [file, fileViolations] of Object.entries(violationsByFile)) {
      console.log(`📄 ${file}`)
      for (const v of fileViolations) {
        console.log(`   Line ${v.line}:${v.column} - ${v.pattern}`)
        console.log(`   Match: "${v.match}"`)
        console.log(`   Context: ...${v.context}...`)
        console.log('')
      }
    }

    console.log('='.repeat(70))
    console.log('\n❌ Demo data detected! Please remove or allowlist these items.')
    console.log('\n💡 To fix:')
    console.log('   1. Remove hard-coded demo data')
    console.log('   2. Replace with database queries or empty states')
    console.log('   3. Move test data to __tests__ or devonly/')
    console.log('   4. Add legitimate exceptions to ALLOWLIST in this script')
    console.log('')

    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { scanDirectory, violations }

