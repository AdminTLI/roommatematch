'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MatchCard } from '@/app/(components)/match-card'
import { GroupSuggestionCard } from '@/app/(components)/group-suggestion-card'
import { DiscoveryCard } from '@/app/dashboard/components/discovery-card'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  Users, 
  User as UserIcon, 
  Filter, 
  RefreshCw, 
  Heart, 
  MessageCircle,
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react'
import { DebriefSection } from './debrief-section'

interface MatchesInterfaceProps {
  user: User
}

interface Match {
  match_user_id: string
  name: string
  age: number
  university_name: string
  program_name: string
  degree_level: string
  study_year: number
  budget_min: number
  budget_max: number
  compatibility_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_bonus: number
  top_alignment: string
  watch_out?: string
  house_rules_suggestion?: string
  academic_details?: {
    university_affinity: boolean
    program_affinity: boolean
    faculty_affinity: boolean
    study_year_gap?: number
  }
  // New fields from compatibility algorithm v1.0
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  is_valid_match?: boolean
  algorithm_version?: string
}

interface GroupSuggestion {
  group_id: string
  member_count: number
  compatibility_score: number
  members: Array<{
    user_id: string
    name: string
    university: string
    program: string
  }>
}

export function MatchesInterface({ user }: MatchesInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState('individuals')
  const [individualMatches, setIndividualMatches] = useState<Match[]>([])
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [filters, setFilters] = useState({
    universityIds: [] as string[],
    degreeLevels: [] as string[],
    programIds: [] as string[],
    studyYears: [] as number[]
  })


  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setIsLoading(true)
    
    try {
      // Load individual matches using RPC
      const { data: individualData, error: individualError } = await supabase.rpc('get_user_matches', {
        p_user_id: user.id,
        p_limit: 20,
        p_offset: 0,
        p_university_ids: filters.universityIds.length > 0 ? filters.universityIds : null,
        p_degree_levels: filters.degreeLevels.length > 0 ? filters.degreeLevels : null,
        p_program_ids: filters.programIds.length > 0 ? filters.programIds : null,
        p_study_years: filters.studyYears.length > 0 ? filters.studyYears : null
      })

      if (individualError) {
        throw individualError
      }

      // Load group matches using RPC
      const { data: groupData, error: groupError } = await supabase.rpc('get_group_matches', {
        p_user_id: user.id,
        p_limit: 10,
        p_offset: 0
      })

      if (groupError) {
        console.warn('Failed to load group matches:', groupError)
      }

      setIndividualMatches(individualData || [])
      setGroupSuggestions(groupData || [])
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('match_decisions')
        .insert({
          user_id: user.id,
          matched_user_id: matchId,
          decision: 'accepted'
        })

      if (error) throw error
      
      // Remove from UI
      setIndividualMatches(prev => 
        prev.filter(match => match.match_user_id !== matchId)
      )
      
    } catch (error) {
      console.error('Failed to accept match:', error)
    }
  }

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('match_decisions')
        .insert({
          user_id: user.id,
          matched_user_id: matchId,
          decision: 'rejected'
        })

      if (error) throw error
      
      // Remove from UI
      setIndividualMatches(prev => 
        prev.filter(match => match.match_user_id !== matchId)
      )
      
    } catch (error) {
      console.error('Failed to reject match:', error)
    }
  }

  const handleViewProfile = (matchId: string) => {
    router.push(`/profile/${matchId}`)
  }

  const handleStartChat = (matchId: string) => {
    router.push(`/chat/${matchId}`)
  }

  const handleConnect = async (matchId: string) => {
    await handleAcceptMatch(matchId)
    router.push(`/chat?userId=${matchId}`)
  }

  // Generate compatibility highlights from match data
  const generateCompatibilityHighlights = (match: Match): string[] => {
    const highlights: string[] = []
    
    if (match.top_alignment) {
      const alignmentLabels: { [key: string]: string } = {
        'personality': 'Personality',
        'schedule': 'Schedule',
        'lifestyle': 'Lifestyle',
        'social': 'Social preferences',
        'academic': 'Academic goals'
      }
      highlights.push(`Strong alignment on ${alignmentLabels[match.top_alignment] || match.top_alignment}`)
    }
    
    if (match.harmony_score !== null && match.harmony_score !== undefined && match.harmony_score >= 0.7) {
      highlights.push('Excellent day-to-day living compatibility')
    }
    
    if (match.context_score !== null && match.context_score !== undefined && match.context_score >= 0.7) {
      highlights.push('Similar academic background and goals')
    }
    
    if (match.academic_details?.program_affinity) {
      highlights.push('Same study program')
    } else if (match.academic_details?.university_affinity) {
      highlights.push('Same university')
    }
    
    if (match.schedule_score >= 0.7) {
      highlights.push('Compatible daily schedules')
    }
    
    if (match.lifestyle_score >= 0.7) {
      highlights.push('Similar lifestyle preferences')
    }
    
    // Ensure we have at least 3 highlights, use defaults if needed
    while (highlights.length < 3) {
      if (highlights.length === 0) highlights.push('Similar lifestyle preferences')
      else if (highlights.length === 1) highlights.push('Compatible schedules')
      else highlights.push('Shared interests')
    }
    
    return highlights.slice(0, 3)
  }

  const handleAcceptGroup = async (groupId: string) => {
    try {
      console.log('Accepting group:', groupId)
      // Handle group acceptance
    } catch (error) {
      console.error('Failed to accept group:', error)
    }
  }

  const handleOpenGroup = (groupId: string) => {
    router.push(`/chat/group/${groupId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-24 md:pb-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-bg-surface-alt rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-bg-surface-alt rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Your Matches
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-2">
              From strangers to roommates - find your perfect match based on compatibility
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {lastUpdated && (
              <div className="text-xs sm:text-sm text-text-muted text-center sm:text-left">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={loadMatches} className="min-h-[44px] w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{individualMatches.length}</div>
                  <div className="text-sm text-text-muted">Individual Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-semantic-success" />
                <div>
                  <div className="text-2xl font-bold">{groupSuggestions.length}</div>
                  <div className="text-sm text-text-muted">Group Suggestions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-semantic-accent" />
                <div>
                  <div className="text-2xl font-bold">
                    {individualMatches.length > 0 ? 
                      Math.round(Math.max(...individualMatches.map(m => m.compatibility_score)) * 100) : 0}%
                  </div>
                  <div className="text-sm text-text-muted">Best Match</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matches Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="individuals" className="flex items-center gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">
            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Individual Matches</span>
            <span className="sm:hidden">Individual</span>
            <span className="hidden sm:inline">({individualMatches.length})</span>
            <span className="sm:hidden">({individualMatches.length})</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Group Matches</span>
            <span className="sm:hidden">Groups</span>
            <span className="hidden sm:inline">({groupSuggestions.length})</span>
            <span className="sm:hidden">({groupSuggestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="debriefs" className="flex items-center gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Compatibility Stories</span>
            <span className="sm:hidden">Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individuals" className="space-y-6">
          {individualMatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No individual matches found</CardTitle>
                <CardDescription className="mb-4">
                  We're still finding compatible roommates for you. Check back later or adjust your preferences.
                </CardDescription>
                <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
                  Adjust Preferences
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {individualMatches.map((match) => (
                <motion.div
                  key={match.match_user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <DiscoveryCard
                    profile={{
                      id: match.match_user_id,
                      matchPercentage: Math.round(match.compatibility_score * 100),
                      harmonyScore: match.harmony_score !== null && match.harmony_score !== undefined ? match.harmony_score : 0,
                      contextScore: match.context_score !== null && match.context_score !== undefined ? match.context_score : 0,
                      compatibilityHighlights: generateCompatibilityHighlights(match),
                      dimensionScores: match.dimension_scores_json || null
                    }}
                    onSkip={handleRejectMatch}
                    onConnect={handleConnect}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {groupSuggestions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No group suggestions yet</CardTitle>
                <CardDescription className="mb-4">
                  We're working on finding compatible groups for you. Individual matches are available above.
                </CardDescription>
                <Button variant="outline" onClick={() => setActiveTab('individuals')} className="min-h-[44px] w-full sm:w-auto">
                  View Individual Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {groupSuggestions.map((group) => (
                <GroupSuggestionCard
                  key={group.group_id}
                  id={group.group_id}
                  averageCompatibility={group.compatibility_score}
                  members={group.members.map(member => ({
                    id: member.user_id,
                    name: member.name,
                    compatibility: group.compatibility_score
                  }))}
                  constraints={[]}
                  benefits={[]}
                  watchOuts={[]}
                  onAccept={handleAcceptGroup}
                  onOpenGroup={handleOpenGroup}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="debriefs" className="space-y-6">
          <DebriefSection 
            user={user}
            onStartChat={handleStartChat}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
