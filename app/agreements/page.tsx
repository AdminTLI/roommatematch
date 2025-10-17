// Agreements Page - Main page for managing household agreements

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AgreementList, AgreementStats } from '@/app/(components)/agreement-card'
import { AgreementBuilder } from '@/app/(components)/agreement-builder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  FileText, 
  Users, 
  Settings,
  Home,
  RotateCcw,
  VolumeX,
  DollarSign,
  Car,
  Zap,
  Sparkles
} from 'lucide-react'
import { getDemoAgreements, getDemoParticipants, getDemoTemplates } from '@/lib/agreements/utils'
import type { 
  HouseholdAgreement, 
  AgreementParticipant, 
  AgreementTemplate,
  CreateAgreementData,
  AgreementData
} from '@/lib/agreements/types'
import { AGREEMENT_TEMPLATES } from '@/lib/agreements/types'
import { User } from '@supabase/supabase-js'

export default function AgreementsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [agreements, setAgreements] = useState<HouseholdAgreement[]>([])
  const [participants, setParticipants] = useState<AgreementParticipant[]>([])
  const [templates, setTemplates] = useState<AgreementTemplate[]>([])
  const [activeTab, setActiveTab] = useState('my-agreements')
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AgreementTemplate | undefined>()

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
          setAgreements(getDemoAgreements())
          setParticipants(getDemoParticipants())
          setTemplates(getDemoTemplates())
        } else {
          // TODO: Load real data from Supabase
          // const userAgreements = await getAgreementsForUser(user.id)
          // const userParticipants = await getAgreementParticipants(user.id)
          // const agreementTemplates = await getAgreementTemplates()
          // setAgreements(userAgreements)
          // setParticipants(userParticipants)
          // setTemplates(agreementTemplates)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleCreateAgreement = (template?: AgreementTemplate) => {
    setSelectedTemplate(template)
    setShowBuilder(true)
    setActiveTab('create')
  }

  const handleSaveAgreement = async (data: CreateAgreementData & { agreement_data: AgreementData }) => {
    try {
      // TODO: Save to Supabase
      console.log('Saving agreement:', data)
      
      // For demo, add to local state
      const newAgreement: HouseholdAgreement = {
        id: `agreement-${Date.now()}`,
        title: data.title,
        description: data.description,
        template_id: data.template_id,
        agreement_data: data.agreement_data,
        status: 'draft',
        household_name: data.household_name,
        household_address: data.household_address,
        requires_all_signatures: data.requires_all_signatures || true,
        auto_renewal: data.auto_renewal || false,
        renewal_period_months: data.renewal_period_months || 12,
        needs_admin_review: false,
        created_by: user?.id || 'demo-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setAgreements(prev => [newAgreement, ...prev])
      setShowBuilder(false)
      setSelectedTemplate(undefined)
      setActiveTab('my-agreements')
    } catch (error) {
      console.error('Error saving agreement:', error)
    }
  }

  const handleViewAgreement = (id: string) => {
    router.push(`/agreements/${id}`)
  }

  const handleEditAgreement = (id: string) => {
    const agreement = agreements.find(a => a.id === id)
    if (agreement) {
      // TODO: Implement edit functionality
      console.log('Edit agreement:', agreement)
    }
  }

  const handleDeleteAgreement = (id: string) => {
    setAgreements(prev => prev.filter(a => a.id !== id))
  }

  const handleShareAgreement = (id: string) => {
    // TODO: Implement share functionality
    console.log('Share agreement:', id)
  }

  const templateCategories = Object.entries(AGREEMENT_TEMPLATES).map(([key, config]) => ({
    key,
    ...config,
    icon: {
      house_rules: Home,
      chore_rotation: RotateCcw,
      quiet_hours: VolumeX,
      rent_split: DollarSign,
      guest_policy: Users,
      cleaning_schedule: Sparkles,
      utilities: Zap,
      parking: Car,
      general: FileText
    }[key as keyof typeof AGREEMENT_TEMPLATES]
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agreements...</p>
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
            Please sign in to view your agreements.
          </p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShowBuilder(false)}
              className="mb-4"
            >
              ← Back to Agreements
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create New Agreement
            </h1>
          </div>
          
          <AgreementBuilder
            template={selectedTemplate}
            onSave={handleSaveAgreement}
            onCancel={() => setShowBuilder(false)}
          />
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
                Household Agreements
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage agreements with your roommates.
              </p>
            </div>
            
            <Button onClick={() => handleCreateAgreement()}>
              <Plus className="h-4 w-4 mr-2" />
              New Agreement
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-agreements">My Agreements</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-agreements" className="space-y-6">
            <AgreementStats 
              agreements={agreements}
              participants={participants}
            />
            
            <AgreementList
              agreements={agreements}
              participants={participants}
              currentUserId={user.id}
              onView={handleViewAgreement}
              onEdit={handleEditAgreement}
              onDelete={handleDeleteAgreement}
              onShare={handleShareAgreement}
            />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card 
                    key={category.key} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCreateAgreement(templates.find(t => t.category === category.key))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Create New Agreement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose a template or start from scratch.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => handleCreateAgreement()}>
                  Start from Scratch
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('templates')}>
                  Browse Templates
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
