'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  MessageCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Plus,
  CheckCircle
} from 'lucide-react'
import { RelationalHealthScore } from '@/lib/matching/debrief'

interface RelationalHealthTrackerProps {
  debriefId: string
  healthScores: RelationalHealthScore[]
  onUpdateHealth: (debriefId: string, weekNumber: number, healthData: Partial<RelationalHealthScore>) => void
  onTrackEngagement: (debriefId: string, eventType: string, eventData?: any) => void
}

export function RelationalHealthTracker({
  debriefId,
  healthScores,
  onUpdateHealth,
  onTrackEngagement
}: RelationalHealthTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    week_number: 1,
    overall_satisfaction: 0,
    communication_quality: 0,
    conflict_level: 0,
    shared_activities: 0,
    notes: ''
  })

  const latestWeek = Math.max(...healthScores.map(h => h.week_number), 0)
  const nextWeekNumber = latestWeek + 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onUpdateHealth(debriefId, formData.week_number, {
        overall_satisfaction: formData.overall_satisfaction,
        communication_quality: formData.communication_quality,
        conflict_level: formData.conflict_level,
        shared_activities: formData.shared_activities,
        notes: formData.notes
      })

      onTrackEngagement(debriefId, 'health_updated', {
        week_number: formData.week_number,
        overall_satisfaction: formData.overall_satisfaction
      })

      setFormData({
        week_number: nextWeekNumber + 1,
        overall_satisfaction: 0,
        communication_quality: 0,
        conflict_level: 0,
        shared_activities: 0,
        notes: ''
      })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to update health:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getHealthStatus = (score: number) => {
    if (score >= 4) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' }
    if (score >= 3) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' }
    if (score >= 2) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' }
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' }
  }

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-600', label: 'Improving' }
    if (current < previous) return { icon: AlertTriangle, color: 'text-red-600', label: 'Declining' }
    return { icon: CheckCircle, color: 'text-blue-600', label: 'Stable' }
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      {healthScores.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Relational Health Overview
            </CardTitle>
            <CardDescription>
              Track how your roommate relationship is progressing over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthScores
              .sort((a, b) => b.week_number - a.week_number)
              .slice(0, 3)
              .map((score, index) => {
                const status = getHealthStatus(score.overall_satisfaction || 0)
                const previousScore = healthScores.find(s => s.week_number === score.week_number - 1)
                const trend = previousScore ? getTrend(
                  score.overall_satisfaction || 0, 
                  previousScore.overall_satisfaction || 0
                ) : null

                return (
                  <div key={score.id} className={`p-4 rounded-lg border ${status.bg} ${index === 0 ? 'border-2' : 'border'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Week {score.week_number}</span>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">Latest</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                        {trend && (
                          <div className={`flex items-center gap-1 text-xs ${trend.color}`}>
                            <trend.icon className="h-3 w-3" />
                            {trend.label}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Satisfaction</span>
                          <span>{score.overall_satisfaction}/5</span>
                        </div>
                        <Progress value={(score.overall_satisfaction || 0) * 20} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Communication</span>
                          <span>{score.communication_quality}/5</span>
                        </div>
                        <Progress value={(score.communication_quality || 0) * 20} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Conflict Level</span>
                          <span>{score.conflict_level}/5</span>
                        </div>
                        <Progress value={(score.conflict_level || 0) * 20} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Shared Activities</span>
                          <span>{score.shared_activities}/5</span>
                        </div>
                        <Progress value={(score.shared_activities || 0) * 20} className="h-2" />
                      </div>
                    </div>

                    {score.notes && (
                      <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                        <strong>Notes:</strong> {score.notes}
                      </div>
                    )}
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* Add New Entry */}
      {!showForm ? (
        <Button 
          onClick={() => setShowForm(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Week {nextWeekNumber} Health Check
        </Button>
      ) : (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Week {nextWeekNumber} Health Check</CardTitle>
            <CardDescription>
              How has your roommate relationship been this week?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overall_satisfaction">Overall Satisfaction</Label>
                  <Input
                    id="overall_satisfaction"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.overall_satisfaction}
                    onChange={(e) => setFormData(prev => ({ ...prev, overall_satisfaction: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - Poor</span>
                    <span className="font-medium">{formData.overall_satisfaction}/5</span>
                    <span>5 - Excellent</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="communication_quality">Communication Quality</Label>
                  <Input
                    id="communication_quality"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.communication_quality}
                    onChange={(e) => setFormData(prev => ({ ...prev, communication_quality: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - Poor</span>
                    <span className="font-medium">{formData.communication_quality}/5</span>
                    <span>5 - Excellent</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="conflict_level">Conflict Level</Label>
                  <Input
                    id="conflict_level"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.conflict_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, conflict_level: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - None</span>
                    <span className="font-medium">{formData.conflict_level}/5</span>
                    <span>5 - High</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="shared_activities">Shared Activities</Label>
                  <Input
                    id="shared_activities"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.shared_activities}
                    onChange={(e) => setFormData(prev => ({ ...prev, shared_activities: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - None</span>
                    <span className="font-medium">{formData.shared_activities}/5</span>
                    <span>5 - Many</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific observations about your roommate relationship this week..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Saving...' : 'Save Health Check'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Building Healthy Relationships
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Regular check-ins help identify issues early</li>
                <li>• Open communication is key to resolving conflicts</li>
                <li>• Shared activities build stronger connections</li>
                <li>• Be honest about your needs and boundaries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
