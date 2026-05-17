'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { SettingFieldHint } from '@/components/admin/setting-field-hint'
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Bell,
  Building2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  DEFAULT_PLATFORM_SETTINGS,
  type PlatformSettings,
} from '@/lib/platform-settings-shared'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

export function AdminSettingsContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load settings')
      }
      const data = (await response.json()) as PlatformSettings
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setLoadError(error instanceof Error ? error.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetchWithCSRF('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to save settings')
      }
      const saved = (await response.json()) as PlatformSettings
      setSettings(saved)
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
    setSettings((prev) => ({ ...prev, [key]: value }))
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">
            Platform Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-muted-foreground mt-1">
            Configure platform-wide settings. Changes are saved to the database and take effect within about a minute on live traffic.
          </p>
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
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
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

      {loadError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            Could not load saved settings ({loadError}). Showing defaults until the database migration is applied.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>Branding, SEO, and global access controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              placeholder="Domu Match"
            />
            <SettingFieldHint>
              Used in page titles, Open Graph tags, email sender name, and the maintenance page. Individual marketing pages may still set their own titles; the homepage and app shell use this name.
            </SettingFieldHint>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site description (SEO)</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              placeholder="From strangers to roommates"
              rows={3}
            />
            <SettingFieldHint>
              Becomes the default meta description and Open Graph / Twitter description on the marketing site and app root. Google often shows this text under your link in search results (it may rewrite it). Allow a few days after saving for Google to recrawl; use Search Console to request indexing. Does not change text visible on the page body.
            </SettingFieldHint>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="maintenanceMode">Maintenance mode</Label>
              <SettingFieldHint>
                Redirects visitors to /maintenance. Sign-in, admin routes, and cron jobs still work so you can recover the site.
              </SettingFieldHint>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="registrationEnabled">Registration enabled</Label>
              <SettingFieldHint>
                When off, /auth/sign-up is blocked and new account creation is disabled. Existing users can still sign in.
              </SettingFieldHint>
            </div>
            <Switch
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            University Settings
          </CardTitle>
          <CardDescription>Defaults for student onboarding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultUniversity">Default university (ID)</Label>
            <Input
              id="defaultUniversity"
              value={settings.defaultUniversity}
              onChange={(e) => updateSetting('defaultUniversity', e.target.value)}
              placeholder="UUID from universities table"
            />
            <SettingFieldHint>
              Optional. Pre-selects this university for new users on the onboarding intro step (only when they have not chosen one yet). Use the university row UUID from Supabase, not the display name.
            </SettingFieldHint>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="allowMultipleUniversities">Allow multiple universities</Label>
              <SettingFieldHint>
                When off, users are expected to stay with one university affiliation. When on, future profile flows may allow multiple affiliations (each account still has a primary university today).
              </SettingFieldHint>
            </div>
            <Switch
              id="allowMultipleUniversities"
              checked={settings.allowMultipleUniversities}
              onCheckedChange={(checked) => updateSetting('allowMultipleUniversities', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Preferences
          </CardTitle>
          <CardDescription>Matching limits and operational checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxUsersPerMatch">Maximum users per match / group</Label>
            <Input
              id="maxUsersPerMatch"
              type="number"
              min={2}
              max={10}
              value={settings.maxUsersPerMatch}
              onChange={(e) =>
                updateSetting('maxUsersPerMatch', parseInt(e.target.value, 10) || 4)
              }
            />
            <SettingFieldHint>
              Caps group matching runs and the size of group chats users can create (including themselves). Pair matching is always two people.
            </SettingFieldHint>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchExpirationDays">Match suggestion expiry (days)</Label>
            <Input
              id="matchExpirationDays"
              type="number"
              min={1}
              max={90}
              value={settings.matchExpirationDays}
              onChange={(e) =>
                updateSetting('matchExpirationDays', parseInt(e.target.value, 10) || 7)
              }
            />
            <SettingFieldHint>
              New match suggestions receive an expires_at date this many days ahead. After that date they are treated as expired in the app and by cleanup jobs.
            </SettingFieldHint>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="autoBackupEnabled">Backup monitoring</Label>
              <SettingFieldHint>
                When enabled, the admin dashboard tracks backup health events. Database backups themselves are managed by Supabase; this toggle controls monitoring alerts, not the backup engine.
              </SettingFieldHint>
            </div>
            <Switch
              id="autoBackupEnabled"
              checked={settings.autoBackupEnabled}
              onCheckedChange={(checked) => updateSetting('autoBackupEnabled', checked)}
            />
          </div>

          {settings.autoBackupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup check frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) =>
                  updateSetting(
                    'backupFrequency',
                    e.target.value as PlatformSettings['backupFrequency']
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-background dark:border-border"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <SettingFieldHint>
                How often the system expects a recorded backup health event before flagging it as outdated in admin.
              </SettingFieldHint>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Platform-wide delivery switches</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="emailNotificationsEnabled">Email notifications</Label>
              <SettingFieldHint>
                Disables marketing and lifecycle emails sent via Mailjet (match digests, onboarding reminders, etc.). Auth emails from Supabase (verification, password reset) are not affected.
              </SettingFieldHint>
            </div>
            <Switch
              id="emailNotificationsEnabled"
              checked={settings.emailNotificationsEnabled}
              onCheckedChange={(checked) => updateSetting('emailNotificationsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="pushNotificationsEnabled">In-app notifications</Label>
              <SettingFieldHint>
                When off, the platform stops creating new in-app notification records (bell icon). Does not remove existing notifications.
              </SettingFieldHint>
            </div>
            <Switch
              id="pushNotificationsEnabled"
              checked={settings.pushNotificationsEnabled}
              onCheckedChange={(checked) => updateSetting('pushNotificationsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="adminAlertsEnabled">Admin alerts</Label>
              <SettingFieldHint>
                Controls operational alert emails and Slack messages (health checks, data quality, cron failures). Requires ALERTS_EMAIL_ENABLED or SLACK_WEBHOOK_URL in environment.
              </SettingFieldHint>
            </div>
            <Switch
              id="adminAlertsEnabled"
              checked={settings.adminAlertsEnabled}
              onCheckedChange={(checked) => updateSetting('adminAlertsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="flex items-center gap-2">
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
