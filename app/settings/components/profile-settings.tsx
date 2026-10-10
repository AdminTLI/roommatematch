'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, User, Mail, GraduationCap, Phone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { InterestsSelector } from '@/components/settings/interests-selector'
import { HousingStatusSelector } from '@/components/settings/housing-status-selector'
import { HousingBudgetSlider,
  HOUSING_BUDGET_DEFAULT,
} from '@/components/settings/housing-budget-slider'
import { CoCreatorBadgeSettings } from '@/components/lab/co-creator-badge-settings'
import { trackProfileUpdate } from '@/lib/notifications/activity-tracker'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type HousingStatusKey } from '@/lib/constants/housing-status'
import { resolveStoredProfileName } from '@/lib/auth/identity-name'
import {
  SettingsSection,
  settingsEditableLabelClass,
  settingsFieldLabelClass,
  settingsFieldValueClass,
} from '@/components/settings/settings-section'

interface ProfileSettingsProps {
  user: any
  profile: any
  academic: any
  userType?: 'student' | 'professional' | null
  professionalContext?: {
    wfh_status?: string | null
  } | null
}

export function ProfileSettings({ user, profile, academic, userType, professionalContext }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefer `userType`, but fall back to detecting professional-context answers.
  // This prevents young-professional accounts with unset user_type from seeing "Academic Info".
  const isProfessional = userType === 'professional' || professionalContext != null

  const formatWfhStatus = (value: string | null | undefined) => {
    switch (value) {
      case 'fully_remote':
        return 'Fully Remote'
      case 'hybrid':
        return 'Hybrid (1-3 days WFH)'
      case 'fully_office':
        return 'Fully in Office'
      default:
        return null
    }
  }

  const identity = resolveStoredProfileName(profile, user)
  const displayFirstName = identity.firstName || ''
  const displayLastName = identity.lastName || ''
  const displayEmail = user.email || ''
  const displayPhone = profile?.phone || ''

  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    interests: (profile?.interests && Array.isArray(profile.interests)) ? profile.interests : [],
    housingStatus: (profile?.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status as HousingStatusKey[] : [],
    budgetMin: typeof profile?.budget_min === 'number' ? profile.budget_min : null as number | null,
    budgetMax: typeof profile?.budget_max === 'number' ? profile.budget_max : null as number | null,
    budgetUnknown: Boolean(profile?.budget_unknown),
    university: academic?.university_id || '',
    degreeLevel: academic?.degree_level || '',
    program: academic?.program_id || '',
    graduationYear: academic?.study_start_year || ''
  })
  const [interestsError, setInterestsError] = useState<string | null>(null)
  const [budgetError, setBudgetError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInterestsChange = (interests: string[]) => {
    setFormData(prev => ({ ...prev, interests }))
    setInterestsError(null)
  }

  const handleHousingStatusChange = (housingStatus: HousingStatusKey[]) => {
    setFormData(prev => ({ ...prev, housingStatus }))
  }

  const handleBudgetChange = (next: {
    budgetMin: number | null
    budgetMax: number | null
    budgetUnknown: boolean
  }) => {
    setFormData(prev => ({ ...prev, ...next }))
    setBudgetError(null)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setInterestsError(null)
    setBudgetError(null)
    setIsSuccess(false)

    // Validate interests before submitting
    if (formData.interests.length < 3) {
      const message = 'Please select at least 3 interests'
      setInterestsError(message)
      showErrorToast('Could not save changes', message)
      setIsLoading(false)
      return
    }

    if (formData.interests.length > 10) {
      const message = 'Maximum 10 interests allowed'
      setInterestsError(message)
      showErrorToast('Could not save changes', message)
      setIsLoading(false)
      return
    }

    const resolvedBudgetMin = formData.budgetUnknown
      ? null
      : (formData.budgetMin ?? (formData.budgetMax != null ? HOUSING_BUDGET_DEFAULT[0] : null))
    const resolvedBudgetMax = formData.budgetUnknown
      ? null
      : (formData.budgetMax ?? (formData.budgetMin != null ? HOUSING_BUDGET_DEFAULT[1] : null))

    if (!formData.budgetUnknown && (resolvedBudgetMin != null) !== (resolvedBudgetMax != null)) {
      const message = 'Please set both a minimum and maximum budget, or check that you don\'t know your budget yet'
      setBudgetError(message)
      showErrorToast('Could not save changes', message)
      setIsLoading(false)
      return
    }

    if (
      !formData.budgetUnknown &&
      resolvedBudgetMin != null &&
      resolvedBudgetMax != null &&
      resolvedBudgetMin > resolvedBudgetMax
    ) {
      const message = 'Minimum budget cannot be higher than maximum budget'
      setBudgetError(message)
      showErrorToast('Could not save changes', message)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetchWithCSRF('/api/settings/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: formData.bio,
          interests: formData.interests,
          housingStatus: formData.housingStatus,
          budgetMin: resolvedBudgetMin,
          budgetMax: resolvedBudgetMax,
          budgetUnknown: formData.budgetUnknown,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to update profile'
        // Check if error is related to interests
        if (typeof errorMessage === 'string' && errorMessage.includes('interests')) {
          setInterestsError(errorMessage)
        } else if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('budget')) {
          setBudgetError(errorMessage)
        }
        throw new Error(errorMessage)
      }

      // Track profile update activity
      const changes: string[] = []
      if (formData.bio !== (profile?.bio || '')) changes.push('bio')
      const existingInterests = (profile?.interests && Array.isArray(profile.interests)) ? profile.interests : []
      if (JSON.stringify(formData.interests.sort()) !== JSON.stringify(existingInterests.sort())) {
        changes.push('interests')
      }
      const existingHousingStatus = (profile?.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status.sort() : []
      if (JSON.stringify(formData.housingStatus.sort()) !== JSON.stringify(existingHousingStatus)) {
        changes.push('housing status')
      }
      const existingBudgetMin = typeof profile?.budget_min === 'number' ? profile.budget_min : null
      const existingBudgetMax = typeof profile?.budget_max === 'number' ? profile.budget_max : null
      const existingBudgetUnknown = Boolean(profile?.budget_unknown)
      if (
        resolvedBudgetMin !== existingBudgetMin ||
        resolvedBudgetMax !== existingBudgetMax ||
        formData.budgetUnknown !== existingBudgetUnknown
      ) {
        changes.push('budget')
      }

      if (changes.length > 0) {
        await trackProfileUpdate(user.id, changes)
      }

      setIsSuccess(true)
      showSuccessToast('Profile updated', 'Your changes were saved successfully.')
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      showErrorToast('Could not save changes', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CoCreatorBadgeSettings />

      <SettingsSection
        title="Personal information"
        description={
          <>
            For safety and privacy, your name, phone number, and email cannot be changed in the app. To update any of these,{' '}
            <a
              href="mailto:domumatch@gmail.com?subject=Request%20to%20update%20account%20information"
              className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              email us
            </a>
            .
          </>
        }
      >
        <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsFieldLabelClass}>First name</Label>
            </div>
            <div className={settingsFieldValueClass}>{displayFirstName || '—'}</div>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsFieldLabelClass}>Last name</Label>
            </div>
            <div className={settingsFieldValueClass}>{displayLastName || '—'}</div>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              <Phone className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsFieldLabelClass}>Phone</Label>
            </div>
            <div className={settingsFieldValueClass}>{displayPhone || '—'}</div>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
              <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Label className={settingsFieldLabelClass}>Email</Label>
            </div>
            <div className={`${settingsFieldValueClass} break-all`}>{displayEmail || '—'}</div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="About you"
        description="Tell potential roommates a bit about how you live and what you enjoy."
      >
        <div className="space-y-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="bio" className={settingsEditableLabelClass}>Bio</Label>
              <TooltipProvider>
                <Tooltip>
                  <Popover>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          aria-label="Bio guidelines"
                        >
                          <Info className="w-4 h-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300" />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="z-[9999]">
                      <p className="text-xs">Click for bio guidelines</p>
                    </TooltipContent>
                    <PopoverContent className="w-80 p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 z-[9999]" align="start">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Bio guidelines</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-zinc-600 dark:text-zinc-300">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">Include:</span> lifestyle preferences, living habits, your work/study routine, hobbies, what you&apos;re looking for in a roommate
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-zinc-600 dark:text-zinc-300">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">Don&apos;t include:</span> contact info, exact address, financial info, links, or anything that could compromise your safety
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/20 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2.5 border-t border-zinc-200/70 pt-8 dark:border-white/[0.06]">
            <InterestsSelector
              value={formData.interests}
              onChange={handleInterestsChange}
              min={3}
              max={10}
              error={interestsError || undefined}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Housing status"
        description="Share where you are in your housing search and your budget range."
      >
        <div className="space-y-6">
          <HousingStatusSelector
            value={formData.housingStatus}
            onChange={handleHousingStatusChange}
          />
          <HousingBudgetSlider
            budgetMin={formData.budgetMin}
            budgetMax={formData.budgetMax}
            budgetUnknown={formData.budgetUnknown}
            onChange={handleBudgetChange}
            error={budgetError || undefined}
          />
        </div>
      </SettingsSection>

      {isProfessional ? (
        <SettingsSection
          title="Work context"
          description="To update your work arrangement, edit your questionnaire responses."
        >
          <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
            {[
              {
                label: 'WFH arrangement',
                value: formatWfhStatus(professionalContext?.wfh_status),
                icon: Info,
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
                  <item.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <Label className={settingsFieldLabelClass}>{item.label}</Label>
                </div>
                <div className={settingsFieldValueClass}>{item.value || 'Not specified'}</div>
              </div>
            ))}
          </div>
        </SettingsSection>
      ) : (
        <SettingsSection
          title="Academic info"
          description="To update your academic information, edit your questionnaire responses."
        >
          <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
            {[
              { label: 'University', value: academic?.universities?.name || academic?.university_id, icon: GraduationCap },
              {
                label: 'Degree level',
                value: academic?.degree_level
                  ? academic.degree_level.charAt(0).toUpperCase() + academic.degree_level.slice(1)
                  : null,
                icon: GraduationCap,
              },
              {
                label: 'Program',
                value: academic?.programs?.name || academic?.program_id || profile?.program || (academic?.undecided_program ? 'Undecided' : null),
                icon: GraduationCap,
              },
              { label: 'Graduation', value: academic?.expected_graduation_year ? `Class of ${academic.expected_graduation_year}` : null, icon: GraduationCap },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2.5 sm:w-40 sm:shrink-0">
                  <item.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <Label className={settingsFieldLabelClass}>{item.label}</Label>
                </div>
                <div className={settingsFieldValueClass}>{item.value || 'Not specified'}</div>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      <div className="space-y-3 py-6">
        {(error || isSuccess) && (
          <div className="sm:flex sm:justify-end">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 sm:max-w-md">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 sm:max-w-md">
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Profile updated successfully!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[160px] h-11 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
