'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, User, Mail, GraduationCap, Phone } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

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
      const response = await fetch('/api/settings/profile', {
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

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your basic profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <p className="text-sm text-gray-500">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Academic Information
          </CardTitle>
          <CardDescription>
            Your academic details from your questionnaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Input value={academic?.university_id || 'Not specified'} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Degree Level</Label>
              <Input value={academic?.degree_level || 'Not specified'} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Input value={academic?.program_id || 'Not specified'} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input value={academic?.study_start_year || 'Not specified'} disabled className="bg-gray-50" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            To update your academic information, please edit your questionnaire responses.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="min-w-[120px]"
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
