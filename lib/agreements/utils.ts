// Household Agreement Builder & E-sign System Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  AgreementTemplate,
  HouseholdAgreement,
  AgreementParticipant,
  AgreementVersion,
  AgreementDispute,
  AgreementNotification,
  AgreementStatusSummary,
  CreateAgreementData,
  InviteParticipantsData,
  SignAgreementData,
  CreateDisputeData,
  AgreementData,
  FilledAgreementSection,
  FilledAgreementField
} from './types'
import { AGREEMENT_TEMPLATES } from './types'

const supabase = createClient()

// Template functions
export async function getAgreementTemplates(): Promise<AgreementTemplate[]> {
  try {
    const { data: templates, error } = await supabase
      .from('agreement_templates')
      .select('*')
      .eq('is_public', true)
      .order('name')

    if (error) {
      console.error('Error fetching agreement templates:', error)
      return []
    }

    return templates || []
  } catch (error) {
    console.error('Error fetching agreement templates:', error)
    return []
  }
}

export async function getAgreementTemplate(templateId: string): Promise<AgreementTemplate | null> {
  try {
    const { data: template, error } = await supabase
      .from('agreement_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching agreement template:', error)
      return null
    }

    return template
  } catch (error) {
    console.error('Error fetching agreement template:', error)
    return null
  }
}

// Agreement functions
export async function createAgreement(data: CreateAgreementData): Promise<HouseholdAgreement | null> {
  try {
    const { data: agreement, error } = await supabase
      .from('household_agreements')
      .insert({
        title: data.title,
        description: data.description,
        template_id: data.template_id,
        household_name: data.household_name,
        household_address: data.household_address,
        requires_all_signatures: data.requires_all_signatures || true,
        auto_renewal: data.auto_renewal || false,
        renewal_period_months: data.renewal_period_months || 12,
        agreement_data: {} // Will be filled when template is processed
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating agreement:', error)
      return null
    }

    return agreement
  } catch (error) {
    console.error('Error creating agreement:', error)
    return null
  }
}

export async function getAgreementsForUser(userId: string): Promise<HouseholdAgreement[]> {
  try {
    const { data: agreements, error } = await supabase
      .from('household_agreements')
      .select(`
        *,
        agreement_participants!inner(user_id)
      `)
      .eq('agreement_participants.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agreements:', error)
      return []
    }

    return agreements || []
  } catch (error) {
    console.error('Error fetching agreements:', error)
    return []
  }
}

export async function getAgreement(agreementId: string): Promise<HouseholdAgreement | null> {
  try {
    const { data: agreement, error } = await supabase
      .from('household_agreements')
      .select('*')
      .eq('id', agreementId)
      .single()

    if (error) {
      console.error('Error fetching agreement:', error)
      return null
    }

    return agreement
  } catch (error) {
    console.error('Error fetching agreement:', error)
    return null
  }
}

export async function updateAgreement(
  agreementId: string, 
  updates: Partial<HouseholdAgreement>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('household_agreements')
      .update(updates)
      .eq('id', agreementId)

    if (error) {
      console.error('Error updating agreement:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating agreement:', error)
    return false
  }
}

// Participant functions
export async function inviteParticipants(data: InviteParticipantsData): Promise<boolean> {
  try {
    const participants = data.participant_ids.map(userId => ({
      agreement_id: data.agreement_id,
      user_id: userId,
      status: 'pending'
    }))

    const { error } = await supabase
      .from('agreement_participants')
      .insert(participants)

    if (error) {
      console.error('Error inviting participants:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inviting participants:', error)
    return false
  }
}

export async function getAgreementParticipants(agreementId: string): Promise<AgreementParticipant[]> {
  try {
    const { data: participants, error } = await supabase
      .from('agreement_participants')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at')

    if (error) {
      console.error('Error fetching agreement participants:', error)
      return []
    }

    return participants || []
  } catch (error) {
    console.error('Error fetching agreement participants:', error)
    return []
  }
}

export async function signAgreement(data: SignAgreementData): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('sign_agreement', {
      p_agreement_id: data.agreement_id,
      p_signature_data: data.signature_data
    })

    if (error) {
      console.error('Error signing agreement:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error signing agreement:', error)
    return false
  }
}

