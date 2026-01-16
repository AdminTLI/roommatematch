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

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'questionnaire', label: 'Questionnaire', icon: FileText },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage your account settings, profile information, and questionnaire responses.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar / Header */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl p-2 hidden lg:block shadow-sm">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${activeTab === item.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile/Tablet Horizontal Scroll Nav */}
          <div className="lg:hidden overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${activeTab === item.id
                      ? 'bg-blue-500 border-blue-400 text-white'
                      : 'bg-white/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Profile Information</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Update your personal information and preferences.</p>
                  </div>
                  <ProfileSettings
                    user={user}
                    profile={profile}
                    academic={academic}
                  />
                </div>
              </TabsContent>

              <TabsContent value="questionnaire" className="mt-0 focus-visible:outline-none">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Questionnaire Management</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">View and manage your compatibility questionnaire responses.</p>
                  </div>
                  <QuestionnaireSettings
                    progressData={progressData}
                  />
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0 focus-visible:outline-none">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Account Settings</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your account preferences and security settings.</p>
                  </div>
                  <AccountSettings user={user} />
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0 focus-visible:outline-none">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Privacy & Data</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Control your data visibility and privacy settings.</p>
                  </div>
                  <PrivacySettings user={user} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
