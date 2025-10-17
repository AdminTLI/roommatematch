// Asynchronous Video/Audio Intros System Types

export interface UserIntroRecording {
  id: string
  user_id: string
  recording_type: RecordingType
  file_url: string
  file_size_bytes?: number
  duration_seconds: number
  mime_type: string
  recording_quality: RecordingQuality
  resolution?: string
  frame_rate?: number
  audio_sample_rate?: number
  bitrate?: number
  title?: string
  description?: string
  language_code: string
  is_verified: boolean
  verification_method?: string
  verification_confidence?: number
  approved_by?: string
  approved_at?: string
  moderation_status: ModerationStatus
  moderation_notes?: string
  moderation_score?: number
  flagged_reasons?: string[]
  ai_transcription?: string
  ai_transcription_confidence?: number
  ai_highlights?: AIHighlights
  ai_sentiment_analysis?: AISentimentAnalysis
  ai_content_tags?: string[]
  ai_quality_score?: number
  is_public: boolean
  is_featured: boolean
  view_count: number
  like_count: number
  visibility_settings: Record<string, any>
  sharing_permissions: string[]
  status: RecordingStatus
  processing_progress: number
  created_at: string
  updated_at: string
}

export interface IntroHighlight {
  id: string
  recording_id: string
  highlight_type: HighlightType
  title?: string
  description?: string
  start_time_seconds: number
  end_time_seconds: number
  transcript_text?: string
  confidence_score?: number
  tags?: string[]
  sentiment_score?: number
  importance_score?: number
  created_at: string
}

export interface IntroRecordingInteraction {
  id: string
  recording_id: string
  viewer_id: string
  interaction_type: InteractionType
  view_duration_seconds?: number
  view_completion_percentage?: number
  device_type?: string
  browser?: string
  notes?: string
  shared_with?: string[]
  created_at: string
}

export interface IntroPlaylist {
  id: string
  name: string
  description?: string
  created_by: string
  is_public: boolean
  is_featured: boolean
  playlist_type: PlaylistType
  recording_ids: string[]
  total_duration_seconds: number
  total_recordings: number
  tags?: string[]
  category?: string
  view_count: number
  like_count: number
  share_count: number
  created_at: string
  updated_at: string
}

export interface IntroRecordingComment {
  id: string
  recording_id: string
  commenter_id: string
  parent_comment_id?: string
  comment_text: string
  comment_type: CommentType
  rating?: number
  is_approved: boolean
  is_flagged: boolean
  moderation_notes?: string
  like_count: number
  reply_count: number
  created_at: string
  updated_at: string
}

export interface IntroRecordingAnalytics {
  id: string
  recording_id: string
  period_start: string
  period_end: string
  granularity: TimeGranularity
  total_views: number
  unique_viewers: number
  average_view_duration_seconds: number
  completion_rate: number
  total_likes: number
  total_shares: number
  total_comments: number
  engagement_rate: number
  views_by_country: Record<string, number>
  views_by_region: Record<string, number>
  views_by_device: Record<string, number>
  views_by_browser: Record<string, number>
  calculated_at: string
  created_at: string
}

export interface IntroRecordingTemplate {
  id: string
  name: string
  description?: string
  template_type: TemplateType
  template_content: string
  suggested_duration_seconds?: number
  difficulty_level: DifficultyLevel
  category?: string
  tags?: string[]
  language_code: string
  university_id?: string
  target_audience?: string
  is_active: boolean
  is_featured: boolean
  usage_count: number
  success_rate?: number
  created_by?: string
  created_at: string
  updated_at: string
}

// Enums
export type RecordingType = 'video' | 'audio'

export type RecordingQuality = 'low' | 'standard' | 'high' | 'ultra_hd'

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'under_review'

export type RecordingStatus = 'processing' | 'ready' | 'failed' | 'archived'

export type HighlightType = 
  | 'key_phrase' 
  | 'emotional_moment' 
  | 'important_info' 
  | 'funny_moment' 
  | 'personality_trait' 
  | 'interest_mention' 
  | 'goal_statement'

