'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, CheckCircle, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react'

interface GroupSuggestionCardProps {
  id: string
  members: Array<{
    id: string
    name: string
    avatar?: string
    compatibility: number
  }>
  averageCompatibility: number
  constraints: string[]
  benefits: string[]
  watchOuts: string[]
  onAccept: (id: string) => void
  onOpenGroup: (id: string) => void
}

export function GroupSuggestionCard({
  id,
  members,
  averageCompatibility,
  constraints,
  benefits,
  watchOuts,
  onAccept,
  onOpenGroup
}: GroupSuggestionCardProps) {
  const formatCompatibilityScore = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.85) return 'text-emerald-600'
    if (score >= 0.7) return 'text-indigo-600'
    if (score >= 0.55) return 'text-violet-600'
    return 'text-amber-600'
  }

  return (
    <Card className="border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Suggestion
            </CardTitle>
            <CardDescription>
              {members.length} compatible roommates found
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getCompatibilityColor(averageCompatibility)}`}>
              {formatCompatibilityScore(averageCompatibility)}
            </div>
            <div className="text-sm text-gray-500">
              Average match
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Group Members */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Group Members
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {members.map((member, index) => (
                <div key={member.id} className="relative">
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCompatibilityColor(member.compatibility)}`}
                    >
                      {formatCompatibilityScore(member.compatibility)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {members.map(m => m.name).join(', ')}
              </div>
              <div className="text-xs text-gray-500">
                All verified students
              </div>
            </div>
          </div>
        </div>

        {/* Constraints Met */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Requirements Met
          </h4>
          <div className="space-y-2">
            {constraints.map((constraint, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {constraint}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Why This Group Works
          </h4>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Watch Outs */}
        {watchOuts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Things to Consider
            </h4>
            <div className="space-y-2">
              {watchOuts.map((watchOut, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    {watchOut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenGroup(id)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open Group Chat
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onAccept(id)}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Group
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Accepting this group will create a shared chat where you can all discuss housing options together.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
