'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, User, Mail, GraduationCap, Phone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { InterestsSelector } from '@/components/settings/interests-selector'
import { HousingStatusSelector } from '@/components/settings/housing-status-selector'
import { trackProfileUpdate } from '@/lib/notifications/activity-tracker'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type HousingStatusKey } from '@/lib/constants/housing-status'

interface ProfileSettingsProps {
  user: any
  profile: any
  academic: any
}

export function ProfileSettings({ user, profile, academic }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: profile?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    interests: (profile?.interests && Array.isArray(profile.interests)) ? profile.interests : [],
    housingStatus: (profile?.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status as HousingStatusKey[] : [],
    university: academic?.university_id || '',
    degreeLevel: academic?.degree_level || '',
    program: academic?.program_id || '',
    graduationYear: academic?.study_start_year || ''
  })
  const [interestsError, setInterestsError] = useState<string | null>(null)

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

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setInterestsError(null)
    setIsSuccess(false)

    // Validate interests before submitting
    if (formData.interests.length < 3) {
      setInterestsError('Please select at least 3 interests')
      setIsLoading(false)
      return
    }

    if (formData.interests.length > 10) {
      setInterestsError('Maximum 10 interests allowed')
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          interests: formData.interests,
          housingStatus: formData.housingStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Check if error is related to interests
        if (errorData.error?.includes('interests')) {
          setInterestsError(errorData.error)
        }
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Track profile update activity
      const changes: string[] = []
      if (formData.firstName !== (profile?.first_name || '')) changes.push('first name')
      if (formData.lastName !== (profile?.last_name || '')) changes.push('last name')
      if (formData.phone !== (profile?.phone || '')) changes.push('phone')
      if (formData.bio !== (profile?.bio || '')) changes.push('bio')
      const existingInterests = (profile?.interests && Array.isArray(profile.interests)) ? profile.interests : []
      if (JSON.stringify(formData.interests.sort()) !== JSON.stringify(existingInterests.sort())) {
        changes.push('interests')
      }
      const existingHousingStatus = (profile?.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status.sort() : []
      if (JSON.stringify(formData.housingStatus.sort()) !== JSON.stringify(existingHousingStatus)) {
        changes.push('housing status')
      }

      if (changes.length > 0) {
        await trackProfileUpdate(user.id, changes)
      }

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Personal Information</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl shadow-sm">
          {/* First Name */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:w-1/3">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <Label htmlFor="firstName" className="text-zinc-900 dark:text-zinc-100 font-medium">First Name</Label>
            </div>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="First Name"
              className="flex-1 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg"
            />
          </div>

          {/* Last Name */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:w-1/3">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <Label htmlFor="lastName" className="text-zinc-900 dark:text-zinc-100 font-medium">Last Name</Label>
            </div>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last Name"
              className="flex-1 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg"
            />
          </div>

          {/* Phone */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:w-1/3">
              <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <Label htmlFor="phone" className="text-zinc-900 dark:text-zinc-100 font-medium">Phone</Label>
            </div>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone Number"
              className="flex-1 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3 sm:w-1/3">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <Label className="text-zinc-600 dark:text-zinc-400 font-medium">Email</Label>
            </div>
            <div className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 px-0 sm:px-3">
              {formData.email}
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Interests Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">About You</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden p-6 space-y-6 backdrop-blur-xl shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="bio" className="text-zinc-900 dark:text-zinc-100 font-medium">Bio</Label>
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
                          <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="z-[9999]">
                      <p className="text-xs">Click for bio guidelines</p>
                    </TooltipContent>
                    <PopoverContent className="w-80 p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 z-[9999]" align="start">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Bio Guidelines</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="font-medium">Include:</span> lifestyle preferences, living habits, study schedule, hobbies, what you're looking for in a roommate
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="font-medium">Don't include:</span> contact info, exact address, financial info, links, or anything that could compromise your safety
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
              className="resize-none bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/20 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-white/5">
            <InterestsSelector
              value={formData.interests}
              onChange={handleInterestsChange}
              min={3}
              max={10}
              error={interestsError || undefined}
            />
          </div>
        </div>
      </div>

      {/* Housing Status Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Housing Status</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden p-6 backdrop-blur-xl shadow-sm">
          <HousingStatusSelector
            value={formData.housingStatus}
            onChange={handleHousingStatusChange}
          />
        </div>
      </div>

      {/* Academic Information Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Academic Info</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl shadow-sm">
          {[
            { label: 'University', value: academic?.universities?.name || academic?.university_id, icon: GraduationCap },
            { label: 'Degree Level', value: academic?.degree_level ? academic.degree_level.charAt(0).toUpperCase() + academic.degree_level.slice(1) : null, icon: GraduationCap },
            { label: 'Program', value: (academic?.undecided_program && !profile?.program) ? 'Undecided' : (academic?.programs?.name || profile?.program), icon: GraduationCap },
            { label: 'Graduation', value: academic?.expected_graduation_year ? `Class of ${academic.expected_graduation_year}` : null, icon: GraduationCap },
          ].map((item, i) => (
            <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-3 sm:w-1/3">
                <item.icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <Label className="text-zinc-600 dark:text-zinc-400 font-medium">{item.label}</Label>
              </div>
              <div className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 px-0 sm:px-3">
                {item.value || 'Not specified'}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 px-1 mt-2">
          To update your academic information, please edit your questionnaire responses.
        </p>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[160px] h-11 text-base bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}
