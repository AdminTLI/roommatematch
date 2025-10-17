// Video Intros Page - Asynchronous Video/Audio Intros System

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IntroRecordingList, IntroRecordingStats } from '@/app/(components)/intro-recording-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  Mic, 
  Plus, 
  Play, 
  Heart, 
  Share, 
  Bookmark,
  Star,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Search,
  Upload,
  Camera,
  Volume2
} from 'lucide-react'
import { 
  getDemoIntroRecordings, 
  getDemoIntroHighlights, 
  getDemoIntroTemplates 
} from '@/lib/video-intros/utils'
import type { 
  UserIntroRecording,
  IntroHighlight,
  IntroRecordingTemplate,
  UserIntroStats
} from '@/lib/video-intros/types'
import { User } from '@supabase/supabase-js'

export default function VideoIntrosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [recordings, setRecordings] = useState<UserIntroRecording[]>([])
  const [highlights, setHighlights] = useState<IntroHighlight[]>([])
  const [templates, setTemplates] = useState<IntroRecordingTemplate[]>([])
  const [userStats, setUserStats] = useState<UserIntroStats | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        setUser(user)

        // For demo purposes, use demo data
        if (user.id === 'demo-user-id') {
          setRecordings(getDemoIntroRecordings())
          setHighlights(getDemoIntroHighlights())
          setTemplates(getDemoIntroTemplates())
          
          // Create mock user stats
          const mockStats: UserIntroStats = {
            user_id: user.id,
            total_recordings: 2,
            public_recordings: 2,
            verified_recordings: 2,
            total_views: 68,
            total_likes: 19,
            average_rating: 4.5
          }
          setUserStats(mockStats)
        } else {
          // TODO: Load real data from Supabase
          // const userRecordings = await getUserIntroRecordings(user.id)
          // const userHighlights = await getIntroHighlights(user.id)
          // const userTemplates = await getIntroTemplates()
          // const userStats = await getUserIntroStats(user.id)
          // setRecordings(userRecordings)
          // setHighlights(userHighlights)
          // setTemplates(userTemplates)
          // setUserStats(userStats)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleCreateRecording = () => {
    router.push('/video-intros/record')
  }

  const handlePlayRecording = (id: string) => {
    // TODO: Implement recording playback
    console.log('Play recording:', id)
  }

  const handleLikeRecording = (id: string) => {
    // TODO: Implement like functionality
    console.log('Like recording:', id)
  }

  const handleShareRecording = (id: string) => {
    // TODO: Implement share functionality
    console.log('Share recording:', id)
  }

  const handleBookmarkRecording = (id: string) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark recording:', id)
  }

  const handleEditRecording = (id: string) => {
    router.push(`/video-intros/edit/${id}`)
  }

  const handleDeleteRecording = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete recording:', id)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/video-intros/${id}`)
  }

  const filteredRecordings = recordings.filter(recording => {
    const matchesType = selectedType === 'all' || recording.recording_type === selectedType
    const matchesSearch = !searchQuery || 
      recording.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.ai_content_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesType && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading video introductions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access video introductions.
          </p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Video Introductions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Share your personality through video and audio introductions.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/video-intros/templates')}>
                <Star className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button onClick={handleCreateRecording}>
                <Plus className="h-4 w-4 mr-2" />
                Record Intro
              </Button>
            </div>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="mb-8">
            <IntroRecordingStats recordings={recordings} />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search recordings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedType === 'video' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('video')}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </Button>
                  <Button
                    variant={selectedType === 'audio' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('audio')}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Audio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="my-recordings">My Recordings</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            {/* Featured Recordings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Featured Introductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IntroRecordingList
                  recordings={recordings.filter(r => r.is_featured)}
                  currentUserId={user.id}
                  onPlay={handlePlayRecording}
                  onLike={handleLikeRecording}
                  onShare={handleShareRecording}
                  onBookmark={handleBookmarkRecording}
                  onEdit={handleEditRecording}
                  onDelete={handleDeleteRecording}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>

            {/* All Public Recordings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  All Introductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IntroRecordingList
                  recordings={filteredRecordings.filter(r => r.is_public)}
                  currentUserId={user.id}
                  onPlay={handlePlayRecording}
                  onLike={handleLikeRecording}
                  onShare={handleShareRecording}
                  onBookmark={handleBookmarkRecording}
                  onEdit={handleEditRecording}
                  onDelete={handleDeleteRecording}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-recordings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    My Recordings
                  </CardTitle>
                  <Button onClick={handleCreateRecording}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Recording
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <IntroRecordingList
                  recordings={filteredRecordings.filter(r => r.user_id === user.id)}
                  currentUserId={user.id}
                  onPlay={handlePlayRecording}
                  onLike={handleLikeRecording}
                  onShare={handleShareRecording}
                  onBookmark={handleBookmarkRecording}
                  onEdit={handleEditRecording}
                  onDelete={handleDeleteRecording}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="highlights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI-Generated Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {highlights.length > 0 ? (
                  <div className="space-y-4">
                    {highlights.map((highlight) => (
                      <div key={highlight.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {highlight.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {highlight.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {highlight.highlight_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {Math.floor(highlight.start_time_seconds / 60)}:
                                {(highlight.start_time_seconds % 60).toFixed(0).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {Math.round((highlight.importance_score || 0) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Importance
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Highlights Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-generated highlights will appear here once you have recordings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recording Templates
                  </CardTitle>
                  <Button onClick={() => router.push('/video-intros/templates/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.template_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.difficulty_level}
                              </Badge>
                              {template.suggested_duration_seconds && (
                                <span className="text-xs text-gray-500">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {Math.floor(template.suggested_duration_seconds / 60)}:
                                  {(template.suggested_duration_seconds % 60).toFixed(0).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {template.usage_count}
                            </div>
                            <div className="text-xs text-gray-500">
                              Uses
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Templates Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Recording templates help guide your introductions.
                    </p>
                    <Button onClick={() => router.push('/video-intros/templates/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
