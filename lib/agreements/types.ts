// Household Agreement Builder & E-sign System Types

export interface AgreementTemplate {
  id: string
  name: string
  description?: string
  category: AgreementCategory
  template_data: AgreementTemplateData
  is_public: boolean
  is_system_template: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface HouseholdAgreement {
  id: string
  title: string
  description?: string
  template_id: string
  agreement_data: AgreementData
  status: AgreementStatus
  effective_date?: string
  expiration_date?: string
  household_name?: string
  household_address?: string
  requires_all_signatures: boolean
  auto_renewal: boolean
  renewal_period_months: number
  needs_admin_review: boolean
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface AgreementParticipant {
  id: string
  agreement_id: string
  user_id: string
  role: ParticipantRole
  status: ParticipantStatus
  signature_data?: SignatureData
  signed_at?: string
  signature_ip?: string
  signature_user_agent?: string
  invited_at: string
  reminder_sent_at?: string
  reminder_count: number
  created_at: string
  updated_at: string
}

export interface AgreementVersion {
  id: string
  agreement_id: string
  version_number: number
  agreement_data: AgreementData
  change_summary?: string
  created_by: string
  created_at: string
}

export interface AgreementDispute {
  id: string
  agreement_id: string
  reported_by: string
  dispute_type: DisputeType
  description: string
  evidence_urls?: string[]
  status: DisputeStatus
  resolution_notes?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface AgreementNotification {
  id: string
  agreement_id: string
  user_id: string
  notification_type: NotificationType
  title: string
  message: string
  delivery_method: DeliveryMethod
  sent_at?: string
  read_at?: string
  created_at: string
}

// Template and Agreement Data Structures
export interface AgreementTemplateData {
  sections: AgreementSection[]
  metadata: {
    version: string
    created_by: string
    last_modified: string
  }
}

export interface AgreementSection {
  id: string
  title: string
  description?: string
  order: number
  fields: AgreementField[]
  is_required: boolean
}

export interface AgreementField {
  id: string
  type: FieldType
  label: string
  description?: string
  placeholder?: string
  is_required: boolean
  order: number
  validation?: FieldValidation
  options?: string[] // For select/checkbox fields
  default_value?: any
}

export interface AgreementData {
  sections: FilledAgreementSection[]
  metadata: {
    template_version: string
    filled_at: string
    filled_by: string
  }
}

export interface FilledAgreementSection {
  id: string
  title: string
  description?: string
  order: number
  fields: FilledAgreementField[]
  is_required: boolean
}

export interface FilledAgreementField {
  id: string
  type: FieldType
  label: string
  value: any
  is_required: boolean
  order: number
}

export interface SignatureData {
  signature_image?: string // Base64 encoded signature
  signature_text?: string // Typed signature
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
  timestamp: string
  ip_address: string
  user_agent: string
}

export interface FieldValidation {
  min_length?: number
  max_length?: number
  pattern?: string
  min_value?: number
  max_value?: number
  required_options?: number // For multi-select fields
}

// Enums
export type AgreementCategory = 
  | 'house_rules' 
  | 'chore_rotation' 
  | 'quiet_hours' 
  | 'rent_split' 
  | 'guest_policy' 
  | 'cleaning_schedule' 
  | 'utilities' 
  | 'parking' 
  | 'general'

export type AgreementStatus = 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated'

export type ParticipantRole = 'tenant' | 'landlord' | 'property_manager' | 'witness'

export type ParticipantStatus = 'pending' | 'signed' | 'declined' | 'expired'

export type DisputeType = 
  | 'breach_of_agreement' 
  | 'interpretation_dispute' 
  | 'enforcement_request' 
  | 'modification_request' 
  | 'termination_request'

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'dismissed' | 'escalated'

export type NotificationType = 
  | 'signature_required' 
  | 'agreement_signed' 
  | 'agreement_expiring' 
  | 'dispute_reported' 
  | 'agreement_modified' 
  | 'reminder'

export type DeliveryMethod = 'in_app' | 'email' | 'sms'

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'signature'

// Form types for creating agreements
export interface CreateAgreementData {
  title: string
  description?: string
  template_id: string
  household_name?: string
  household_address?: string
  requires_all_signatures?: boolean
  auto_renewal?: boolean
  renewal_period_months?: number
}

export interface InviteParticipantsData {
  agreement_id: string
  participant_ids: string[]
}

export interface SignAgreementData {
  agreement_id: string
  signature_data: SignatureData
}

export interface CreateDisputeData {
  agreement_id: string
  dispute_type: DisputeType
  description: string
  evidence_urls?: string[]
}

// Agreement Status Summary
export interface AgreementStatusSummary {
  agreement_id: string
  title: string
  status: AgreementStatus
  total_participants: number
  signed_participants: number
  pending_participants: number
  effective_date?: string
  expiration_date?: string
}

// Template configurations
export interface TemplateConfig {
  category: AgreementCategory
  name: string
  description: string
  icon: string
  color: string
  sections: AgreementSection[]
}

// Pre-defined template configurations
export const AGREEMENT_TEMPLATES: Record<AgreementCategory, TemplateConfig> = {
  house_rules: {
    category: 'house_rules',
    name: 'House Rules',
    description: 'Basic house rules and living standards',
    icon: 'Home',
    color: 'bg-blue-100 text-blue-800',
    sections: [
      {
        id: 'general_rules',
        title: 'General House Rules',
        description: 'Basic rules for living together',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'quiet_hours_start',
            type: 'select',
            label: 'Quiet Hours Start',
            is_required: true,
            order: 1,
            options: ['22:00', '23:00', '00:00', '01:00']
          },
          {
            id: 'quiet_hours_end',
            type: 'select',
            label: 'Quiet Hours End',
            is_required: true,
            order: 2,
            options: ['06:00', '07:00', '08:00', '09:00']
          },
          {
            id: 'guest_policy',
            type: 'textarea',
            label: 'Guest Policy',
            description: 'Rules about having guests over',
            is_required: true,
            order: 3
          },
          {
            id: 'common_areas_cleanliness',
            type: 'select',
            label: 'Common Areas Cleanliness',
            is_required: true,
            order: 4,
            options: ['Daily cleaning', 'Weekly cleaning', 'As needed', 'Rotating schedule']
          }
        ]
      }
    ]
  },
  
  chore_rotation: {
    category: 'chore_rotation',
    name: 'Chore Rotation',
    description: 'Fair distribution of household chores',
    icon: 'RotateCcw',
    color: 'bg-green-100 text-green-800',
    sections: [
      {
        id: 'chore_schedule',
        title: 'Chore Schedule',
        description: 'Weekly chore rotation schedule',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'chore_frequency',
            type: 'select',
            label: 'Chore Rotation Frequency',
            is_required: true,
            order: 1,
            options: ['Weekly', 'Bi-weekly', 'Monthly']
          },
          {
            id: 'chore_list',
            type: 'multiselect',
            label: 'Chores to Include',
            is_required: true,
            order: 2,
            options: [
              'Kitchen cleaning',
              'Bathroom cleaning',
              'Living room cleaning',
              'Trash removal',
              'Dishwashing',
              'Vacuuming',
              'Laundry (shared items)',
              'Grocery shopping',
              'Pet care'
            ]
          }
        ]
      }
    ]
  },
  
  rent_split: {
    category: 'rent_split',
    name: 'Rent & Utilities Split',
    description: 'Fair distribution of rent and utility costs',
    icon: 'DollarSign',
    color: 'bg-yellow-100 text-yellow-800',
    sections: [
      {
        id: 'cost_distribution',
        title: 'Cost Distribution',
        description: 'How rent and utilities are divided',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'rent_amount',
            type: 'number',
            label: 'Total Monthly Rent',
            is_required: true,
            order: 1
          },
          {
            id: 'rent_split_method',
            type: 'radio',
            label: 'Rent Split Method',
            is_required: true,
            order: 2,
            options: ['Equal split', 'Room size based', 'Income based', 'Other']
          },
          {
            id: 'utilities_included',
            type: 'multiselect',
            label: 'Utilities Included in Rent',
            order: 3,
            options: [
              'Electricity',
              'Gas',
              'Water',
              'Internet',
              'Cable/TV',
              'Trash',
              'None'
            ]
          }
        ]
      }
    ]
  },
  
  quiet_hours: {
    category: 'quiet_hours',
    name: 'Quiet Hours',
    description: 'Specific quiet hours and noise policies',
    icon: 'VolumeX',
    color: 'bg-purple-100 text-purple-800',
    sections: [
      {
        id: 'quiet_schedule',
        title: 'Quiet Hours Schedule',
        description: 'When quiet hours are in effect',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'weekday_start',
            type: 'select',
            label: 'Weekday Quiet Hours Start',
            is_required: true,
            order: 1,
            options: ['22:00', '23:00', '00:00']
          },
          {
            id: 'weekday_end',
            type: 'select',
            label: 'Weekday Quiet Hours End',
            is_required: true,
            order: 2,
            options: ['06:00', '07:00', '08:00']
          },
          {
            id: 'weekend_start',
            type: 'select',
            label: 'Weekend Quiet Hours Start',
            is_required: true,
            order: 3,
            options: ['23:00', '00:00', '01:00']
          },
          {
            id: 'weekend_end',
            type: 'select',
            label: 'Weekend Quiet Hours End',
            is_required: true,
            order: 4,
            options: ['07:00', '08:00', '09:00']
          }
        ]
      }
    ]
  },
  
  guest_policy: {
    category: 'guest_policy',
    name: 'Guest Policy',
    description: 'Rules about having guests and visitors',
    icon: 'Users',
    color: 'bg-indigo-100 text-indigo-800',
    sections: [
      {
        id: 'guest_rules',
        title: 'Guest Rules',
        description: 'Policies for guests and visitors',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'overnight_guests',
            type: 'select',
            label: 'Overnight Guest Policy',
            is_required: true,
            order: 1,
            options: ['No overnight guests', '1 night max', '3 nights max', '1 week max', 'No limit']
          },
          {
            id: 'guest_notification',
            type: 'select',
            label: 'Guest Notification Required',
            is_required: true,
            order: 2,
            options: ['24 hours notice', 'Same day notice', 'No notice required']
          },
          {
            id: 'guest_areas',
            type: 'multiselect',
            label: 'Areas Guests Can Use',
            order: 3,
            options: [
              'Common areas only',
              'Kitchen',
              'Living room',
              'Bathroom',
              'All areas'
            ]
          }
        ]
      }
    ]
  },
  
  cleaning_schedule: {
    category: 'cleaning_schedule',
    name: 'Cleaning Schedule',
    description: 'Regular cleaning responsibilities and schedule',
    icon: 'Sparkles',
    color: 'bg-pink-100 text-pink-800',
    sections: [
      {
        id: 'cleaning_tasks',
        title: 'Cleaning Tasks',
        description: 'Regular cleaning responsibilities',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'cleaning_frequency',
            type: 'select',
            label: 'General Cleaning Frequency',
            is_required: true,
            order: 1,
            options: ['Daily', 'Every other day', 'Weekly', 'Bi-weekly']
          },
          {
            id: 'deep_cleaning',
            type: 'select',
            label: 'Deep Cleaning Schedule',
            is_required: true,
            order: 2,
            options: ['Monthly', 'Bi-monthly', 'Quarterly', 'As needed']
          },
          {
            id: 'shared_responsibilities',
            type: 'multiselect',
            label: 'Shared Cleaning Responsibilities',
            order: 3,
            options: [
              'Kitchen counters',
              'Bathroom',
              'Living room',
              'Dishes',
              'Trash',
              'Vacuuming',
              'Mopping'
            ]
          }
        ]
      }
    ]
  },
  
  utilities: {
    category: 'utilities',
    name: 'Utilities & Bills',
    description: 'Management of utilities and shared bills',
    icon: 'Zap',
    color: 'bg-orange-100 text-orange-800',
    sections: [
      {
        id: 'utility_management',
        title: 'Utility Management',
        description: 'How utilities are managed and paid',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'utility_responsibility',
            type: 'select',
            label: 'Utility Bill Responsibility',
            is_required: true,
            order: 1,
            options: ['One person manages all', 'Rotating responsibility', 'Each person manages different utilities']
          },
          {
            id: 'payment_method',
            type: 'select',
            label: 'Payment Method',
            is_required: true,
            order: 2,
            options: ['Split equally', 'Split by usage', 'Split by room size', 'Other arrangement']
          },
          {
            id: 'due_date_reminder',
            type: 'select',
            label: 'Bill Due Date Reminder',
            is_required: true,
            order: 3,
            options: ['1 week before', '3 days before', '1 day before', 'No reminder']
          }
        ]
      }
    ]
  },
  
  parking: {
    category: 'parking',
    name: 'Parking & Storage',
    description: 'Parking spaces and storage arrangements',
    icon: 'Car',
    color: 'bg-gray-100 text-gray-800',
    sections: [
      {
        id: 'parking_rules',
        title: 'Parking Rules',
        description: 'Parking space assignments and rules',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'parking_assignment',
            type: 'select',
            label: 'Parking Space Assignment',
            is_required: true,
            order: 1,
            options: ['Assigned spaces', 'First come first served', 'No assigned spaces']
          },
          {
            id: 'guest_parking',
            type: 'select',
            label: 'Guest Parking Policy',
            is_required: true,
            order: 2,
            options: ['Allowed', 'Not allowed', 'Limited hours', 'Street parking only']
          },
          {
            id: 'storage_policy',
            type: 'textarea',
            label: 'Storage Policy',
            description: 'Rules about personal storage in common areas',
            is_required: false,
            order: 3
          }
        ]
      }
    ]
  },
  
  general: {
    category: 'general',
    name: 'General Agreement',
    description: 'General household agreement template',
    icon: 'FileText',
    color: 'bg-slate-100 text-slate-800',
    sections: [
      {
        id: 'general_terms',
        title: 'General Terms',
        description: 'General terms and conditions',
        order: 1,
        is_required: true,
        fields: [
          {
            id: 'agreement_duration',
            type: 'select',
            label: 'Agreement Duration',
            is_required: true,
            order: 1,
            options: ['6 months', '1 year', '2 years', 'Indefinite']
          },
          {
            id: 'termination_notice',
            type: 'select',
            label: 'Termination Notice Required',
            is_required: true,
            order: 2,
            options: ['30 days', '60 days', '90 days', 'No notice required']
          },
          {
            id: 'additional_terms',
            type: 'textarea',
            label: 'Additional Terms',
            description: 'Any additional terms or conditions',
            is_required: false,
            order: 3
          }
        ]
      }
    ]
  }
}

// Status colors and labels
export const AGREEMENT_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_signatures: { label: 'Pending Signatures', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
  terminated: { label: 'Terminated', color: 'bg-red-100 text-red-800' }
} as const

export const PARTICIPANT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800' }
} as const

export const DISPUTE_STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-800' },
  escalated: { label: 'Escalated', color: 'bg-purple-100 text-purple-800' }
} as const
