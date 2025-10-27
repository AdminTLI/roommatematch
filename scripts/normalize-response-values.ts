#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ResponseRecord {
  id: string
  user_id: string
  question_key: string
  value: any
}

async function normalizeResponseValues(): Promise<void> {
  console.log('🔍 Fetching all responses to normalize values...')
  
  // Fetch all responses
  const { data: responses, error: fetchError } = await supabase
    .from('responses')
    .select('*')

  if (fetchError) {
    console.error('Error fetching responses:', fetchError)
    process.exit(1)
  }

  console.log(`Found ${responses?.length || 0} responses to check`)

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const response of responses || []) {
    // Check if value is a string that needs parsing
    if (typeof response.value === 'string') {
      try {
        // Try to parse the string as JSON
        const parsed = JSON.parse(response.value)
        
        // Update the response with the parsed value
        const { error: updateError } = await supabase
          .from('responses')
          .update({ value: parsed })
          .eq('id', response.id)

        if (updateError) {
          console.error(`Failed to update response ${response.id}:`, updateError)
          errorCount++
        } else {
          console.log(`✅ Updated response ${response.id} (${response.question_key})`)
          updatedCount++
        }
      } catch (parseError) {
        // String is not valid JSON, skip it
        console.log(`⏭️  Skipped response ${response.id} (${response.question_key}) - not parseable JSON`)
        skippedCount++
      }
    } else {
      // Already valid JSON, skip
      skippedCount++
    }
  }

  console.log('\n📊 Normalization Summary:')
  console.log(`Total responses processed: ${responses?.length || 0}`)
  console.log(`Successfully updated: ${updatedCount}`)
  console.log(`Skipped (already valid): ${skippedCount}`)
  console.log(`Errors: ${errorCount}`)

  if (errorCount > 0) {
    console.log('\n❌ Some responses failed to update. Check the logs above.')
  } else {
    console.log('\n✅ All responses normalized successfully!')
  }
}

async function main() {
  try {
    await normalizeResponseValues()
  } catch (error) {
    console.error('Normalization failed:', error)
    process.exit(1)
  }
}

main()
