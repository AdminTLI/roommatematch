// Asynchronous Video/Audio Intros System Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  UserIntroRecording,
  IntroHighlight,
  IntroRecordingInteraction,
  IntroPlaylist,
  IntroRecordingComment,
  IntroRecordingAnalytics,
  IntroRecordingTemplate,
  UserIntroStats,
  RecordingInsights,
  CreateRecordingData,
  UpdateRecordingData,
  CreatePlaylistData,
  CreateCommentData,
  CreateTemplateData
} from './types'
import { 
  RECORDING_TYPE_CONFIG, 
  MODERATION_STATUS_CONFIG, 
  HIGHLIGHT_TYPE_CONFIG,
  PLAYLIST_TYPE_CONFIG,
  TEMPLATE_TYPE_CONFIG,
  RECORDING_LIMITS,
  AI_THRESHOLDS
} from './types'

const supabase = createClient()

// Recording management functions
export async function createIntroRecording(data: CreateRecordingData): Promise<UserIntroRecording | null> {
  try {
    const { data: recording, error } = await supabase.rpc('create_intro_recording', {
      p_user_id: data.user_id,
      p_recording_type: data.recording_type,
      p_file_url: data.file_url,
      p_duration_seconds: data.duration_seconds,
      p_mime_type: data.mime_type,
      p_title: data.title || null,
      p_description: data.description || null
    })

    if (error) {
      console.error('Error creating intro recording:', error)
      return null
    }

    return recording
  } catch (error) {
    console.error('Error creating intro recording:', error)
    return null
  }
}

export async function getUserIntroRecordings(
  userId?: string,
  recordingType?: string,
  isPublic?: boolean
): Promise<UserIntroRecording[]> {
  try {
    let query = supabase
      .from('user_intro_recordings')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (recordingType) {
      query = query.eq('recording_type', recordingType)
    }

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    const { data: recordings, error } = await query

    if (error) {
      console.error('Error fetching intro recordings:', error)
      return []
    }

    return recordings || []
  } catch (error) {
    console.error('Error fetching intro recordings:', error)
    return []
  }
}

export async function getIntroRecording(recordingId: string): Promise<UserIntroRecording | null> {
  try {
    const { data: recording, error } = await supabase
      .from('user_intro_recordings')
      .select('*')
      .eq('id', recordingId)
      .single()

    if (error) {
      console.error('Error fetching intro recording:', error)
      return null
    }

    return recording
  } catch (error) {
    console.error('Error fetching intro recording:', error)
    return null
  }
}

export async function updateIntroRecording(
  recordingId: string, 
  updates: UpdateRecordingData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_intro_recordings')
      .update(updates)
      .eq('id', recordingId)

    if (error) {
      console.error('Error updating intro recording:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating intro recording:', error)
    return false
  }
}

export async function deleteIntroRecording(recordingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_intro_recordings')
      .delete()
      .eq('id', recordingId)

    if (error) {
      console.error('Error deleting intro recording:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting intro recording:', error)
    return false
  }
}

// Moderation functions
export async function approveIntroRecording(
  recordingId: string,
  approvedBy: string,
  moderationNotes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('approve_intro_recording', {
      p_recording_id: recordingId,
      p_approved_by: approvedBy,
      p_moderation_notes: moderationNotes || null
    })

    if (error) {
      console.error('Error approving intro recording:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error approving intro recording:', error)
    return false
  }
}

export async function rejectIntroRecording(
  recordingId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_intro_recordings')
      .update({
        moderation_status: 'rejected',
        moderation_notes: reason,
        status: 'failed'
      })
      .eq('id', recordingId)

    if (error) {
      console.error('Error rejecting intro recording:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error rejecting intro recording:', error)
    return false
  }
}

// Interaction functions
export async function recordIntroInteraction(
  recordingId: string,
  viewerId: string,
  interactionType: string,
  viewDurationSeconds?: number,
  viewCompletionPercentage?: number
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('record_intro_interaction', {
      p_recording_id: recordingId,
      p_viewer_id: viewerId,
      p_interaction_type: interactionType,
      p_view_duration_seconds: viewDurationSeconds || null,
      p_view_completion_percentage: viewCompletionPercentage || null
    })

    if (error) {
      console.error('Error recording interaction:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error recording interaction:', error)
    return false
  }
}

export async function getIntroRecordingInteractions(
  recordingId: string,
  interactionType?: string
): Promise<IntroRecordingInteraction[]> {
  try {
    let query = supabase
      .from('intro_recording_interactions')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: false })

    if (interactionType) {
      query = query.eq('interaction_type', interactionType)
    }

    const { data: interactions, error } = await query

    if (error) {
      console.error('Error fetching recording interactions:', error)
      return []
    }

    return interactions || []
  } catch (error) {
    console.error('Error fetching recording interactions:', error)
    return []
  }
}

