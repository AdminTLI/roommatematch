#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const PROJECT_ROOT = process.cwd()
const ENV_LOCAL_PATH = path.join(PROJECT_ROOT, '.env.local')
const ENV_EXAMPLE_PATH = path.join(PROJECT_ROOT, 'env.example')
const LEGACY_ENV_EXAMPLE_PATH = path.join(PROJECT_ROOT, '.env.example')

function fileExists(p: string) {
  try {
    fs.accessSync(p, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function readText(p: string) {
  return fs.readFileSync(p, 'utf8')
}

function writeText(p: string, content: string) {
  fs.writeFileSync(p, content, 'utf8')
}

function hasKey(envText: string, key: string) {
  const re = new RegExp(`^\\s*${key}\\s*=`, 'm')
  return re.test(envText)
}

function normalizeNewlines(s: string) {
  return s.replace(/\r\n/g, '\n')
}

function ensureEndsWithNewline(s: string) {
  return s.endsWith('\n') ? s : s + '\n'
}

function appendKey(envText: string, key: string, value: string) {
  const next = ensureEndsWithNewline(normalizeNewlines(envText))
  return next + `${key}=${value}\n`
}

function generateSecretHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

function pickExampleFile() {
  if (fileExists(ENV_EXAMPLE_PATH)) return ENV_EXAMPLE_PATH
  if (fileExists(LEGACY_ENV_EXAMPLE_PATH)) return LEGACY_ENV_EXAMPLE_PATH
  return null
}

function main() {
  const examplePath = pickExampleFile()

  if (!fileExists(ENV_LOCAL_PATH)) {
    if (!examplePath) {
      console.error('❌ No env example file found (expected env.example or .env.example).')
      process.exit(1)
    }

    const example = readText(examplePath)
    writeText(ENV_LOCAL_PATH, ensureEndsWithNewline(normalizeNewlines(example)))
    console.log(`✅ Created .env.local from ${path.basename(examplePath)}`)
  }

  const current = readText(ENV_LOCAL_PATH)
  let updated = normalizeNewlines(current)
  let changed = false

  if (!hasKey(updated, 'CSRF_SECRET')) {
    updated = appendKey(
      updated,
      'CSRF_SECRET',
      generateSecretHex(32)
    )
    changed = true
    console.log('✅ Added CSRF_SECRET to .env.local')
  } else {
    console.log('ℹ️  CSRF_SECRET already present in .env.local')
  }

  if (changed) {
    writeText(ENV_LOCAL_PATH, ensureEndsWithNewline(updated))
  }

  console.log('Done.')
}

main()

