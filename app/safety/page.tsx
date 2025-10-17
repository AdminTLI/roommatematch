// Safety Page - Main page for managing safety incidents and wellness checks

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SafetyIncidentList, SafetyStats } from '@/app/(components)/safety-incident-card'
import { WellnessCheckList, WellnessStats } from '@/app/(components)/wellness-check-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Shield, 
  Heart, 
  AlertTriangle,
  Phone,
  HelpCircle,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import { 
  getDemoSafetyIncidents, 
  getDemoWellnessChecks, 
  getDemoEmergencyContacts 
} from '@/lib/safety/utils'
import type { 
  SafetyIncident, 
  WellnessCheck, 
  EmergencyContact,
  UserSafetySummary
} from '@/lib/safety/types'
import { User } from '@supabase/supabase-js'

export default function SafetyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<SafetyIncident[]>([])
  const [wellnessChecks, setWellnessChecks] = useState<WellnessCheck[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [safetySummary, setSafetySummary] = useState<UserSafetySummary | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

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
          setIncidents(getDemoSafetyIncidents())
          setWellnessChecks(getDemoWellnessChecks())
          setEmergencyContacts(getDemoEmergencyContacts())
          
          // Create mock safety summary
          const mockSummary: UserSafetySummary = {
            user_id: user.id,
            total_incidents: 2,
            open_incidents: 1,
            resolved_incidents: 1,
            last_wellness_check: '2024-01-15T14:00:00Z',
            average_wellness_score: 6.5,
            risk_level: 'medium',
            emergency_contacts_count: 2
          }
          setSafetySummary(mockSummary)
        } else {
          // TODO: Load real data from Supabase
          // const userIncidents = await getSafetyIncidents(user.id)
          // const userWellnessChecks = await getWellnessChecks(user.id)
          // const userEmergencyContacts = await getEmergencyContacts(user.id)
          // const userSafetySummary = await getUserSafetySummary(user.id)
          // setIncidents(userIncidents)
          // setWellnessChecks(userWellnessChecks)
          // setEmergencyContacts(userEmergencyContacts)
          // setSafetySummary(userSafetySummary)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleCreateIncident = () => {
    router.push('/safety/report')
  }

  const handleCreateWellnessCheck = () => {
    router.push('/safety/wellness-check')
  }

  const handleViewIncident = (id: string) => {
    router.push(`/safety/incidents/${id}`)
  }

  const handleUpdateIncident = (id: string) => {
    router.push(`/safety/incidents/${id}/update`)
  }

  const handleContactIncident = (id: string) => {
    // TODO: Implement contact functionality
    console.log('Contact incident:', id)
  }

  const handleCompleteWellnessCheck = (id: string) => {
    router.push(`/safety/wellness-checks/${id}/complete`)
  }

  const handleViewWellnessCheck = (id: string) => {
    router.push(`/safety/wellness-checks/${id}`)
  }

  const handleEmergencyCall = () => {
    // TODO: Implement emergency call functionality
    console.log('Emergency call initiated')
  }

  const recentIncidents = incidents.slice(0, 3)
  const pendingWellnessChecks = wellnessChecks.filter(check => check.status === 'pending')
  const criticalIncidents = incidents.filter(incident => incident.severity_level === 'critical')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading safety information...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access safety features.
          </p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Safety & Wellness
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Report incidents, manage wellness, and access emergency resources.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateWellnessCheck}>
                <Heart className="h-4 w-4 mr-2" />
                Wellness Check
              </Button>
              <Button onClick={handleCreateIncident}>
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="mb-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Emergency Assistance
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      If you're in immediate danger, contact emergency services.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleEmergencyCall}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Safety Summary */}
            {safetySummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {safetySummary.total_incidents}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Incidents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {safetySummary.open_incidents}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Open Incidents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {safetySummary.resolved_incidents}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Resolved
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Heart className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {safetySummary.average_wellness_score?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Wellness Score
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Incidents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Recent Incidents
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('incidents')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentIncidents.length > 0 ? (
                    <div className="space-y-3">
                      {recentIncidents.map((incident) => (
                        <div key={incident.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {incident.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {incident.severity_level} • {incident.status}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(incident.reported_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No recent incidents
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pending Wellness Checks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Wellness Status
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('wellness')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingWellnessChecks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingWellnessChecks.map((check) => (
                        <div key={check.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <Heart className="h-4 w-4 text-pink-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              Wellness Check Pending
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {check.check_type} • {check.trigger_reason}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleCompleteWellnessCheck(check.id)}>
                            Complete
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        All wellness checks up to date
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Emergency Contacts
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('contacts')}>
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-3">
                      {emergencyContacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {contact.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.contact_type} • {contact.relationship}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {contact.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No emergency contacts set up
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleCreateIncident}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Report Safety Concern
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleCreateWellnessCheck}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Check Wellness
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('contacts')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Contacts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="incidents" className="space-y-6">
            <SafetyStats incidents={incidents} />
            
            <SafetyIncidentList
              incidents={incidents}
              currentUserId={user.id}
              onView={handleViewIncident}
              onUpdate={handleUpdateIncident}
              onContact={handleContactIncident}
            />
          </TabsContent>
          
          <TabsContent value="wellness" className="space-y-6">
            <WellnessStats checks={wellnessChecks} />
            
            <WellnessCheckList
              checks={wellnessChecks}
              currentUserId={user.id}
              onComplete={handleCompleteWellnessCheck}
              onView={handleViewWellnessCheck}
            />
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Emergency Contacts</CardTitle>
                  <Button onClick={() => router.push('/safety/contacts/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length > 0 ? (
                  <div className="space-y-4">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.contact_type} • {contact.relationship}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.phone} • {contact.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Order: {contact.escalation_order}
                          </div>
                          {contact.auto_contact && (
                            <Badge variant="outline" className="text-xs">
                              Auto-contact
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Emergency Contacts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add emergency contacts for quick access in case of emergencies.
                    </p>
                    <Button onClick={() => router.push('/safety/contacts/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