// Highlight functions
export async function getIntroHighlights(recordingId: string): Promise<IntroHighlight[]> {
  try {
    const { data: highlights, error } = await supabase
      .from('intro_highlights')
      .select('*')
      .eq('recording_id', recordingId)
      .order('start_time_seconds')

    if (error) {
      console.error('Error fetching intro highlights:', error)
      return []
    }

    return highlights || []
  } catch (error) {
    console.error('Error fetching intro highlights:', error)
    return []
  }
}

export async function createIntroHighlight(highlight: Partial<IntroHighlight>): Promise<IntroHighlight | null> {
  try {
    const { data: newHighlight, error } = await supabase
      .from('intro_highlights')
      .insert(highlight)
      .select()
      .single()

    if (error) {
      console.error('Error creating intro highlight:', error)
      return null
    }

    return newHighlight
  } catch (error) {
    console.error('Error creating intro highlight:', error)
    return null
  }
}

// Playlist functions
export async function createIntroPlaylist(data: CreatePlaylistData): Promise<IntroPlaylist | null> {
  try {
    const { data: playlist, error } = await supabase
      .from('intro_playlists')
      .insert({
        name: data.name,
        description: data.description,
        is_public: data.is_public || false,
        playlist_type: data.playlist_type || 'personal',
        recording_ids: data.recording_ids || [],
        tags: data.tags,
        category: data.category
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating intro playlist:', error)
      return null
    }

    return playlist
  } catch (error) {
    console.error('Error creating intro playlist:', error)
    return null
  }
}

export async function getIntroPlaylists(
  userId?: string,
  isPublic?: boolean,
  playlistType?: string
): Promise<IntroPlaylist[]> {
  try {
    let query = supabase
      .from('intro_playlists')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('created_by', userId)
    }

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    if (playlistType) {
      query = query.eq('playlist_type', playlistType)
    }

    const { data: playlists, error } = await query

    if (error) {
      console.error('Error fetching intro playlists:', error)
      return []
    }

    return playlists || []
  } catch (error) {
    console.error('Error fetching intro playlists:', error)
    return []
  }
}

// Comment functions
export async function createIntroComment(data: CreateCommentData): Promise<IntroRecordingComment | null> {
  try {
    const { data: comment, error } = await supabase
      .from('intro_recording_comments')
      .insert({
        recording_id: data.recording_id,
        comment_text: data.comment_text,
        comment_type: data.comment_type || 'comment',
        rating: data.rating,
        parent_comment_id: data.parent_comment_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating intro comment:', error)
      return null
    }

    return comment
  } catch (error) {
    console.error('Error creating intro comment:', error)
    return null
  }
}

export async function getIntroRecordingComments(
  recordingId: string,
  parentCommentId?: string
): Promise<IntroRecordingComment[]> {
  try {
    let query = supabase
      .from('intro_recording_comments')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: false })

    if (parentCommentId) {
      query = query.eq('parent_comment_id', parentCommentId)
    } else {
      query = query.is('parent_comment_id', null)
    }

    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching intro comments:', error)
      return []
    }

    return comments || []
  } catch (error) {
    console.error('Error fetching intro comments:', error)
    return []
  }
}