// Dispute functions
export async function createDispute(data: CreateDisputeData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agreement_disputes')
      .insert({
        agreement_id: data.agreement_id,
        dispute_type: data.dispute_type,
        description: data.description,
        evidence_urls: data.evidence_urls
      })

    if (error) {
      console.error('Error creating dispute:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating dispute:', error)
    return false
  }
}

export async function getAgreementDisputes(agreementId: string): Promise<AgreementDispute[]> {
  try {
    const { data: disputes, error } = await supabase
      .from('agreement_disputes')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching disputes:', error)
      return []
    }

    return disputes || []
  } catch (error) {
    console.error('Error fetching disputes:', error)
    return []
  }
}

// Notification functions
export async function getAgreementNotifications(userId: string): Promise<AgreementNotification[]> {
  try {
    const { data: notifications, error } = await supabase
      .from('agreement_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return notifications || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('agreement_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

// Agreement status functions
export async function getAgreementStatus(agreementId: string): Promise<AgreementStatusSummary | null> {
  try {
    const { data: status, error } = await supabase.rpc('get_agreement_status', {
      p_agreement_id: agreementId
    })

    if (error) {
      console.error('Error fetching agreement status:', error)
      return null
    }

    return status?.[0] || null
  } catch (error) {
    console.error('Error fetching agreement status:', error)
    return null
  }
}

// Utility functions for agreement data processing
export function processTemplateToAgreement(
  templateData: any,
  filledValues: Record<string, any>
): AgreementData {
  const sections: FilledAgreementSection[] = templateData.sections.map((section: any) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    order: section.order,
    is_required: section.is_required,
    fields: section.fields.map((field: any) => ({
      id: field.id,
      type: field.type,
      label: field.label,
      value: filledValues[field.id] || field.default_value || '',
      is_required: field.is_required,
      order: field.order
    }))
  }))

  return {
    sections,
    metadata: {
      template_version: templateData.metadata?.version || '1.0',
      filled_at: new Date().toISOString(),
      filled_by: 'current_user' // This should be replaced with actual user ID
    }
  }
}

export function validateAgreementData(agreementData: AgreementData): string[] {
  const errors: string[] = []

  agreementData.sections.forEach(section => {
    if (section.is_required) {
      section.fields.forEach(field => {
        if (field.is_required && (!field.value || field.value.toString().trim() === '')) {
          errors.push(`${field.label} is required`)
        }
      })
    }
  })

  return errors
}

export function getTemplateConfig(category: string) {
  return AGREEMENT_TEMPLATES[category as keyof typeof AGREEMENT_TEMPLATES]
}

export function formatAgreementDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function isAgreementExpired(expirationDate: string): boolean {
  return new Date(expirationDate) < new Date()
}

export function getDaysUntilExpiration(expirationDate: string): number {
  const expiration = new Date(expirationDate)
  const today = new Date()
  const diffTime = expiration.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Demo data functions for testing
export function getDemoAgreements(): HouseholdAgreement[] {
  return [
    {
      id: '1',
      title: 'Spring 2024 House Rules',
      description: 'Basic house rules for our shared apartment',
      template_id: 'house_rules_template',
      agreement_data: {
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
                value: '23:00',
                is_required: true,
                order: 1
              },
              {
                id: 'quiet_hours_end',
                type: 'select',
                label: 'Quiet Hours End',
                value: '07:00',
                is_required: true,
                order: 2
              },
              {
                id: 'guest_policy',
                type: 'textarea',
                label: 'Guest Policy',
                value: 'Guests are welcome but please give 24-hour notice for overnight stays.',
                is_required: true,
                order: 3
              }
            ]
          }
        ],
        metadata: {
          template_version: '1.0',
          filled_at: '2024-01-15T10:00:00Z',
          filled_by: 'demo-user-id'
        }
      },
      status: 'active',
      effective_date: '2024-01-15',
      expiration_date: '2024-07-15',
      household_name: 'Campus View Apartments',
      household_address: '123 University Ave, Amsterdam',
      requires_all_signatures: true,
      auto_renewal: false,
      renewal_period_months: 12,
      needs_admin_review: false,
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Chore Rotation Schedule',
      description: 'Weekly chore rotation for fair distribution',
      template_id: 'chore_rotation_template',
      agreement_data: {
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
                value: 'Weekly',
                is_required: true,
                order: 1
              },
              {
                id: 'chore_list',
                type: 'multiselect',
                label: 'Chores to Include',
                value: ['Kitchen cleaning', 'Bathroom cleaning', 'Trash removal', 'Vacuuming'],
                is_required: true,
                order: 2
              }
            ]
          }
        ],
        metadata: {
          template_version: '1.0',
          filled_at: '2024-01-20T14:30:00Z',
          filled_by: 'demo-user-id'
        }
      },
      status: 'pending_signatures',
      household_name: 'Campus View Apartments',
      household_address: '123 University Ave, Amsterdam',
      requires_all_signatures: true,
      auto_renewal: true,
      renewal_period_months: 12,
      needs_admin_review: false,
      created_by: 'demo-user-id',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    }
  ]
}

