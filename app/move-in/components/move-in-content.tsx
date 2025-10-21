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
  Users, 
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Home,
  Truck,
  Package,
  Settings
} from 'lucide-react'
import type { MoveInPlan, MoveInTask, MoveInExpense } from '@/lib/move-in/types'
import { User } from '@supabase/supabase-js'

export function MoveInContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<MoveInPlan[]>([])
  const [activeTab, setActiveTab] = useState('my-plans')

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    // Load demo data
    setPlans([
      {
        id: 'plan-1',
        title: 'Amsterdam Apartment Move',
        description: 'Moving to new shared apartment in Amsterdam',
        status: 'in_progress',
        start_date: '2024-02-01',
        end_date: '2024-02-15',
        budget: 1500,
        created_by: user?.id || 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: ['demo-user', 'user-2'],
        tasks: [],
        expenses: [],
        location: 'Amsterdam, Netherlands',
        notes: 'Moving with roommate Emma'
      }
    ])
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Move-in Planner</h1>
          <p className="text-lg text-gray-600 mt-1">Plan and coordinate your move with roommates</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">€1,500</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-plans">My Plans</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="my-plans" className="space-y-6">
          <MoveInPlanList 
            plans={plans}
            onEdit={(plan) => {
              // Handle edit
            }}
            onDelete={(plan) => {
              setPlans(prev => prev.filter(p => p.id !== plan.id))
            }}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">12 tasks completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3 tasks in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">1 task overdue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <MoveInPlanStats plans={plans} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