export type InteractionType = 'view' | 'like' | 'share' | 'bookmark' | 'report'

export type PlaylistType = 'personal' | 'curated' | 'featured' | 'university' | 'themed'

export type CommentType = 'comment' | 'review' | 'feedback' | 'question'

export type TemplateType = 'prompt' | 'script' | 'outline' | 'example'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly'

// Complex types
export interface AIHighlights {
  key_moments: HighlightMoment[]
  personality_insights: PersonalityInsight[]
  topic_mentions: TopicMention[]
  emotional_analysis: EmotionalAnalysis
}

export interface HighlightMoment {
  timestamp: number
  duration: number
  type: string
  confidence: number
  description: string
}

export interface PersonalityInsight {
  trait: string
  confidence: number
  evidence: string
  timestamp: number
}

export interface TopicMention {
  topic: string
  sentiment: number
  importance: number
  timestamp: number
}

export interface EmotionalAnalysis {
  overall_sentiment: number
  emotional_range: number
  dominant_emotions: string[]
  confidence: number
}

export interface AISentimentAnalysis {
  overall_sentiment: number
  sentiment_by_segment: SentimentSegment[]
  emotional_indicators: EmotionalIndicator[]
  confidence_score: number
}

export interface SentimentSegment {
  start_time: number
  end_time: number
  sentiment: number
  confidence: number
  dominant_emotion: string
}

export interface EmotionalIndicator {
  emotion: string
  intensity: number
  frequency: number
  context: string
}

// Form types
export interface CreateRecordingData {
  user_id: string
  recording_type: RecordingType
  file_url: string
  duration_seconds: number
  mime_type: string
  title?: string
  description?: string
  language_code?: string
  is_public?: boolean
}

export interface UpdateRecordingData {
  title?: string
  description?: string
  is_public?: boolean
  is_featured?: boolean
  visibility_settings?: Record<string, any>
  sharing_permissions?: string[]
}

export interface CreatePlaylistData {
  name: string
  description?: string
  is_public?: boolean
  playlist_type?: PlaylistType
  recording_ids?: string[]
  tags?: string[]
  category?: string
}

export interface CreateCommentData {
  recording_id: string
  comment_text: string
  comment_type?: CommentType
  rating?: number
  parent_comment_id?: string
}

export interface CreateTemplateData {
  name: string
  description?: string
  template_type: TemplateType
  template_content: string
  suggested_duration_seconds?: number
  difficulty_level?: DifficultyLevel
  category?: string
  tags?: string[]
  language_code?: string
  university_id?: string
  target_audience?: string
}

// Summary and dashboard types
export interface UserIntroStats {
  user_id: string
  total_recordings: number
  public_recordings: number
  verified_recordings: number
  total_views: number
  total_likes: number
  average_rating?: number
}

export interface RecordingInsights {
  recording_id: string
  engagement_score: number
  completion_rate: number
  top_highlights: IntroHighlight[]
  sentiment_summary: string
  recommended_improvements: string[]
  audience_insights: AudienceInsight[]
}

export interface AudienceInsight {
  demographic: string
  percentage: number
  engagement_rate: number
  preferred_content: string[]
}

// Configuration types
export const RECORDING_TYPE_CONFIG = {
  video: { 
    name: 'Video Recording', 
    icon: 'Video', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Video introduction with audio and visual elements',
    max_duration: 300, // 5 minutes
    supported_formats: ['mp4', 'webm', 'mov']
  },
  audio: { 
    name: 'Audio Recording', 
    icon: 'Mic', 
    color: 'bg-green-100 text-green-800',
    description: 'Audio-only introduction recording',
    max_duration: 180, // 3 minutes
    supported_formats: ['mp3', 'wav', 'ogg', 'm4a']
  }
} as const

