'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, User, Mail, GraduationCap, Phone } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { trackProfileUpdate } from '@/lib/notifications/activity-tracker'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

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
    university: academic?.university_id || '',
    degreeLevel: academic?.degree_level || '',
    program: academic?.program_id || '',
    graduationYear: academic?.study_start_year || ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

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
          bio: formData.bio
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Track profile update activity
      const changes: string[] = []
      if (formData.firstName !== (profile?.first_name || '')) changes.push('first name')
      if (formData.lastName !== (profile?.last_name || '')) changes.push('last name')
      if (formData.phone !== (profile?.phone || '')) changes.push('phone')
      if (formData.bio !== (profile?.bio || '')) changes.push('bio')
      
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
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="border-green-200 bg-green-50 mb-2">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <User className="w-5 h-5 text-gray-600" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Update your basic profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="h-11 text-text-primary dark:text-text-primary bg-bg-surface dark:bg-bg-surface border-border-subtle"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="h-11 text-text-primary dark:text-text-primary bg-bg-surface dark:bg-bg-surface border-border-subtle"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="h-11 text-text-primary dark:text-text-primary bg-bg-surface dark:bg-bg-surface border-border-subtle"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={5}
              className="resize-none text-text-primary dark:text-text-primary bg-bg-surface dark:bg-bg-surface border-border-subtle"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary"
              />
            </div>
            <p className="text-sm text-gray-500 ml-8">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <GraduationCap className="w-5 h-5 text-gray-600" />
            Academic Information
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Your academic details from your questionnaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">University</Label>
              <Input 
                value={
                  academic?.universities?.name || 
                  academic?.university_id || 
                  'Not specified'
                } 
                disabled 
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Degree Level</Label>
              <Input 
                value={
                  academic?.degree_level 
                    ? academic.degree_level.charAt(0).toUpperCase() + academic.degree_level.slice(1)
                    : 'Not specified'
                } 
                disabled 
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Program</Label>
              <Input 
                value={
                  academic?.undecided_program 
                    ? 'Undecided'
                    : (academic?.programs?.name || profile?.program || 'Not specified')
                } 
                disabled 
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Expected Graduation Year</Label>
              <Input 
                value={academic?.expected_graduation_year || 'Not specified'} 
                disabled 
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Current Study Year</Label>
              <Input 
                value={
                  academic?.study_year 
                    ? `Year ${academic.study_year}`
                    : 'Not available'
                } 
                disabled 
                className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
              />
            </div>
            {academic?.study_start_month && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Study Start Month</Label>
                <Input 
                  value={
                    academic.study_start_month === 9 ? 'September/Fall' :
                    academic.study_start_month === 2 ? 'February/Spring' :
                    new Date(2000, academic.study_start_month - 1).toLocaleString('default', { month: 'long' })
                  } 
                  disabled 
                  className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
                />
              </div>
            )}
            {academic?.graduation_month && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Expected Graduation Month</Label>
                <Input 
                  value={new Date(2000, academic.graduation_month - 1).toLocaleString('default', { month: 'long' })} 
                  disabled 
                  className="bg-gray-50 dark:bg-bg-surface-alt h-11 text-text-primary dark:text-text-primary" 
                />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
            To update your academic information, please edit your questionnaire responses.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[140px] h-11 text-base"
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
