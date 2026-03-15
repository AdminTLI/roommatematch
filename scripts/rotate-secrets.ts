#!/usr/bin/env tsx

/**
 * Secrets Rotation Script
 * 
 * Interactive script to rotate secrets and API keys.
 * 
 * Usage:
 *   pnpm tsx scripts/rotate-secrets.ts
 * 
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Current Supabase service role key (for verification)
 */

import { safeLogger } from '@/lib/utils/logger'
import * as readline from 'readline'

interface SecretRotation {
  name: string
  currentValue?: string
  newValue?: string
  rotated: boolean
  error?: string
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function rotateSecret(secretName: string): Promise<SecretRotation> {
  const rotation: SecretRotation = {
    name: secretName,
    rotated: false
  }

  try {
    console.log(`\n🔄 Rotating ${secretName}...`)

    // Generate new secret
    let newValue: string
    if (secretName.includes('SECRET') || secretName.includes('KEY')) {
      // Generate random hex string
      const crypto = await import('crypto')
      newValue = crypto.randomBytes(32).toString('hex')
      console.log(`✅ Generated new ${secretName}: ${newValue.substring(0, 8)}...`)
    } else {
      // Ask user for new value
      newValue = await question(`Enter new value for ${secretName}: `)
    }

    if (!newValue || newValue.trim() === '') {
      rotation.error = 'New value is required'
      return rotation
    }

    rotation.newValue = newValue

    // Verify new value
    const confirm = await question(`\n⚠️  Confirm rotation of ${secretName}? (yes/no): `)
    if (confirm.toLowerCase() !== 'yes') {
      rotation.error = 'Rotation cancelled by user'
      return rotation
    }

    // Instructions for manual update
    console.log(`\n📋 Manual Steps Required:`)
    console.log(`1. Update ${secretName} in Vercel dashboard:`)
    console.log(`   - Go to Project Settings → Environment Variables`)
    console.log(`   - Update ${secretName} = ${newValue}`)
    console.log(`2. Update local .env file:`)
    console.log(`   ${secretName}=${newValue}`)
    console.log(`3. Update CI/CD environment variables if applicable`)
    console.log(`4. Test functionality with new secret`)
    console.log(`5. After 24-48 hours, revoke old secret`)

    // Test new value if possible
    if (secretName === 'SUPABASE_SERVICE_ROLE_KEY') {
      console.log(`\n🧪 Testing new Supabase service role key...`)
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (supabaseUrl) {
        const testClient = createClient(supabaseUrl, newValue)
        const { error } = await testClient.from('users').select('id').limit(1)
        
        if (error) {
          rotation.error = `New key test failed: ${error.message}`
          console.log(`❌ Test failed: ${error.message}`)
          return rotation
        } else {
          console.log(`✅ New key test passed`)
        }
      }
    }

    rotation.rotated = true
    console.log(`\n✅ ${secretName} rotation prepared successfully`)
    
    return rotation
  } catch (error) {
    rotation.error = error instanceof Error ? error.message : 'Unknown error'
    safeLogger.error(`Error rotating ${secretName}`, { error })
    return rotation
  }
}

async function main() {
  console.log('🔐 Secrets Rotation Script')
  console.log('==========================')
  console.log('')

  const secrets = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'CRON_SECRET',
    'ADMIN_SHARED_SECRET',
    'VERIFF_API_KEY',
    'PERSONA_API_KEY',
    'ONFIDO_API_KEY',
    'MAILJET_API_KEY',
    'MAILJET_SECRET_KEY'
  ]

  console.log('Available secrets to rotate:')
  secrets.forEach((secret, index) => {
    console.log(`${index + 1}. ${secret}`)
  })
  console.log('0. Rotate all secrets')
  console.log('')

  const choice = await question('Select secret to rotate (0-7): ')
  const choiceNum = parseInt(choice)

  if (isNaN(choiceNum) || choiceNum < 0 || choiceNum > secrets.length) {
    console.log('❌ Invalid choice')
    process.exit(1)
  }

  const rotations: SecretRotation[] = []

  if (choiceNum === 0) {
    // Rotate all secrets
    console.log('\n🔄 Rotating all secrets...')
    for (const secret of secrets) {
      const rotation = await rotateSecret(secret)
      rotations.push(rotation)
      
      if (rotation.error) {
        console.log(`❌ Failed to rotate ${secret}: ${rotation.error}`)
      }
    }
  } else {
    // Rotate selected secret
    const secret = secrets[choiceNum - 1]
    const rotation = await rotateSecret(secret)
    rotations.push(rotation)
  }

  console.log('\n📊 Rotation Summary:')
  console.log('=' .repeat(80))
  
  for (const rotation of rotations) {
    if (rotation.rotated) {
      console.log(`✅ ${rotation.name}: Rotation prepared`)
    } else {
      console.log(`❌ ${rotation.name}: ${rotation.error || 'Not rotated'}`)
    }
  }

  console.log('\n⚠️  Important:')
  console.log('- Update environment variables in Vercel')
  console.log('- Update local .env files')
  console.log('- Test functionality with new secrets')
  console.log('- Revoke old secrets after 24-48 hours')
  console.log('- Document rotation in SECURITY_ROTATION.md')

  rl.close()
  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Rotation failed:', error)
    safeLogger.error('Secrets rotation failed', { error })
    process.exit(1)
  })
}

export { rotateSecret }

