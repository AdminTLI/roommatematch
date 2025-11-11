#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

/**
 * Test the universities API endpoint
 * This simulates what the frontend does
 */

async function testUniversitiesAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000'
  
  console.log(`🔍 Testing universities API at: ${baseUrl}/api/universities\n`)
  
  try {
    // Test fetching cities
    console.log('1. Testing GET /api/universities (cities list)...')
    const response = await fetch(`${baseUrl}/api/universities`)
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   ❌ Error: ${errorText}`)
      return
    }
    
    const data = await response.json()
    console.log(`   ✅ Response:`, JSON.stringify(data, null, 2))
    
    if (data.cities && Array.isArray(data.cities)) {
      console.log(`   ✅ Cities count: ${data.cities.length}`)
      if (data.cities.length > 0) {
        console.log(`   ✅ First 5 cities:`, data.cities.slice(0, 5))
      } else {
        console.log(`   ⚠️  No cities in response!`)
      }
    } else {
      console.error(`   ❌ Invalid response format. Expected { cities: string[] }`)
    }
    
    // Test fetching universities for a specific city
    if (data.cities && data.cities.length > 0) {
      const testCity = data.cities[0]
      console.log(`\n2. Testing GET /api/universities?city=${testCity}...`)
      
      const cityResponse = await fetch(`${baseUrl}/api/universities?city=${encodeURIComponent(testCity)}`)
      console.log(`   Status: ${cityResponse.status} ${cityResponse.statusText}`)
      
      if (cityResponse.ok) {
        const cityData = await cityResponse.json()
        console.log(`   ✅ Universities in ${testCity}: ${cityData.universities?.length || 0}`)
        if (cityData.universities && cityData.universities.length > 0) {
          console.log(`   ✅ First university:`, cityData.universities[0])
        }
      } else {
        const errorText = await cityResponse.text()
        console.error(`   ❌ Error: ${errorText}`)
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error testing API:', error.message)
    console.error('   Make sure the development server is running or provide VERCEL_URL')
  }
}

async function main() {
  await testUniversitiesAPI()
}

main()

