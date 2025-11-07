'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Star,
  ArrowRight,
  Filter,
  CheckCircle,
  TrendingUp,
  Calendar,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Compatibility Score Widget
export function CompatibilityScoreWidget({ score = 94 }: { score?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="elevated" className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-h4">Compatibility Score</h3>
              <p className="text-body-sm text-ink-500">Your overall match quality</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Circle */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgb(var(--surface-2))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgb(var(--brand-600))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 314} 314`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ink-900">{score}%</div>
                  <div className="text-body-xs text-ink-500">Excellent</div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              {[
                { label: 'Lifestyle', value: 92, color: 'brand' },
                { label: 'Study habits', value: 89, color: 'accent' },
                { label: 'Personality', value: 96, color: 'mint' },
                { label: 'Interests', value: 87, color: 'rose' }
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-ink-700">{item.label}</span>
                    <span className="font-medium text-ink-900">{item.value}%</span>
                  </div>
                  <Progress 
                    value={item.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              View detailed breakdown
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Top Matches Widget
export function TopMatchesWidget() {
  const matches = [
    { 
      name: "Emma", 
      score: 94, 
      program: "Computer Science", 
      university: "TU Delft",
      avatar: "E",
      isOnline: true
    },
    { 
      name: "Lucas", 
      score: 89, 
      program: "Engineering", 
      university: "Eindhoven",
      avatar: "L",
      isOnline: false
    },
    { 
      name: "Sofia", 
      score: 87, 
      program: "Business", 
      university: "Rotterdam",
      avatar: "S",
      isOnline: true
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card variant="elevated" className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-mint-600" />
              </div>
              <div>
                <h3 className="text-h4">Top Matches</h3>
                <p className="text-body-sm text-ink-500">Your best compatibility scores</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <motion.div
                key={match.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-surface-1 rounded-xl border border-line hover:shadow-elev-1 transition-all cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {match.avatar}
                  </div>
                  {match.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mint-500 rounded-full border-2 border-surface-0" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-ink-900 truncate">{match.name}</h4>
                    <Badge variant="mint" size="sm">
                      {match.score}%
                    </Badge>
                  </div>
                  <p className="text-body-sm text-ink-500 truncate">
                    <span>{match.program}</span>
                    <span className="mx-2">•</span>
                    <span>{match.university}</span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Filters Widget
export function FiltersWidget() {
  const activeFilters = 4

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h3 className="text-h4">Filters</h3>
              <p className="text-body-sm text-ink-500">{activeFilters} filters active</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-1 rounded-lg border border-line">
                <div className="text-body-sm font-medium text-ink-700">University</div>
                <div className="text-body-xs text-ink-500">TU Delft</div>
              </div>
              <div className="p-3 bg-surface-1 rounded-lg border border-line">
                <div className="text-body-sm font-medium text-ink-700">Program</div>
                <div className="text-body-xs text-ink-500">Computer Science</div>
              </div>
              <div className="p-3 bg-surface-1 rounded-lg border border-line">
                <div className="text-body-sm font-medium text-ink-700">Year</div>
                <div className="text-body-xs text-ink-500">2nd Year</div>
              </div>
              <div className="p-3 bg-surface-1 rounded-lg border border-line">
                <div className="text-body-sm font-medium text-ink-700">Budget</div>
                <div className="text-body-xs text-ink-500">€400-600</div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Adjust filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Inbox Preview Widget
export function InboxPreviewWidget() {
  const messages = [
    { 
      name: "Emma", 
      message: "Hey! I saw we have similar study schedules...", 
      time: "2m ago",
      unread: true
    },
    { 
      name: "Lucas", 
      message: "Would you be interested in viewing the apartment?", 
      time: "1h ago",
      unread: true
    },
    { 
      name: "Sofia", 
      message: "Thanks for the great chat yesterday!", 
      time: "3h ago",
      unread: false
    }
  ]

  const unreadCount = messages.filter(m => m.unread).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center relative">
                <MessageCircle className="w-5 h-5 text-rose-600" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-h4">Messages</h3>
                <p className="text-body-sm text-ink-500">{unreadCount} unread</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={message.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  message.unread 
                    ? "bg-brand-50 border-brand-200 hover:bg-brand-100" 
                    : "bg-surface-1 border-line hover:bg-surface-2"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {message.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-ink-900 text-body-sm">{message.name}</span>
                      <span className="text-body-xs text-ink-500">{message.time}</span>
                    </div>
                    <p className="text-body-sm text-ink-600 truncate">{message.message}</p>
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Profile Completeness Widget
export function ProfileCompletenessWidget() {
  const completeness = 78
  const steps = [
    { label: "Basic info", completed: true },
    { label: "Photos", completed: true },
    { label: "Lifestyle quiz", completed: true },
    { label: "Study preferences", completed: true },
    { label: "Housing preferences", completed: false },
    { label: "Personality test", completed: false }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <h3 className="text-h4">Profile</h3>
              <p className="text-body-sm text-ink-500">{completeness}% complete</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={completeness} className="h-3" />
            
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    step.completed 
                      ? "bg-mint-500 text-white" 
                      : "bg-surface-2 border border-line"
                  )}>
                    {step.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className={cn(
                    "text-body-sm",
                    step.completed ? "text-ink-700" : "text-ink-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full">
              Complete profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
