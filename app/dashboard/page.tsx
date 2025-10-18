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
  Settings,
  Bell
} from 'lucide-react'

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

export default function DashboardPage() {
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
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Roommate Match</h2>
              <p className="text-body-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            <a href="#" className="nav-item active">
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="nav-item" onClick={handleBrowseMatches}>
              <Users className="w-5 h-5" />
              <span>Matches</span>
            </a>
            <a href="#" className="nav-item" onClick={handleStartChat}>
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </a>
            <a href="#" className="nav-item" onClick={handleScheduleTour}>
              <Calendar className="w-5 h-5" />
              <span>Housing</span>
            </a>
            <a href="#" className="nav-item">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="space-y-6"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 text-gray-900">Welcome back, Demo User!</h1>
                <p className="text-body text-gray-600">Here's what's happening with your matches today.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn btn-ghost btn-sm">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  D
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              <div className="badge badge-success flex items-center gap-2">
                <Star className="w-3 h-3" />
                3 new matches found
              </div>
              <div className="badge badge-secondary flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                5 unread messages
              </div>
              <div className="badge badge-primary flex items-center gap-2">
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
            className="dashboard-stats"
          >
            <motion.div variants={fadeInUp}>
              <div className="stat-card">
                <div className="stat-number">94%</div>
                <div className="stat-label">Compatibility Score</div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <div className="stat-card">
                <div className="stat-number">12</div>
                <div className="stat-label">Total Matches</div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <div className="stat-card">
                <div className="stat-number">5</div>
                <div className="stat-label">Active Chats</div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <div className="stat-card">
                <div className="stat-number">3</div>
                <div className="stat-label">Tours Scheduled</div>
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
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-h3 text-gray-900">Your Top Matches</h3>
                  <button className="btn btn-ghost btn-sm" onClick={handleBrowseMatches}>
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
                    <div key={match.name} className="match-card">
                      <div className="match-score">{match.score}%</div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {match.name[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{match.name}</h4>
                          <p className="text-body-sm text-gray-600">{match.program} • {match.university}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-rose-500" />
                          <button className="btn btn-primary btn-sm">
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
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-h3 text-gray-900">Recent Activity</h3>
                  <button className="btn btn-ghost btn-sm" onClick={handleViewAllActivity}>
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
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {activity.user[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-body-sm text-gray-600">{activity.user} • {activity.time}</p>
                      </div>
                      <div className={`badge ${activity.type === 'match' ? 'badge-success' : activity.type === 'message' ? 'badge-secondary' : 'badge-primary'}`}>
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
              <div className="dashboard-card">
                <h3 className="text-h3 text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="btn btn-primary h-20 flex-col gap-2" onClick={handleBrowseMatches}>
                    <Users className="w-6 h-6" />
                    <span>Browse Matches</span>
                  </button>
                  
                  <button className="btn btn-outline h-20 flex-col gap-2" onClick={handleStartChat}>
                    <MessageCircle className="w-6 h-6" />
                    <span>Start Chat</span>
                  </button>
                  
                  <button className="btn btn-outline h-20 flex-col gap-2" onClick={handleScheduleTour}>
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Tour</span>
                  </button>
                  
                  <button className="btn btn-outline h-20 flex-col gap-2" onClick={handleUpdateProfile}>
                    <Plus className="w-6 h-6" />
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}