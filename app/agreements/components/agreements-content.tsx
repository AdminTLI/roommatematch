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
  Sparkles,
  ArrowLeft
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

export function AgreementsContent() {
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
    setAgreements(getDemoAgreements())
    setParticipants(getDemoParticipants())
    setTemplates(getDemoTemplates())
  }, [])

  const handleCreateAgreement = (data: CreateAgreementData) => {
    const newAgreement: HouseholdAgreement = {
      id: `agreement-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      status: 'draft',
      created_by: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: data.dueDate,
      participants: data.participants || [],
      items: data.items || [],
      signatures: [],
      attachments: [],
      tags: data.tags || [],
      priority: data.priority || 'medium',
      visibility: data.visibility || 'household',
      reminder_frequency: data.reminderFrequency || 'weekly',
      auto_renewal: data.autoRenewal || false,
      renewal_period: data.renewalPeriod || 'monthly',
      escalation_rules: data.escalationRules || [],
      completion_criteria: data.completionCriteria || [],
      reward_system: data.rewardSystem || null,
      penalty_system: data.penaltySystem || null,
      review_schedule: data.reviewSchedule || 'monthly',
      last_reviewed: null,
      next_review: null,
      archived: false,
      archived_at: null,
      version: 1,
      previous_version: null,
      change_log: []
    }

    setAgreements(prev => [newAgreement, ...prev])
    setShowBuilder(false)
    setSelectedTemplate(undefined)
  }

  const handleTemplateSelect = (template: AgreementTemplate) => {
    setSelectedTemplate(template)
    setShowBuilder(true)
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Household Agreements</h1>
          <p className="text-lg text-gray-600 mt-1">Manage shared responsibilities and expectations</p>
        </div>
        <Button 
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Agreement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Agreements</p>
                <p className="text-2xl font-bold text-gray-900">{agreements.length}</p>
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
                <p className="text-sm text-gray-600">Active Participants</p>
                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Templates Available</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-agreements">My Agreements</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="my-agreements" className="space-y-6">
          <AgreementList 
            agreements={agreements}
            participants={participants}
            onEdit={(agreement) => {
              // Handle edit
            }}
            onDelete={(agreement) => {
              setAgreements(prev => prev.filter(a => a.id !== agreement.id))
            }}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGREEMENT_TEMPLATES.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <template.icon className="w-5 h-5 text-blue-600" />
                    {template.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{template.category}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleTemplateSelect(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AgreementStats agreements={agreements} participants={participants} />
        </TabsContent>
      </Tabs>

      {/* Agreement Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedTemplate ? `Create ${selectedTemplate.title}` : 'Create New Agreement'}
              </h2>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowBuilder(false)
                  setSelectedTemplate(undefined)
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <AgreementBuilder 
                template={selectedTemplate}
                participants={participants}
                onSubmit={handleCreateAgreement}
                onCancel={() => {
                  setShowBuilder(false)
                  setSelectedTemplate(undefined)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
