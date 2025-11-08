'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, MessageSquare, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'

interface Metrics {
  totalUsers: number
  verifiedUsers: number
  activeChats: number
  totalMatches: number
  reportsPending: number
  signupsLast7Days: number
  signupsLast30Days: number
  verificationRate: number
  matchActivity: number
}

export function AdminMetricsContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      // Use the existing analytics RPC function
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        // Fallback to mock data if API fails
        setMetrics({
          totalUsers: 0,
          verifiedUsers: 0,
          activeChats: 0,
          totalMatches: 0,
          reportsPending: 0,
          signupsLast7Days: 0,
          signupsLast30Days: 0,
          verificationRate: 0,
          matchActivity: 0
        })
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
      setMetrics({
        totalUsers: 0,
        verifiedUsers: 0,
        activeChats: 0,
        totalMatches: 0,
        reportsPending: 0,
        signupsLast7Days: 0,
        signupsLast30Days: 0,
        verificationRate: 0,
        matchActivity: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading metrics...</div>
  }

  if (!metrics) {
    return <div className="p-6">Failed to load metrics</div>
  }

  const verificationRate = metrics.totalUsers > 0 
    ? ((metrics.verifiedUsers / metrics.totalUsers) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Metrics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform analytics and performance metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.signupsLast7Days} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {verificationRate}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeChats.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMatches.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.matchActivity} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>User verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Verified</span>
                </div>
                <Badge variant="default">{metrics.verifiedUsers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Unverified</span>
                </div>
                <Badge variant="secondary">
                  {metrics.totalUsers - metrics.verifiedUsers}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Verification Rate</span>
                  <span className="font-medium">{verificationRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Pending abuse reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Pending Review</span>
                <Badge variant={metrics.reportsPending > 0 ? 'destructive' : 'default'}>
                  {metrics.reportsPending}
                </Badge>
              </div>
              {metrics.reportsPending > 0 && (
                <p className="text-sm text-muted-foreground">
                  Action required: {metrics.reportsPending} report{metrics.reportsPending !== 1 ? 's' : ''} awaiting review
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
          <CardDescription>User acquisition and activity trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">New Users (7 days)</p>
              <p className="text-2xl font-bold">{metrics.signupsLast7Days}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Users (30 days)</p>
              <p className="text-2xl font-bold">{metrics.signupsLast30Days}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Match Activity (7 days)</p>
              <p className="text-2xl font-bold">{metrics.matchActivity}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
