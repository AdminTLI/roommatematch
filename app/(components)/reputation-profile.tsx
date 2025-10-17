// Reputation Profile Component - Main component for displaying user reputation

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Shield, 
  MessageCircle, 
  Sparkles, 
  CheckCircle, 
  Heart, 
  CreditCard,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Eye,
  EyeOff
} from 'lucide-react'
import { TrustBadge, TrustBadgeList, ReputationScore, ReputationSummary } from './trust-badge'
import { EndorsementList, EndorsementStats, CategoryBreakdown } from './endorsement-card'
import { ReferenceList, ReferenceStats } from './reference-card'
import type { UserReputationSummary } from '@/lib/reputation/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ReputationProfileProps {
  userReputation: UserReputationSummary
  endorsements?: any[]
  references?: any[]
  isOwnProfile?: boolean
  className?: string
}

export function ReputationProfile({ 
  userReputation,
  endorsements = [],
  references = [],
  isOwnProfile = false,
  className 
}: ReputationProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showPrivateInfo, setShowPrivateInfo] = useState(isOwnProfile)

  const tier = userReputation.overall_score >= 90 ? 'excellent' : 
               userReputation.overall_score >= 80 ? 'very_good' : 
               userReputation.overall_score >= 70 ? 'good' : 
               userReputation.overall_score >= 60 ? 'fair' : 'poor'

  const tierColors = {
    excellent: 'from-green-50 to-green-100 border-green-200',
    very_good: 'from-blue-50 to-blue-100 border-blue-200',
    good: 'from-indigo-50 to-indigo-100 border-indigo-200',
    fair: 'from-yellow-50 to-yellow-100 border-yellow-200',
    poor: 'from-red-50 to-red-100 border-red-200'
  }

  const topCategories = Object.entries(userReputation.top_categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const categoryIcons = {
    cleanliness: Sparkles,
    communication: MessageCircle,
    responsibility: CheckCircle,
    respect: Heart,
    reliability: Shield,
    financial_trust: CreditCard
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card className={cn('bg-gradient-to-r border', tierColors[tier as keyof typeof tierColors])}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/80 flex items-center justify-center">
                <Award className="h-8 w-8 text-gray-700" />
              </div>
              
              <div>
                <CardTitle className="text-xl text-gray-900">
                  Reputation Profile
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <ReputationScore 
                    score={userReputation.overall_score} 
                    size="lg"
                  />
                  <Badge variant="secondary" className="capitalize">
                    {tier} Match
                  </Badge>
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                className="bg-white/80"
              >
                {showPrivateInfo ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Private
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Private
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {userReputation.total_endorsements}
              </div>
              <div className="text-sm text-gray-700">
                Endorsements
              </div>
            </div>
            
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {userReputation.total_references}
              </div>
              <div className="text-sm text-gray-700">
                References
              </div>
            </div>
            
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {userReputation.average_rating.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-700">
                Average Rating
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      {userReputation.trust_badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Trust Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrustBadgeList 
              badges={userReputation.trust_badges}
              maxDisplay={6}
              size="md"
            />
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, score]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons]
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {categoryName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                        {Math.round(score)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed view */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endorsements">
              Endorsements ({userReputation.total_endorsements})
            </TabsTrigger>
            <TabsTrigger value="references">
              References ({userReputation.total_references})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EndorsementStats endorsements={endorsements} />
              <ReferenceStats references={references} />
            </div>
            
            {endorsements.length > 0 && (
              <CategoryBreakdown endorsements={endorsements} />
            )}
          </TabsContent>
          
          <TabsContent value="endorsements" className="space-y-4">
            <EndorsementList 
              endorsements={endorsements}
              showEndorser={showPrivateInfo}
              maxDisplay={10}
            />
          </TabsContent>
          
          <TabsContent value="references" className="space-y-4">
            <ReferenceList 
              references={references}
              showReferrer={showPrivateInfo}
              maxDisplay={5}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

interface ReputationPreviewProps {
  userReputation: UserReputationSummary
  className?: string
}

export function ReputationPreview({ userReputation, className }: ReputationPreviewProps) {
  const tier = userReputation.overall_score >= 90 ? 'excellent' : 
               userReputation.overall_score >= 80 ? 'very_good' : 
               userReputation.overall_score >= 70 ? 'good' : 
               userReputation.overall_score >= 60 ? 'fair' : 'poor'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ReputationScore score={userReputation.overall_score} size="sm" />
      
      {userReputation.trust_badges.length > 0 && (
        <TrustBadgeList 
          badges={userReputation.trust_badges.slice(0, 2)}
          maxDisplay={2}
          showLevel={false}
          size="sm"
        />
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {userReputation.total_endorsements} endorsements, {userReputation.total_references} references
      </div>
    </div>
  )
}

interface ReputationInsightsProps {
  userReputation: UserReputationSummary
  className?: string
}

export function ReputationInsights({ userReputation, className }: ReputationInsightsProps) {
  const insights = []
  
  if (userReputation.overall_score >= 90) {
    insights.push({
      type: 'excellent',
      icon: Award,
      title: 'Exceptional Reputation',
      description: 'This user has an outstanding reputation with excellent ratings across all categories.'
    })
  }
  
  if (userReputation.trust_badges.length >= 3) {
    insights.push({
      type: 'badges',
      icon: Shield,
      title: 'Multiple Trust Badges',
      description: 'Earned several trust badges, demonstrating consistent positive behavior.'
    })
  }
  
  if (userReputation.total_references >= 2) {
    insights.push({
      type: 'references',
      icon: MessageCircle,
      title: 'Strong References',
      description: 'Has detailed references from multiple sources, indicating reliability.'
    })
  }
  
  const topCategory = Object.entries(userReputation.top_categories)
    .sort(([,a], [,b]) => b - a)[0]
  
  if (topCategory && topCategory[1] >= 90) {
    insights.push({
      type: 'strength',
      icon: Star,
      title: 'Outstanding Strength',
      description: `Exceptional in ${topCategory[0].replace('_', ' ')} with ${Math.round(topCategory[1])}% rating.`
    })
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Reputation Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
