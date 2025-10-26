'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar,
  ArrowRight,
  Plus,
  Star,
  Heart,
  Bell,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { DashboardData } from '@/types/dashboard'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface DashboardContentProps {
  hasCompletedQuestionnaire?: boolean
  hasPartialProgress?: boolean
  progressCount?: number
  profileCompletion?: number
  questionnaireProgress?: {
    completedSections: number
    totalSections: number
    isSubmitted: boolean
  }
  dashboardData: DashboardData
  user?: {
    id: string
    email: string
    email_confirmed_at?: string
    name?: string
    avatar?: string
  }
}

export function DashboardContent({ hasCompletedQuestionnaire = false, hasPartialProgress = false, progressCount = 0, profileCompletion = 0, questionnaireProgress, dashboardData, user }: DashboardContentProps) {
  const router = useRouter()

  const handleBrowseMatches = () => {
    router.push('/matches')
  }

  const handleStartChat = () => {
    router.push('/chat')
  }

  const handleScheduleTour = () => {
    router.push('/housing')
  }

  const handleUpdateProfile = () => {
    router.push('/settings')
  }

  const handleViewAllActivity = () => {
    router.push('/matches')
  }

  const handleChatWithMatch = (userId: string) => {
    // Navigate to chat with this user
    router.push(`/chat?user=${userId}`)
  }

  return (
    <div className="space-y-8">
      {/* Email verification warning */}
      {user && !user.email_confirmed_at && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border rounded-lg p-4 bg-red-50 border-red-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                Email Verification Required
              </h3>
              <p className="text-sm mt-1 text-red-800">
                Please verify your email address to submit the questionnaire and access all features.
              </p>
              <Button 
                asChild
                className="mt-3"
                variant="default"
              >
                <a href="/settings">
                  Go to Settings to Verify Email
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Show prompt if questionnaire not completed */}
      {!hasCompletedQuestionnaire && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`border rounded-lg p-4 ${
            hasPartialProgress 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${
              hasPartialProgress ? 'text-blue-600' : 'text-yellow-600'
            }`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${
                hasPartialProgress ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                {hasPartialProgress ? 'Update Your Compatibility Profile' : 'Complete Your Compatibility Test'}
              </h3>
              <p className={`text-sm mt-1 ${
                hasPartialProgress ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {hasPartialProgress 
                  ? `Your profile is missing some information. Update your questionnaire to ensure accurate matching.`
                  : 'To find the best roommate matches, please complete our compatibility questionnaire.'
                }
              </p>
              <Button 
                asChild
                className="mt-3"
                variant="default"
              >
                <a href={hasPartialProgress ? "/onboarding?mode=edit" : "/onboarding"}>
                  {hasPartialProgress ? 'Update Profile' : 'Start Questionnaire'}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-lg text-gray-600 mt-1">Here's what's happening with your matches today.</p>
          </div>
        </motion.div>
        
        {/* Summary Badges - Real Data */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
          {dashboardData.summary.newMatchesCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <Star className="w-3 h-3" />
              {dashboardData.summary.newMatchesCount} new {dashboardData.summary.newMatchesCount === 1 ? 'match' : 'matches'} found
            </div>
          )}
          {dashboardData.summary.unreadMessagesCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <MessageCircle className="w-3 h-3" />
              {dashboardData.summary.unreadMessagesCount} unread {dashboardData.summary.unreadMessagesCount === 1 ? 'message' : 'messages'}
            </div>
          )}
          {/* Profile Completion Badge */}
          {profileCompletion < 100 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              <TrendingUp className="w-3 h-3" />
              Profile {profileCompletion}% complete
            </div>
          )}
          {/* Questionnaire Progress Badge */}
          {questionnaireProgress && !questionnaireProgress.isSubmitted && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <FileText className="w-3 h-3" />
              Questionnaire {questionnaireProgress.completedSections}/{questionnaireProgress.totalSections} sections
            </div>
          )}
          {dashboardData.summary.newMatchesCount === 0 && dashboardData.summary.unreadMessagesCount === 0 && profileCompletion === 100 && (!questionnaireProgress || questionnaireProgress.isSubmitted) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <Star className="w-3 h-3" />
              All caught up!
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Stats Cards - Real Data */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">
              {dashboardData.kpis.avgCompatibility > 0 ? `${dashboardData.kpis.avgCompatibility}%` : '-'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Compatibility</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{dashboardData.kpis.totalMatches}</div>
            <div className="text-sm text-gray-600 mt-1">Total Matches</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{dashboardData.kpis.activeChats}</div>
            <div className="text-sm text-gray-600 mt-1">Active Chats</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{dashboardData.kpis.toursScheduled}</div>
            <div className="text-sm text-gray-600 mt-1">Tours Scheduled</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Top Matches - Real Data */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Top Matches</h3>
              <button 
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium" 
                onClick={handleBrowseMatches}
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {dashboardData.topMatches.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{match.score}%</div>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{match.name}</h4>
                        <p className="text-sm text-gray-600">{match.program} • {match.university}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <button 
                          onClick={() => handleChatWithMatch(match.userId)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No matches yet"
                description="Complete your profile and questionnaire to find compatible roommates"
                action={{
                  label: "Browse Matches",
                  onClick: handleBrowseMatches
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Recent Activity - Real Data */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button 
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium" 
                onClick={handleViewAllActivity}
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {activity.user[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user} • {activity.timeAgo}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      activity.type === 'match' ? 'bg-green-100 text-green-800' : 
                      activity.type === 'message' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'housing' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.type}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No recent activity"
                description="Your activity feed will appear here once you start matching and chatting"
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
                onClick={handleBrowseMatches}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Browse Matches</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                onClick={handleStartChat}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Start Chat</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                onClick={handleScheduleTour}
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Schedule Tour</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                onClick={handleUpdateProfile}
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Update Profile</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
