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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Manage your account settings, profile information, and questionnaire responses.
        </p>
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Scrollable Tabs - Similar to Matches page */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <div className="flex gap-1.5 sm:gap-2 bg-white border border-gray-200 p-1 sm:p-1.5 rounded-2xl shadow-sm overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 flex-shrink-0 min-w-[100px] sm:min-w-[120px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('questionnaire')}
                className={`flex items-center gap-2 flex-shrink-0 min-w-[100px] sm:min-w-[140px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'questionnaire'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Questionnaire</span>
                <span className="sm:hidden">Q&A</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 flex-shrink-0 min-w-[100px] sm:min-w-[120px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'account'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 flex-shrink-0 min-w-[100px] sm:min-w-[120px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'privacy'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Privacy</span>
              </button>
            </div>
            {/* Edge fade indicator */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-r from-transparent to-white hidden sm:block" />
          </div>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle>Questionnaire Management</CardTitle>
              <CardDescription>
                View and manage your compatibility questionnaire responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <QuestionnaireSettings 
                progressData={progressData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <AccountSettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Control your data visibility and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PrivacySettings user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
