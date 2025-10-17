// Intro Recording Card Component for displaying video/audio introductions

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Video, 
  Mic, 
  Play, 
  Pause, 
  Heart, 
  Eye, 
  Share, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Star,
  MessageCircle,
  Download,
  Edit,
  Trash2,
  Volume2,
  VolumeX,
  Maximize2,
  Bookmark
} from 'lucide-react'
import type { UserIntroRecording } from '@/lib/video-intros/types'
import { 
  RECORDING_TYPE_CONFIG, 
  MODERATION_STATUS_CONFIG 
} from '@/lib/video-intros/types'
import { 
  formatDuration, 
  formatFileSize, 
  getEngagementRate,
  getRecordingTypeConfig,
  getModerationStatusConfig,
  getSentimentLabel,
  getSentimentColor
} from '@/lib/video-intros/utils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface IntroRecordingCardProps {
  recording: UserIntroRecording
  currentUserId?: string
  onPlay?: (id: string) => void
  onLike?: (id: string) => void
  onShare?: (id: string) => void
  onBookmark?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  className?: string
}

export function IntroRecordingCard({
  recording,
  currentUserId,
  onPlay,
  onLike,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onViewDetails,
  className
}: IntroRecordingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const typeConfig = getRecordingTypeConfig(recording.recording_type)
  const statusConfig = getModerationStatusConfig(recording.moderation_status)
  const Icon = recording.recording_type === 'video' ? Video : Mic
  
  const isOwner = currentUserId === recording.user_id
  const engagementRate = getEngagementRate(recording)
  const sentimentLabel = recording.ai_sentiment_analysis?.overall_sentiment 
    ? getSentimentLabel(recording.ai_sentiment_analysis.overall_sentiment)
    : null
  const sentimentColor = recording.ai_sentiment_analysis?.overall_sentiment
    ? getSentimentColor(recording.ai_sentiment_analysis.overall_sentiment)
    : 'text-gray-600'

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    onPlay?.(recording.id)
  }

  const handleLike = () => {
    onLike?.(recording.id)
  }

  const handleShare = () => {
    onShare?.(recording.id)
  }

  const handleBookmark = () => {
    onBookmark?.(recording.id)
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      recording.is_featured && 'border-yellow-200 bg-yellow-50/50',
      recording.moderation_status === 'flagged' && 'border-red-200 bg-red-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', typeConfig.color)}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{recording.title || 'Untitled Recording'}</CardTitle>
              {recording.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {recording.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', typeConfig.color)}>
                  {typeConfig.name}
                </Badge>
                
                <Badge variant="outline" className={cn('text-xs border', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                
                {recording.is_verified && (
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                
                {recording.is_featured && (
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                
                {sentimentLabel && (
                  <Badge variant="outline" className="text-xs">
                    <span className={cn('mr-1', sentimentColor)}>
                      {sentimentLabel}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatDuration(recording.duration_seconds)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video/Audio Player */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {recording.recording_type === 'video' ? (
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Video Preview</p>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Audio Recording</p>
              </div>
            </div>
          )}
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
            <Button
              size="lg"
              onClick={handlePlay}
              className="rounded-full w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-gray-900" />
              ) : (
                <Play className="h-6 w-6 text-gray-900 ml-1" />
              )}
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <Progress value={30} className="h-1" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white">
                {formatDuration(26)} / {formatDuration(recording.duration_seconds)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recording Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDuration(recording.duration_seconds)}
            </span>
          </div>
          
          {recording.file_size_bytes && (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(recording.file_size_bytes)}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recording.view_count} views
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recording.like_count} likes
            </span>
          </div>
        </div>
        
        {/* AI Analysis */}
        {recording.ai_content_tags && recording.ai_content_tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              AI-Generated Tags
            </h4>
            <div className="flex flex-wrap gap-1">
              {recording.ai_content_tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Processing Status */}
        {recording.status === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Processing recording...
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {recording.processing_progress}%
              </span>
            </div>
            <Progress value={recording.processing_progress} className="h-2" />
          </div>
        )}
        
        {/* Engagement Stats */}
        {recording.status === 'ready' && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Engagement Rate
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {engagementRate.toFixed(1)}%
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlay}
            className="flex-1"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            Like
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBookmark}
            className="flex-1"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Owner Actions */}
        {isOwner && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(recording.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(recording.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Details
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(recording.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface IntroRecordingListProps {
  recordings: UserIntroRecording[]
  currentUserId?: string
  onPlay?: (id: string) => void
  onLike?: (id: string) => void
  onShare?: (id: string) => void
  onBookmark?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
  className?: string
}

export function IntroRecordingList({
  recordings,
  currentUserId,
  onPlay,
  onLike,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onViewDetails,
  className
}: IntroRecordingListProps) {
  if (recordings.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Recordings Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No video or audio introductions found.
        </p>
      </div>
    )
  }

  // Sort recordings by featured status, then by creation date
  const sortedRecordings = [...recordings].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {sortedRecordings.map((recording) => (
        <IntroRecordingCard
          key={recording.id}
          recording={recording}
          currentUserId={currentUserId}
          onPlay={onPlay}
          onLike={onLike}
          onShare={onShare}
          onBookmark={onBookmark}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}

interface IntroRecordingStatsProps {
  recordings: UserIntroRecording[]
  className?: string
}

export function IntroRecordingStats({ recordings, className }: IntroRecordingStatsProps) {
  const totalRecordings = recordings.length
  const videoRecordings = recordings.filter(r => r.recording_type === 'video').length
  const audioRecordings = recordings.filter(r => r.recording_type === 'audio').length
  const verifiedRecordings = recordings.filter(r => r.is_verified).length
  const totalViews = recordings.reduce((sum, r) => sum + r.view_count, 0)
  const totalLikes = recordings.reduce((sum, r) => sum + r.like_count, 0)
  const totalDuration = recordings.reduce((sum, r) => sum + r.duration_seconds, 0)

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalRecordings}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Recordings
        </div>
      </div>
      
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {videoRecordings}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Videos
        </div>
      </div>
      
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {audioRecordings}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Audio
        </div>
      </div>
      
      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {verifiedRecordings}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Verified
        </div>
      </div>
    </div>
  )
}
