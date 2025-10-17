'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MatchCard } from '@/app/(components)/match-card'
import { GroupSuggestionCard } from '@/app/(components)/group-suggestion-card'
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
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Matches
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Find your perfect roommate match based on compatibility
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={loadMatches}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{individualMatches.length}</div>
                  <div className="text-sm text-gray-500">Individual Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{groupSuggestions.length}</div>
                  <div className="text-sm text-gray-500">Group Suggestions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {individualMatches.length > 0 ? 
                      Math.round(Math.max(...individualMatches.map(m => m.compatibility)) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Best Match</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matches Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individuals" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Individual Matches ({individualMatches.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Matches ({groupSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="debriefs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compatibility Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individuals" className="space-y-6">
          {individualMatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No individual matches found</CardTitle>
                <CardDescription className="mb-4">
                  We're still finding compatible roommates for you. Check back later or adjust your preferences.
                </CardDescription>
                <Button variant="outline">
                  Adjust Preferences
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {individualMatches.map((match) => (
                <MatchCard
                  key={match.match_user_id}
                  id={match.match_user_id}
                  name={match.name}
                  university={match.university_name}
                  program={match.program_name}
                  degreeLevel={match.degree_level}
                  budgetBand={`€${match.budget_min}-€${match.budget_max}`}
                  compatibility={match.compatibility_score}
                  compatibilityBreakdown={{
                    personality: match.personality_score,
                    schedule: match.schedule_score,
                    lifestyle: match.lifestyle_score,
                    social: match.social_score,
                    academic: match.academic_bonus
                  }}
                  topAlignment={match.top_alignment as any}
                  watchOut={match.watch_out}
                  houseRulesSuggestion={match.house_rules_suggestion}
                  academicBonuses={match.academic_details}
                  onAccept={handleAcceptMatch}
                  onReject={handleRejectMatch}
                  onViewProfile={handleViewProfile}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {groupSuggestions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No group suggestions yet</CardTitle>
                <CardDescription className="mb-4">
                  We're working on finding compatible groups for you. Individual matches are available above.
                </CardDescription>
                <Button variant="outline" onClick={() => setActiveTab('individuals')}>
                  View Individual Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {groupSuggestions.map((group) => (
                <GroupSuggestionCard
                  key={group.group_id}
                  id={group.group_id}
                  memberCount={group.member_count}
                  averageCompatibility={group.compatibility_score}
                  members={group.members.map(member => ({
                    id: member.user_id,
                    name: member.name,
                    university: member.university,
                    program: member.program
                  }))}
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
