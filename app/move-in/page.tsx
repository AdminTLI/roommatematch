// Move-in Planner Page - Main page for managing move-in planning

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoveInPlanList, MoveInPlanStats } from '@/app/(components)/move-in-plan-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Calendar, 
  Package,
  Clock,
  TrendingUp,
  Home,
  Users,
  Settings
} from 'lucide-react'
import { 
  getDemoMoveInPlans, 
  getDemoTasks, 
  getDemoExpenses, 
  getDemoTimelineEvents 
} from '@/lib/move-in/utils'
import type { 
  MoveInPlan, 
  MoveInPlanSummary,
  MoveInTask,
  MoveInExpense,
  MoveInTimelineEvent
} from '@/lib/move-in/types'
import { User } from '@supabase/supabase-js'

export default function MoveInPlannerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<MoveInPlan[]>([])
  const [summaries, setSummaries] = useState<MoveInPlanSummary[]>([])
  const [tasks, setTasks] = useState<MoveInTask[]>([])
  const [expenses, setExpenses] = useState<MoveInExpense[]>([])
  const [events, setEvents] = useState<MoveInTimelineEvent[]>([])
  const [activeTab, setActiveTab] = useState('plans')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        setUser(user)

        // For demo purposes, use demo data
        if (user.id === 'demo-user-id') {
          setPlans(getDemoMoveInPlans())
          setTasks(getDemoTasks())
          setExpenses(getDemoExpenses())
          setEvents(getDemoTimelineEvents())
          
          // Create mock summaries
          const mockSummaries: MoveInPlanSummary[] = [
            {
              plan_id: '1',
              title: 'Spring 2024 Move-in',
              status: 'in_progress',
              move_in_date: '2024-03-15',
              total_tasks: 3,
              completed_tasks: 1,
              total_expenses: 1350,
              paid_expenses: 1200,
              total_participants: 2,
              completion_percentage: 33.3
            },
            {
              plan_id: '2',
              title: 'Summer Move-in Plan',
              status: 'planning',
              move_in_date: '2024-06-01',
              total_tasks: 0,
              completed_tasks: 0,
              total_expenses: 0,
              paid_expenses: 0,
              total_participants: 1,
              completion_percentage: 0
            }
          ]
          setSummaries(mockSummaries)
        } else {
          // TODO: Load real data from Supabase
          // const userPlans = await getMoveInPlansForUser(user.id)
          // const userTasks = await getMoveInTasks(user.id)
          // const userExpenses = await getMoveInExpenses(user.id)
          // const userEvents = await getMoveInTimelineEvents(user.id)
          // setPlans(userPlans)
          // setTasks(userTasks)
          // setExpenses(userExpenses)
          // setEvents(userEvents)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleCreatePlan = () => {
    router.push('/move-in/create')
  }

  const handleViewPlan = (id: string) => {
    router.push(`/move-in/${id}`)
  }

  const handleEditPlan = (id: string) => {
    router.push(`/move-in/${id}/edit`)
  }

  const handleDeletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  const handleSharePlan = (id: string) => {
    // TODO: Implement share functionality
    console.log('Share plan:', id)
  }

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date)
    const today = new Date()
    return eventDate >= today && event.status === 'scheduled'
  }).slice(0, 3)

  const recentTasks = tasks.filter(task => task.status === 'in_progress' || task.status === 'pending').slice(0, 5)

  const pendingExpenses = expenses.filter(expense => expense.payment_status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading move-in plans...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h1 text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-body-lg text-gray-600 mb-6">
            Please sign in to view your move-in plans.
          </p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-h1 text-gray-900">
            Move-in Planner
          </h1>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            Plan and coordinate your move with roommates. Track tasks, expenses, and timeline events.
          </p>
          
          <Button onClick={handleCreatePlan} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">My Plans</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-8">
            <MoveInPlanStats 
              plans={plans}
              summaries={summaries}
            />
            
            <MoveInPlanList
              plans={plans}
              summaries={summaries}
              currentUserId={user.id}
              onView={handleViewPlan}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              onShare={handleSharePlan}
            />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-body-sm text-gray-600">
                              {new Date(event.event_date).toLocaleDateString()}
                              {event.location && ` • ${event.location}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No upcoming events
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-4">
                      {recentTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-success-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {task.title}
                            </div>
                            <div className="text-body-sm text-gray-600">
                              {task.category} • {task.priority} priority
                              {task.due_date && ` • Due ${new Date(task.due_date).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="text-body-xs text-gray-500">
                            {task.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No recent tasks
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pending Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Pending Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingExpenses.length > 0 ? (
                    <div className="space-y-4">
                      {pendingExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-warning-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {expense.title}
                            </div>
                            <div className="text-body-sm text-gray-600">
                              {expense.category}
                              {expense.due_date && ` • Due ${new Date(expense.due_date).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="text-body-sm font-medium text-gray-900">
                            €{expense.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No pending expenses
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Plans</span>
                      <span className="font-medium">{plans.filter(p => p.status === 'in_progress').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Tasks</span>
                      <span className="font-medium">{tasks.filter(t => t.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Expenses</span>
                      <span className="font-medium">€{expenses.reduce((sum, e) => sum + e.amount, 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-body-sm text-gray-600 mt-1">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-body-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                              {task.category}
                            </span>
                            <span className="text-body-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                              {task.priority}
                            </span>
                            <span className="text-body-xs px-2 py-1 bg-success-100 text-success-800 rounded">
                              {task.status}
                            </span>
                          </div>
                        </div>
                        {task.due_date && (
                          <div className="text-body-sm text-gray-600">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-12">
                    No tasks found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>All Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-success-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {expense.title}
                          </div>
                          {expense.description && (
                            <div className="text-body-sm text-gray-600 mt-1">
                              {expense.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-body-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                              {expense.category}
                            </span>
                            <span className={`text-body-xs px-2 py-1 rounded ${
                              expense.payment_status === 'paid' 
                                ? 'bg-success-100 text-success-800'
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {expense.payment_status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            €{expense.amount}
                          </div>
                          {expense.due_date && (
                            <div className="text-body-sm text-gray-600">
                              Due: {new Date(expense.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-12">
                    No expenses found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}