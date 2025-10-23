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
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
}

export function DashboardContent({ hasCompletedQuestionnaire = false }: DashboardContentProps) {
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

  return (
    <div className="space-y-8">
      {/* Show prompt if questionnaire not completed */}
      {!hasCompletedQuestionnaire && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Complete Your Compatibility Test</h3>
              <p className="text-sm text-yellow-800 mt-1">
                To find the best roommate matches, please complete our compatibility questionnaire.
              </p>
              <Button 
                asChild
                className="mt-3"
                variant="default"
              >
                <a href="/onboarding">Start Questionnaire</a>
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
        
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            <Star className="w-3 h-3" />
            3 new matches found
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            <MessageCircle className="w-3 h-3" />
            5 unread messages
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            <TrendingUp className="w-3 h-3" />
            Profile 78% complete
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">94%</div>
            <div className="text-sm text-gray-600 mt-1">Compatibility Score</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600 mt-1">Total Matches</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600 mt-1">Active Chats</div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">3</div>
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
        {/* Top Matches */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Top Matches</h3>
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={handleBrowseMatches}>
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Emma", score: 94, program: "Computer Science", university: "TU Delft" },
                { name: "Lucas", score: 89, program: "Engineering", university: "Eindhoven" },
                { name: "Sofia", score: 87, program: "Business", university: "Rotterdam" }
              ].map((match, index) => (
                <div key={match.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{match.score}%</div>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {match.name[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{match.name}</h4>
                      <p className="text-sm text-gray-600">{match.program} • {match.university}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeInUp}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={handleViewAllActivity}>
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { 
                  action: "New match found", 
                  user: "Emma van der Berg", 
                  time: "2 hours ago",
                  type: "match"
                },
                { 
                  action: "Message received", 
                  user: "Lucas Janssen", 
                  time: "4 hours ago",
                  type: "message"
                },
                { 
                  action: "Profile updated", 
                  user: "You", 
                  time: "1 day ago",
                  type: "profile"
                },
                { 
                  action: "Housing tour scheduled", 
                  user: "Sofia Rodriguez", 
                  time: "2 days ago",
                  type: "housing"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {activity.user[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.type === 'match' ? 'bg-green-100 text-green-800' : 
                    activity.type === 'message' ? 'bg-blue-100 text-blue-800' : 
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
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
              <button className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleBrowseMatches}>
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Browse Matches</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleStartChat}>
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Start Chat</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleScheduleTour}>
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Schedule Tour</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-2 h-20 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleUpdateProfile}>
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
