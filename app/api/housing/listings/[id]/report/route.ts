// Report Listing API
// POST /api/housing/listings/[id]/report - submit report for a listing

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ReportSchema = z.object({
  reason: z.string().min(1).max(100),
  details: z.string().min(1).max(1000)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: listingId } = params
    const body = await request.json()
    const validatedData = ReportSchema.parse(body)
    
    // Verify listing exists
    const { data: listing, error: listingError } = await supabase
      .from('housing_listings')
      .select('id, title')
      .eq('id', listingId)
      .single()
    
    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    // Insert report
    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_listing_id: listingId, // Assuming we extend reports table
        reason: validatedData.reason,
        details: validatedData.details,
        status: 'open'
      })
    
    if (reportError) {
      console.error('Database error:', reportError)
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
    }
    
    // Return 202 Accepted (non-blocking)
    return NextResponse.json({ success: true, message: 'Report submitted successfully' }, { status: 202 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
