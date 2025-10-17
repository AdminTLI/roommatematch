'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app/shell'
import { 
  CompatibilityScoreWidget,
  TopMatchesWidget,
  FiltersWidget,
  InboxPreviewWidget,
  ProfileCompletenessWidget
} from '@/components/app/widgets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar,
  ArrowRight,
  Plus,
  Star
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

  // Mock user data
  const user = {
    id: 'demo-user-id',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar: 'https://example.com/avatar.jpg'
  }

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
    <AppShell user={user}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-4"
        >
          <motion.div variants={fadeInUp}>
            <h1 className="text-h1 text-ink-900">Welcome back, {user.name}!</h1>
                    <p className="text-h4 text-ink-700">Here&apos;s what&apos;s happening with your matches today.</p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
            <Badge variant="mint" className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              3 new matches found
            </Badge>
            <Badge variant="accent" className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3" />
              5 unread messages
            </Badge>
            <Badge variant="brand" className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Profile 78% complete
            </Badge>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Row 1: Compatibility Score & Top Matches */}
          <motion.div variants={fadeInUp} className="lg:col-span-6">
            <CompatibilityScoreWidget />
          </motion.div>
          
          <motion.div variants={fadeInUp} className="lg:col-span-6">
            <TopMatchesWidget />
          </motion.div>

          {/* Row 2: Filters, Inbox, Profile */}
          <motion.div variants={fadeInUp} className="lg:col-span-4">
            <FiltersWidget />
          </motion.div>
          
          <motion.div variants={fadeInUp} className="lg:col-span-4">
            <InboxPreviewWidget />
          </motion.div>
          
          <motion.div variants={fadeInUp} className="lg:col-span-4">
            <ProfileCompletenessWidget />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2" onClick={handleBrowseMatches}>
                    <Users className="w-6 h-6" />
                    <span>Browse Matches</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleStartChat}>
                    <MessageCircle className="w-6 h-6" />
                    <span>Start Chat</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleScheduleTour}>
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Tour</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleUpdateProfile}>
                    <Plus className="w-6 h-6" />
                    <span>Update Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button variant="ghost" size="sm" onClick={handleViewAllActivity}>
                    View all
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 bg-surface-1 rounded-xl border border-line"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {activity.user[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ink-900">{activity.action}</p>
                        <p className="text-body-sm text-ink-500">{activity.user} • {activity.time}</p>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {activity.type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}
