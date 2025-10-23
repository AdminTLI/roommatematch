// Saved Searches API
// GET /api/housing/saved-searches - list user's saved searches
// POST /api/housing/saved-searches - create new saved search

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { SavedSearch, SaveSearchRequest, SavedSearchesResponse } from '@/types/housing'
import crypto from 'crypto'

const SaveSearchSchema = z.object({
  name: z.string().min(1).max(255),
  filters: z.record(z.any()), // JSON object
  notifyEmail: z.boolean().default(true),
  notifyPush: z.boolean().default(false),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily')
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: savedSearches, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
    }
    
    const transformedSearches: SavedSearch[] = (savedSearches || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      filtersJson: item.filters_json,
      filtersHash: item.filters_hash,
      notifyEmail: item.notify_email,
      notifyPush: item.notify_push,
      frequency: item.frequency,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
    
    const response: SavedSearchesResponse = {
      items: transformedSearches,
      total: transformedSearches.length
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = SaveSearchSchema.parse(body)
    
    // Generate hash for deduplication
    const filtersString = JSON.stringify(validatedData.filters, Object.keys(validatedData.filters).sort())
    const filtersHash = crypto.createHash('sha256').update(filtersString).digest('hex')
    
    // Check if search with same filters already exists
    const { data: existingSearch } = await supabase
      .from('saved_searches')
      .select('id')
      .eq('user_id', user.id)
      .eq('filters_hash', filtersHash)
      .single()
    
    if (existingSearch) {
      return NextResponse.json({ error: 'Search with these filters already exists' }, { status: 409 })
    }
    
    // Create new saved search
    const { data: newSearch, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        filters_json: validatedData.filters,
        filters_hash: filtersHash,
        notify_email: validatedData.notifyEmail,
        notify_push: validatedData.notifyPush,
        frequency: validatedData.frequency
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 })
    }
    
    const response: SavedSearch = {
      id: newSearch.id,
      userId: newSearch.user_id,
      name: newSearch.name,
      filtersJson: newSearch.filters_json,
      filtersHash: newSearch.filters_hash,
      notifyEmail: newSearch.notify_email,
      notifyPush: newSearch.notify_push,
      frequency: newSearch.frequency,
      createdAt: newSearch.created_at,
      updatedAt: newSearch.updated_at
    }
    
    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
