'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  RefreshCw,
  Database,
  Bell,
  Shield,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PlatformSettings {
  // Platform Configuration
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  
  // University Settings
  defaultUniversity: string
  allowMultipleUniversities: boolean
  
  // System Preferences
  maxUsersPerMatch: number
  matchExpirationDays: number
  autoBackupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  
  // Notification Settings
  emailNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  adminAlertsEnabled: boolean
}

export function AdminSettingsContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Roommate Match',
    siteDescription: 'Find your perfect roommate match',
    maintenanceMode: false,
    registrationEnabled: true,
    defaultUniversity: '',
    allowMultipleUniversities: false,
    maxUsersPerMatch: 4,
    matchExpirationDays: 7,
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    adminAlertsEnabled: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use default values
      // const response = await fetch('/api/admin/settings')
      // if (response.ok) {
      //   const data = await response.json()
      //   setSettings(data)
      // }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // In a real implementation, this would save to an API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      // if (!response.ok) throw new Error('Failed to save settings')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-lg text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Basic platform settings and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              placeholder="Roommate Match"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              placeholder="Find your perfect roommate match"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                Temporarily disable public access to the platform
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="registrationEnabled">Registration Enabled</Label>
              <p className="text-sm text-gray-500">
                Allow new users to register accounts
              </p>
            </div>
            <Switch
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* University Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            University Settings
          </CardTitle>
          <CardDescription>
            Configure university-specific settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultUniversity">Default University</Label>
            <Input
              id="defaultUniversity"
              value={settings.defaultUniversity}
              onChange={(e) => updateSetting('defaultUniversity', e.target.value)}
              placeholder="Select default university"
            />
            <p className="text-sm text-gray-500">
              The default university for new registrations
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowMultipleUniversities">Allow Multiple Universities</Label>
              <p className="text-sm text-gray-500">
                Allow users to be associated with multiple universities
              </p>
            </div>
            <Switch
              id="allowMultipleUniversities"
              checked={settings.allowMultipleUniversities}
              onCheckedChange={(checked) => updateSetting('allowMultipleUniversities', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system behavior and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxUsersPerMatch">Maximum Users Per Match</Label>
            <Input
              id="maxUsersPerMatch"
              type="number"
              min="2"
              max="10"
              value={settings.maxUsersPerMatch}
              onChange={(e) => updateSetting('maxUsersPerMatch', parseInt(e.target.value) || 4)}
            />
            <p className="text-sm text-gray-500">
              Maximum number of users that can be matched together
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchExpirationDays">Match Expiration (Days)</Label>
            <Input
              id="matchExpirationDays"
              type="number"
              min="1"
              max="30"
              value={settings.matchExpirationDays}
              onChange={(e) => updateSetting('matchExpirationDays', parseInt(e.target.value) || 7)}
            />
            <p className="text-sm text-gray-500">
              Number of days before a match suggestion expires
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoBackupEnabled">Automatic Backups</Label>
              <p className="text-sm text-gray-500">
                Automatically backup system data
              </p>
            </div>
            <Switch
              id="autoBackupEnabled"
              checked={settings.autoBackupEnabled}
              onCheckedChange={(checked) => updateSetting('autoBackupEnabled', checked)}
            />
          </div>

          {settings.autoBackupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotificationsEnabled">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Send email notifications to users
              </p>
            </div>
            <Switch
              id="emailNotificationsEnabled"
              checked={settings.emailNotificationsEnabled}
              onCheckedChange={(checked) => updateSetting('emailNotificationsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotificationsEnabled">Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Enable browser push notifications
              </p>
            </div>
            <Switch
              id="pushNotificationsEnabled"
              checked={settings.pushNotificationsEnabled}
              onCheckedChange={(checked) => updateSetting('pushNotificationsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="adminAlertsEnabled">Admin Alerts</Label>
              <p className="text-sm text-gray-500">
                Send alerts to administrators for important events
              </p>
            </div>
            <Switch
              id="adminAlertsEnabled"
              checked={settings.adminAlertsEnabled}
              onCheckedChange={(checked) => updateSetting('adminAlertsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button at Bottom */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="lg"
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

