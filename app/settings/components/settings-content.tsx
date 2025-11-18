'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2">
          Manage your account settings, profile information, and questionnaire responses.
        </p>
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Responsive Tabs */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile: Dropdown Select (< 640px) */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-bg-surface border border-border-subtle rounded-xl shadow-sm">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {activeTab === 'profile' && <User className="w-4 h-4" />}
                    {activeTab === 'questionnaire' && <FileText className="w-4 h-4" />}
                    {activeTab === 'account' && <SettingsIcon className="w-4 h-4" />}
                    {activeTab === 'privacy' && <Shield className="w-4 h-4" />}
                    <span className="font-medium">
                      {activeTab === 'profile' && 'Profile'}
                      {activeTab === 'questionnaire' && 'Questionnaire'}
                      {activeTab === 'account' && 'Account'}
                      {activeTab === 'privacy' && 'Privacy'}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </div>
                </SelectItem>
                <SelectItem value="questionnaire">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Questionnaire</span>
                  </div>
                </SelectItem>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    <span>Account</span>
                  </div>
                </SelectItem>
                <SelectItem value="privacy">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Privacy</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tablet: Grid Layout (640px - 1024px) */}
          <div className="hidden sm:block lg:hidden">
            <div className="grid grid-cols-2 gap-2 bg-bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === 'profile'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('questionnaire')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === 'questionnaire'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Questionnaire</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === 'account'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === 'privacy'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Privacy</span>
              </button>
            </div>
          </div>

          {/* Desktop: Horizontal Layout (>= 1024px) */}
          <div className="hidden lg:block">
            <div className="flex gap-2 bg-bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                  activeTab === 'profile'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('questionnaire')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                  activeTab === 'questionnaire'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Questionnaire</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                  activeTab === 'account'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                  activeTab === 'privacy'
                    ? 'bg-semantic-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-alt active:bg-bg-surface-alt'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Privacy</span>
              </button>
            </div>
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
