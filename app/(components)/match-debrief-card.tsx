'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar, 
  Heart, 
  AlertTriangle,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatCompatibilityScore, getCompatibilityLabel } from '@/lib/utils'
import { MatchDebrief, ConversationNudge, RelationalHealthScore } from '@/lib/matching/debrief'
import { CompatibilityStoryChart } from './compatibility-story-chart'
import { FirstQuestionsPanel } from './first-questions-panel'
import { RelationalHealthTracker } from './relational-health-tracker'

interface MatchDebriefCardProps {
  debrief: MatchDebrief
  activeNudges: ConversationNudge[]
  healthScores: RelationalHealthScore[]
  onViewQuestions: (debriefId: string) => void
  onStartChat: (matchId: string) => void
  onTrackEngagement: (debriefId: string, eventType: string, eventData?: any) => void
  onUpdateHealth: (debriefId: string, weekNumber: number, healthData: Partial<RelationalHealthScore>) => void
  onDismissNudge: (nudgeId: string) => void
  onClickNudge: (nudgeId: string) => void
}

export function MatchDebriefCard({
  debrief,
  activeNudges,
  healthScores,
  onViewQuestions,
  onStartChat,
  onTrackEngagement,
  onUpdateHealth,
  onDismissNudge,
  onClickNudge
}: MatchDebriefCardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showHealthTracker, setShowHealthTracker] = useState(false)

  const handleViewQuestions = () => {
    onViewQuestions(debrief.id)
    onTrackEngagement(debrief.id, 'debrief_viewed', { section: 'questions' })
  }

  const handleStartChat = () => {
    onStartChat(debrief.match_id)
    onTrackEngagement(debrief.id, 'chat_started')
  }

  const latestHealthScore = healthScores
    .sort((a, b) => b.week_number - a.week_number)[0]

  const pendingNudges = activeNudges.filter(nudge => !nudge.dismissed_at && !nudge.clicked_at)
  const hasUnreadNudges = pendingNudges.length > 0

  return (
    <Card className="border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              Compatibility Story
              {hasUnreadNudges && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendingNudges.length} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Generated {new Date(debrief.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCompatibilityScore(debrief.compatibility_score)}
            </div>
            <div className="text-sm text-gray-500">
              {getCompatibilityLabel(debrief.compatibility_score)}
            </div>
          </div>
        </div>

        {/* Active Nudges */}
        {pendingNudges.length > 0 && (
          <div className="mt-4 space-y-2">
            {pendingNudges.map(nudge => (
              <div key={nudge.id} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                  {nudge.message}
                </span>
                <div className="flex gap-1">
                  {nudge.action_suggested && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        onTrackEngagement(debrief.id, 'nudge_clicked', { nudge_type: nudge.nudge_type })
                        onClickNudge(nudge.id)
                      }}
                    >
                      {nudge.action_suggested}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDismissNudge(nudge.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Strength */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Top Strength</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {debrief.compatibility_story.top_strength}
                </p>
              </div>

              {/* Watch Outs */}
              {debrief.compatibility_story.watch_outs !== 'No major concerns' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">Watch Out</h4>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {debrief.compatibility_story.watch_outs}
                  </p>
                </div>
              )}
            </div>

            {/* Compatibility Chart */}
            <CompatibilityStoryChart story={debrief.compatibility_story} />

            {/* House Rules Suggestion */}
            {debrief.compatibility_story.house_rules && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Suggested House Rules</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {debrief.compatibility_story.house_rules}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleViewQuestions} className="flex-1">
                <Lightbulb className="h-4 w-4 mr-2" />
                View Conversation Starters
              </Button>
              <Button variant="outline" onClick={handleStartChat} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="questions">
            <FirstQuestionsPanel 
              questions={debrief.first_questions}
              onQuestionUsed={(question) => 
                onTrackEngagement(debrief.id, 'questions_used', { question })
              }
            />
          </TabsContent>

          <TabsContent value="health">
            <RelationalHealthTracker
              debriefId={debrief.id}
              healthScores={healthScores}
              onUpdateHealth={onUpdateHealth}
              onTrackEngagement={onTrackEngagement}
            />
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              {/* Shared Interests */}
              {debrief.shared_interests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Shared Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {debrief.shared_interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Conflicts */}
              {debrief.potential_conflicts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Potential Conflicts</h4>
                  <div className="flex flex-wrap gap-2">
                    {debrief.potential_conflicts.map((conflict, index) => (
                      <Badge key={index} variant="destructive">
                        {conflict}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Health Score */}
              {latestHealthScore && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Latest Relational Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Satisfaction</span>
                      <span>{latestHealthScore.overall_satisfaction}/5</span>
                    </div>
                    <Progress value={(latestHealthScore.overall_satisfaction || 0) * 20} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Communication Quality</span>
                      <span>{latestHealthScore.communication_quality}/5</span>
                    </div>
                    <Progress value={(latestHealthScore.communication_quality || 0) * 20} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Conflict Level</span>
                      <span>{latestHealthScore.conflict_level}/5</span>
                    </div>
                    <Progress value={(latestHealthScore.conflict_level || 0) * 20} className="h-2" />
                  </div>
                  
                  {latestHealthScore.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {latestHealthScore.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
