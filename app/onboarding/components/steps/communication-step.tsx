'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'

interface CommunicationStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function CommunicationStep({ data, onChange, user }: CommunicationStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = data[field] || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter((item: string) => item !== value)
    
    onChange({
      ...data,
      [field]: newArray
    })
  }

  return (
    <div className="space-y-8">
      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Communication Preferences</h3>
        
        <div className="space-y-2">
          <Label>How do you prefer to communicate with roommates? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'In-person conversations', 'Text messages', 'WhatsApp', 'Email',
              'House group chat', 'Notes/whiteboard', 'Voice messages'
            ].map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`comm_${method}`}
                  checked={(data.communication_methods || []).includes(method)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('communication_methods', method, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`comm_${method}`}
                  className="text-sm font-normal"
                >
                  {method}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>How quickly do you typically respond to messages? *</Label>
          <Select 
            value={data.response_speed || ''} 
            onValueChange={(value) => handleChange('response_speed', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select response speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediately (within minutes)</SelectItem>
              <SelectItem value="quick">Quickly (within hours)</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="few_days">Within a few days</SelectItem>
              <SelectItem value="varies">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conflict Resolution */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Conflict Resolution</h3>
        
        <div className="space-y-2">
          <Label>How do you prefer to handle disagreements? *</Label>
          <Select 
            value={data.disagreement_handling || ''} 
            onValueChange={(value) => handleChange('disagreement_handling', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select conflict resolution style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate_discussion">Immediate discussion</SelectItem>
              <SelectItem value="cool_down_first">Cool down first, then discuss</SelectItem>
              <SelectItem value="written_communication">Written communication</SelectItem>
              <SelectItem value="mediation">Prefer mediation/third party</SelectItem>
              <SelectItem value="avoid_conflict">Try to avoid conflict</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How important is it to address issues quickly? *</Label>
          <Select 
            value={data.issue_urgency || ''} 
            onValueChange={(value) => handleChange('issue_urgency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select urgency preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Very important - address immediately</SelectItem>
              <SelectItem value="important">Important - address within days</SelectItem>
              <SelectItem value="moderate">Moderate - can wait a week</SelectItem>
              <SelectItem value="flexible">Flexible - depends on the issue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* House Rules Communication */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">House Rules & Boundaries</h3>
        
        <div className="space-y-2">
          <Label>How formal should house rules be? *</Label>
          <Select 
            value={data.rules_formality || ''} 
            onValueChange={(value) => handleChange('rules_formality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rules formality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_formal">Very formal (written contracts)</SelectItem>
              <SelectItem value="somewhat_formal">Somewhat formal (written guidelines)</SelectItem>
              <SelectItem value="casual">Casual (verbal agreements)</SelectItem>
              <SelectItem value="flexible">Flexible approach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How often should house meetings be held? *</Label>
          <Select 
            value={data.meeting_frequency || ''} 
            onValueChange={(value) => handleChange('meeting_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meeting frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="as_needed">As needed only</SelectItem>
              <SelectItem value="never">Prefer no formal meetings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