// Template functions
export async function getIntroTemplates(
  templateType?: string,
  category?: string,
  difficultyLevel?: string
): Promise<IntroRecordingTemplate[]> {
  try {
    let query = supabase
      .from('intro_recording_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (templateType) {
      query = query.eq('template_type', templateType)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (difficultyLevel) {
      query = query.eq('difficulty_level', difficultyLevel)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching intro templates:', error)
      return []
    }

    return templates || []
  } catch (error) {
    console.error('Error fetching intro templates:', error)
    return []
  }
}

export async function createIntroTemplate(data: CreateTemplateData): Promise<IntroRecordingTemplate | null> {
  try {
    const { data: template, error } = await supabase
      .from('intro_recording_templates')
      .insert({
        name: data.name,
        description: data.description,
        template_type: data.template_type,
        template_content: data.template_content,
        suggested_duration_seconds: data.suggested_duration_seconds,
        difficulty_level: data.difficulty_level || 'beginner',
        category: data.category,
        tags: data.tags,
        language_code: data.language_code || 'en',
        university_id: data.university_id,
        target_audience: data.target_audience
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating intro template:', error)
      return null
    }

    return template
  } catch (error) {
    console.error('Error creating intro template:', error)
    return null
  }
}

// Analytics and stats functions
export async function getUserIntroStats(userId: string): Promise<UserIntroStats | null> {
  try {
    const { data: stats, error } = await supabase.rpc('get_user_intro_stats', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching user intro stats:', error)
      return null
    }

    return stats?.[0] || null
  } catch (error) {
    console.error('Error fetching user intro stats:', error)
    return null
  }
}

export async function getIntroRecordingAnalytics(
  recordingId: string,
  periodDays: number = 30
): Promise<IntroRecordingAnalytics[]> {
  try {
    const { data: analytics, error } = await supabase
      .from('intro_recording_analytics')
      .select('*')
      .eq('recording_id', recordingId)
      .gte('period_start', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('calculated_at', { ascending: false })

    if (error) {
      console.error('Error fetching recording analytics:', error)
      return []
    }

    return analytics || []
  } catch (error) {
    console.error('Error fetching recording analytics:', error)
    return []
  }
}

// Utility functions
export function getRecordingTypeConfig(type: string) {
  return RECORDING_TYPE_CONFIG[type as keyof typeof RECORDING_TYPE_CONFIG]
}

export function getModerationStatusConfig(status: string) {
  return MODERATION_STATUS_CONFIG[status as keyof typeof MODERATION_STATUS_CONFIG]
}

export function getHighlightTypeConfig(type: string) {
  return HIGHLIGHT_TYPE_CONFIG[type as keyof typeof HIGHLIGHT_TYPE_CONFIG]
}

export function getPlaylistTypeConfig(type: string) {
  return PLAYLIST_TYPE_CONFIG[type as keyof typeof PLAYLIST_TYPE_CONFIG]
}

export function getTemplateTypeConfig(type: string) {
  return TEMPLATE_TYPE_CONFIG[type as keyof typeof TEMPLATE_TYPE_CONFIG]
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${remainingSeconds}s`
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function getEngagementRate(recording: UserIntroRecording): number {
  const totalInteractions = recording.view_count + recording.like_count
  if (totalInteractions === 0) return 0
  
  return (recording.like_count / recording.view_count) * 100
}

export function getCompletionRate(interactions: IntroRecordingInteraction[]): number {
  const viewInteractions = interactions.filter(i => i.interaction_type === 'view')
  if (viewInteractions.length === 0) return 0
  
  const totalCompletion = viewInteractions.reduce(
    (sum, interaction) => sum + (interaction.view_completion_percentage || 0),
    0
  )
  
  return totalCompletion / viewInteractions.length
}

export function isRecordingValid(recording: UserIntroRecording): boolean {
  const limits = RECORDING_LIMITS[recording.recording_type]
  
  return (
    recording.duration_seconds >= limits.min_duration_seconds &&
    recording.duration_seconds <= limits.max_duration_seconds &&
    recording.status === 'ready' &&
    recording.moderation_status === 'approved'
  )
}

export function getAIQualityScore(recording: UserIntroRecording): number {
  if (!recording.ai_quality_score) return 0
  
  const score = recording.ai_quality_score
  if (score >= AI_THRESHOLDS.quality_score_minimum) {
    return score
  }
  
  return 0
}

export function getTopHighlights(highlights: IntroHighlight[], limit: number = 3): IntroHighlight[] {
  return highlights
    .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
    .slice(0, limit)
}

export function getSentimentLabel(sentimentScore: number): string {
  if (sentimentScore > 0.3) return 'Positive'
  if (sentimentScore < -0.3) return 'Negative'
  return 'Neutral'
}

export function getSentimentColor(sentimentScore: number): string {
  if (sentimentScore > 0.3) return 'text-green-600'
  if (sentimentScore < -0.3) return 'text-red-600'
  return 'text-gray-600'
}

// Demo data functions for testing
export function getDemoIntroRecordings(): UserIntroRecording[] {
  return [
    {
      id: '1',
      user_id: 'demo-user-id',
      recording_type: 'video',
      file_url: 'https://example.com/video1.mp4',
      file_size_bytes: 15728640, // ~15MB
      duration_seconds: 87,
      mime_type: 'video/mp4',
      recording_quality: 'high',
      resolution: '1920x1080',
      frame_rate: 30,
      bitrate: 2000000,
      title: 'My Introduction Video',
      description: 'A short video introducing myself and my interests',
      language_code: 'en',
      is_verified: true,
      verification_method: 'selfie_match',
      verification_confidence: 0.95,
      approved_at: '2024-01-15T10:00:00Z',
      moderation_status: 'approved',
      moderation_score: 0.92,
      ai_transcription: 'Hi, my name is Alex and I\'m excited to meet potential roommates...',
      ai_transcription_confidence: 0.89,
      ai_highlights: {
        key_moments: [
          {
            timestamp: 15.5,
            duration: 3.2,
            type: 'personality_trait',
            confidence: 0.85,
            description: 'Mentioned being organized and tidy'
          }
        ],
        personality_insights: [],
        topic_mentions: [],
        emotional_analysis: {
          overall_sentiment: 0.7,
          emotional_range: 0.4,
          dominant_emotions: ['excited', 'friendly'],
          confidence: 0.82
        }
      },
      ai_sentiment_analysis: {
        overall_sentiment: 0.7,
        sentiment_by_segment: [],
        emotional_indicators: [],
        confidence_score: 0.82
      },
      ai_content_tags: ['friendly', 'organized', 'outgoing', 'student'],
      ai_quality_score: 0.88,
      is_public: true,
      is_featured: false,
      view_count: 45,
      like_count: 12,
      visibility_settings: {},
      sharing_permissions: ['matches'],
      status: 'ready',
      processing_progress: 100,
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'demo-user-id',
      recording_type: 'audio',
      file_url: 'https://example.com/audio1.mp3',
      file_size_bytes: 3145728, // ~3MB
      duration_seconds: 52,
      mime_type: 'audio/mpeg',
      recording_quality: 'standard',
      audio_sample_rate: 44100,
      bitrate: 128000,
      title: 'Quick Audio Intro',
      description: 'A brief audio introduction',
      language_code: 'en',
      is_verified: true,
      verification_method: 'document_scan',
      verification_confidence: 0.91,
      approved_at: '2024-01-14T14:30:00Z',
      moderation_status: 'approved',
      moderation_score: 0.87,
      ai_transcription: 'Hey there! I\'m looking for roommates who share my love for...',
      ai_transcription_confidence: 0.93,
      ai_highlights: {
        key_moments: [],
        personality_insights: [],
        topic_mentions: [],
        emotional_analysis: {
          overall_sentiment: 0.6,
          emotional_range: 0.3,
          dominant_emotions: ['enthusiastic', 'warm'],
          confidence: 0.79
        }
      },
      ai_sentiment_analysis: {
        overall_sentiment: 0.6,
        sentiment_by_segment: [],
        emotional_indicators: [],
        confidence_score: 0.79
      },
      ai_content_tags: ['enthusiastic', 'music_lover', 'student'],
      ai_quality_score: 0.85,
      is_public: true,
      is_featured: false,
      view_count: 23,
      like_count: 7,
      visibility_settings: {},
      sharing_permissions: ['matches'],
      status: 'ready',
      processing_progress: 100,
      created_at: '2024-01-14T14:00:00Z',
      updated_at: '2024-01-14T14:30:00Z'
    }
  ]
}

export function getDemoIntroHighlights(): IntroHighlight[] {
  return [
    {
      id: '1',
      recording_id: '1',
      highlight_type: 'personality_trait',
      title: 'Organization Mention',
      description: 'User mentions being organized and tidy',
      start_time_seconds: 15.5,
      end_time_seconds: 18.7,
      transcript_text: 'I\'m a very organized person and I like to keep things tidy',
      confidence_score: 0.85,
      tags: ['personality', 'habits'],
      sentiment_score: 0.6,
      importance_score: 0.8,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      recording_id: '1',
      highlight_type: 'interest_mention',
      title: 'Music Interest',
      description: 'User mentions love for music',
      start_time_seconds: 32.1,
      end_time_seconds: 35.8,
      transcript_text: 'I love music and play guitar in my spare time',
      confidence_score: 0.92,
      tags: ['music', 'hobbies', 'guitar'],
      sentiment_score: 0.8,
      importance_score: 0.7,
      created_at: '2024-01-15T10:00:00Z'
    }
  ]
}

export function getDemoIntroTemplates(): IntroRecordingTemplate[] {
  return [
    {
      id: '1',
      name: 'Basic Introduction Template',
      description: 'A simple template for introducing yourself',
      template_type: 'prompt',
      template_content: 'Tell us about yourself:\n1. Your name and where you\'re from\n2. What you\'re studying\n3. Your hobbies and interests\n4. What you\'re looking for in a roommate',
      suggested_duration_seconds: 60,
      difficulty_level: 'beginner',
      category: 'general',
      tags: ['basic', 'introduction'],
      language_code: 'en',
      is_active: true,
      is_featured: true,
      usage_count: 156,
      success_rate: 0.89,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Fun Facts Template',
      description: 'Share interesting facts about yourself',
      template_type: 'script',
      template_content: 'Hi! Here are 3 fun facts about me:\n1. [Interesting fact about yourself]\n2. [Something unique you do]\n3. [A goal or dream you have]\n\nI\'d love to hear your fun facts too!',
      suggested_duration_seconds: 45,
      difficulty_level: 'intermediate',
      category: 'personality',
      tags: ['fun', 'facts', 'personality'],
      language_code: 'en',
      is_active: true,
      is_featured: false,
      usage_count: 89,
      success_rate: 0.82,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
}
