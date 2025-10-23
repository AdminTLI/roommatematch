// Saved Search by ID API
// DELETE /api/housing/saved-searches/[id] - delete saved search

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    
    // Verify ownership before deletion
    const { data: existingSearch, error: fetchError } = await supabase
      .from('saved_searches')
      .select('id, user_id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }
    
    if (existingSearch.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Delete the saved search
    const { error: deleteError } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Double-check ownership
    
    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
