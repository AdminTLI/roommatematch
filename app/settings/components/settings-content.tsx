'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, FileText, Shield, Settings as SettingsIcon } from 'lucide-react'
import { ProfileSettings } from './profile-settings'
import { QuestionnaireSettings } from './questionnaire-settings'
import { AccountSettings } from './account-settings'
import { PrivacySettings } from './privacy-settings'
import { EmailVerification } from './email-verification'

interface SettingsContentProps {
  user: any
  profile: any
  academic: any
  progressData: {
    completedSections: string[]
    totalSections: number
    isFullySubmitted: boolean
    lastUpdated: string | null
    submittedAt: string | null
  }
}

export function SettingsContent({ user, profile, academic, progressData }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Manage your account settings, profile information, and questionnaire responses.
        </p>
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 rounded-2xl">
          <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 rounded-xl">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="questionnaire" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 rounded-xl">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Questionnaire</span>
            <span className="sm:hidden">Q&A</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 rounded-xl">
            <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Account</span>
            <span className="sm:hidden">Account</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 rounded-xl">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Privacy</span>
            <span className="sm:hidden">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings 
                user={user}
                profile={profile}
                academic={academic}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaire">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Management</CardTitle>
              <CardDescription>
                View and manage your compatibility questionnaire responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionnaireSettings 
                progressData={progressData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Control your data visibility and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrivacySettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