export function getDemoParticipants(): AgreementParticipant[] {
  return [
    {
      id: '1',
      agreement_id: '1',
      user_id: 'demo-user-id',
      role: 'tenant',
      status: 'signed',
      signature_data: {
        signature_text: 'Sarah Johnson',
        timestamp: '2024-01-15T10:30:00Z',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...'
      },
      signed_at: '2024-01-15T10:30:00Z',
      signature_ip: '192.168.1.1',
      signature_user_agent: 'Mozilla/5.0...',
      invited_at: '2024-01-15T10:00:00Z',
      reminder_count: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      agreement_id: '1',
      user_id: 'user-1',
      role: 'tenant',
      status: 'signed',
      signature_data: {
        signature_text: 'Alex Chen',
        timestamp: '2024-01-15T11:00:00Z',
        ip_address: '192.168.1.2',
        user_agent: 'Mozilla/5.0...'
      },
      signed_at: '2024-01-15T11:00:00Z',
      signature_ip: '192.168.1.2',
      signature_user_agent: 'Mozilla/5.0...',
      invited_at: '2024-01-15T10:00:00Z',
      reminder_count: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      agreement_id: '2',
      user_id: 'demo-user-id',
      role: 'tenant',
      status: 'signed',
      signature_data: {
        signature_text: 'Sarah Johnson',
        timestamp: '2024-01-20T15:00:00Z',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...'
      },
      signed_at: '2024-01-20T15:00:00Z',
      signature_ip: '192.168.1.1',
      signature_user_agent: 'Mozilla/5.0...',
      invited_at: '2024-01-20T14:30:00Z',
      reminder_count: 0,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T15:00:00Z'
    },
    {
      id: '4',
      agreement_id: '2',
      user_id: 'user-1',
      role: 'tenant',
      status: 'pending',
      invited_at: '2024-01-20T14:30:00Z',
      reminder_count: 1,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    }
  ]
}

export function getDemoTemplates(): AgreementTemplate[] {
  return Object.values(AGREEMENT_TEMPLATES).map((config, index) => ({
    id: `template-${index + 1}`,
    name: config.name,
    description: config.description,
    category: config.category,
    template_data: {
      sections: config.sections,
      metadata: {
        version: '1.0',
        created_by: 'system',
        last_modified: '2024-01-01T00:00:00Z'
      }
    },
    is_public: true,
    is_system_template: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }))
}