export const RECORDING_QUALITY_CONFIG = {
  low: { 
    name: 'Low Quality', 
    description: 'Basic quality for slower connections',
    video_resolution: '480p',
    audio_bitrate: '64kbps'
  },
  standard: { 
    name: 'Standard Quality', 
    description: 'Good quality for most devices',
    video_resolution: '720p',
    audio_bitrate: '128kbps'
  },
  high: { 
    name: 'High Quality', 
    description: 'High quality for premium experience',
    video_resolution: '1080p',
    audio_bitrate: '256kbps'
  },
  ultra_hd: { 
    name: 'Ultra HD', 
    description: 'Ultra high quality for best experience',
    video_resolution: '4K',
    audio_bitrate: '320kbps'
  }
} as const

export const MODERATION_STATUS_CONFIG = {
  pending: { 
    label: 'Pending Review', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Awaiting moderation review'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 text-green-800',
    description: 'Approved for public viewing'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800',
    description: 'Rejected due to policy violations'
  },
  flagged: { 
    label: 'Flagged', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Flagged for additional review'
  },
  under_review: { 
    label: 'Under Review', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Currently being reviewed'
  }
} as const

export const HIGHLIGHT_TYPE_CONFIG = {
  key_phrase: { 
    name: 'Key Phrase', 
    icon: 'Quote', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Important statements or quotes'
  },
  emotional_moment: { 
    name: 'Emotional Moment', 
    icon: 'Heart', 
    color: 'bg-pink-100 text-pink-800',
    description: 'Emotionally significant moments'
  },
  important_info: { 
    name: 'Important Info', 
    icon: 'Info', 
    color: 'bg-green-100 text-green-800',
    description: 'Key information or facts'
  },
  funny_moment: { 
    name: 'Funny Moment', 
    icon: 'Smile', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Humor or entertaining content'
  },
  personality_trait: { 
    name: 'Personality Trait', 
    icon: 'User', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Personality characteristics'
  },
  interest_mention: { 
    name: 'Interest Mention', 
    icon: 'Star', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Hobbies, interests, or passions'
  },
  goal_statement: { 
    name: 'Goal Statement', 
    icon: 'Target', 
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Future goals or aspirations'
  }
} as const

export const PLAYLIST_TYPE_CONFIG = {
  personal: { 
    name: 'Personal Playlist', 
    icon: 'User', 
    color: 'bg-gray-100 text-gray-800',
    description: 'Personal collection of recordings'
  },
  curated: { 
    name: 'Curated Playlist', 
    icon: 'Bookmark', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Hand-picked collection by moderators'
  },
  featured: { 
    name: 'Featured Playlist', 
    icon: 'Star', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Featured collection for promotion'
  },
  university: { 
    name: 'University Playlist', 
    icon: 'GraduationCap', 
    color: 'bg-green-100 text-green-800',
    description: 'University-specific content'
  },
  themed: { 
    name: 'Themed Playlist', 
    icon: 'Tag', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Content organized by theme or topic'
  }
} as const

export const TEMPLATE_TYPE_CONFIG = {
  prompt: { 
    name: 'Prompt Template', 
    icon: 'MessageSquare', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Questions and prompts to guide recording'
  },
  script: { 
    name: 'Script Template', 
    icon: 'FileText', 
    color: 'bg-green-100 text-green-800',
    description: 'Full script for structured recording'
  },
  outline: { 
    name: 'Outline Template', 
    icon: 'List', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Structured outline for content organization'
  },
  example: { 
    name: 'Example Template', 
    icon: 'Play', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Example recording for reference'
  }
} as const

// Recording limits and constraints
export const RECORDING_LIMITS = {
  video: {
    max_duration_seconds: 300, // 5 minutes
    max_file_size_mb: 100,
    min_duration_seconds: 10, // 10 seconds
    recommended_duration_seconds: 60 // 1 minute
  },
  audio: {
    max_duration_seconds: 180, // 3 minutes
    max_file_size_mb: 25,
    min_duration_seconds: 5, // 5 seconds
    recommended_duration_seconds: 45 // 45 seconds
  }
} as const

// AI analysis thresholds
export const AI_THRESHOLDS = {
  transcription_confidence: 0.8,
  highlight_confidence: 0.7,
  sentiment_confidence: 0.6,
  quality_score_minimum: 0.5
} as const
