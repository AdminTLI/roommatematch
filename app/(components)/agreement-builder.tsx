// Agreement Builder Component for creating and editing household agreements

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Users,
  Home,
  RotateCcw,
  VolumeX,
  DollarSign,
  Car,
  Zap,
  Sparkles,
  FileText,
  ArrowLeft,
  ArrowRight,
  Edit,
  Settings
} from 'lucide-react'
import type { 
  AgreementTemplate, 
  AgreementData, 
  FilledAgreementSection, 
  FilledAgreementField,
  CreateAgreementData
} from '@/lib/agreements/types'
import { AGREEMENT_TEMPLATES } from '@/lib/agreements/types'
import { processTemplateToAgreement, validateAgreementData } from '@/lib/agreements/utils'
import { cn } from '@/lib/utils'

interface AgreementBuilderProps {
  template?: AgreementTemplate
  initialData?: AgreementData
  onSave: (data: CreateAgreementData & { agreement_data: AgreementData }) => void
  onCancel: () => void
  className?: string
}

const categoryIcons = {
  house_rules: Home,
  chore_rotation: RotateCcw,
  quiet_hours: VolumeX,
  rent_split: DollarSign,
  guest_policy: Users,
  cleaning_schedule: Sparkles,
  utilities: Zap,
  parking: Car,
  general: FileText
}

export function AgreementBuilder({
  template,
  initialData,
  onSave,
  onCancel,
  className
}: AgreementBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null)
  const [formData, setFormData] = useState<CreateAgreementData>({
    title: '',
    description: '',
    template_id: template?.id || '',
    household_name: '',
    household_address: '',
    requires_all_signatures: true,
    auto_renewal: false,
    renewal_period_months: 12
  })
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (template) {
      const processedData = processTemplateToAgreement(template.template_data, {})
      setAgreementData(processedData)
      setFormData(prev => ({ ...prev, template_id: template.id }))
    } else if (initialData) {
      setAgreementData(initialData)
      // Extract field values from initial data
      const values: Record<string, any> = {}
      initialData.sections.forEach(section => {
        section.fields.forEach(field => {
          values[field.id] = field.value
        })
      })
      setFieldValues(values)
    }
  }, [template, initialData])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = () => {
    if (!agreementData) return

    // Update agreement data with current field values
    const updatedAgreementData = processTemplateToAgreement(
      template?.template_data || agreementData,
      fieldValues
    )

    // Validate the data
    const validationErrors = validateAgreementData(updatedAgreementData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Save the agreement
    onSave({
      ...formData,
      agreement_data: updatedAgreementData
    })
  }

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: FileText },
    { id: 'content', title: 'Agreement Content', icon: Edit },
    { id: 'settings', title: 'Settings', icon: Settings },
    { id: 'review', title: 'Review', icon: Eye }
  ]

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Agreement Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Spring 2024 House Rules"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this agreement..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="household_name">Household Name</Label>
        <Input
          id="household_name"
          value={formData.household_name}
          onChange={(e) => setFormData(prev => ({ ...prev, household_name: e.target.value }))}
          placeholder="e.g., Campus View Apartments"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="household_address">Address</Label>
        <Textarea
          id="household_address"
          value={formData.household_address}
          onChange={(e) => setFormData(prev => ({ ...prev, household_address: e.target.value }))}
          placeholder="Full address of the property..."
          className="mt-1"
        />
      </div>
    </div>
  )

  const renderContentStep = () => {
    if (!agreementData) return null

    return (
      <div className="space-y-6">
        {agreementData.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="flex items-center gap-2">
                    {field.label}
                    {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input
                      id={field.id}
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.id}
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      id={field.id}
                      type="number"
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      value={fieldValues[field.id] || ''}
                      onValueChange={(value) => handleFieldChange(field.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.type === 'multiselect' && (
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.id}-${option}`}
                            checked={(fieldValues[field.id] || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValues = fieldValues[field.id] || []
                              if (checked) {
                                handleFieldChange(field.id, [...currentValues, option])
                              } else {
                                handleFieldChange(field.id, currentValues.filter((v: string) => v !== option))
                              }
                            }}
                          />
                          <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {field.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="requires_all_signatures"
          checked={formData.requires_all_signatures}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, requires_all_signatures: !!checked }))
          }
        />
        <Label htmlFor="requires_all_signatures">
          Require all participants to sign before agreement becomes active
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="auto_renewal"
          checked={formData.auto_renewal}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, auto_renewal: !!checked }))
          }
        />
        <Label htmlFor="auto_renewal">
          Automatically renew this agreement
        </Label>
      </div>

      {formData.auto_renewal && (
        <div>
          <Label htmlFor="renewal_period">Renewal Period (months)</Label>
          <Input
            id="renewal_period"
            type="number"
            value={formData.renewal_period_months}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              renewal_period_months: parseInt(e.target.value) || 12 
            }))}
            min="1"
            max="24"
            className="mt-1"
          />
        </div>
      )}
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Basic Information
          </h4>
          <div className="space-y-2 text-sm">
            <div><strong>Title:</strong> {formData.title}</div>
            <div><strong>Description:</strong> {formData.description || 'None'}</div>
            <div><strong>Household:</strong> {formData.household_name || 'None'}</div>
            <div><strong>Address:</strong> {formData.household_address || 'None'}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Settings
          </h4>
          <div className="space-y-2 text-sm">
            <div><strong>Require all signatures:</strong> {formData.requires_all_signatures ? 'Yes' : 'No'}</div>
            <div><strong>Auto-renewal:</strong> {formData.auto_renewal ? 'Yes' : 'No'}</div>
            {formData.auto_renewal && (
              <div><strong>Renewal period:</strong> {formData.renewal_period_months} months</div>
            )}
          </div>
        </div>
      </div>

      {agreementData && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Agreement Content
          </h4>
          <div className="space-y-4">
            {agreementData.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <div key={field.id} className="flex justify-between">
                        <span className="text-sm font-medium">{field.label}:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Array.isArray(fieldValues[field.id]) 
                            ? fieldValues[field.id].join(', ')
                            : fieldValues[field.id] || 'Not specified'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep()
      case 1:
        return renderContentStep()
      case 2:
        return renderSettingsStep()
      case 3:
        return renderReviewStep()
      default:
        return null
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim() !== ''
      case 1:
        return true // Content step validation happens in review
      case 2:
        return true
      case 3:
        return errors.length === 0
      default:
        return false
    }
  }

  const canGoPrevious = () => currentStep > 0

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Household Agreement</CardTitle>
            {template && (
              <Badge variant="outline" className="flex items-center gap-1">
                {React.createElement(categoryIcons[template.category as keyof typeof categoryIcons] || FileText, { className: "h-3 w-3" })}
                {template.name}
              </Badge>
            )}
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center space-x-4 mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  index === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : index < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                )}>
                  {index + 1}
                </div>
                <span className={cn(
                  'ml-2 text-sm',
                  index === currentStep ? 'font-medium text-blue-600' : 'text-gray-600'
                )}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => canGoPrevious() ? setCurrentStep(currentStep - 1) : onCancel()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {canGoPrevious() ? 'Previous' : 'Cancel'}
            </Button>
            
            <div className="flex gap-2">
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSave} disabled={!canGoNext()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Agreement
                </Button>
              ) : (
                <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canGoNext()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
