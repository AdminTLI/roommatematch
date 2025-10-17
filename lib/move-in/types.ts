// Move-in Planner with Tasks, Expenses & Timeline System Types

export interface MoveInPlan {
  id: string
  title: string
  description?: string
  move_in_date: string
  move_out_date?: string
  property_address: string
  property_type: PropertyType
  is_shared: boolean
  budget_limit?: number
  currency: string
  status: PlanStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface MoveInPlanParticipant {
  id: string
  plan_id: string
  user_id: string
  role: ParticipantRole
  can_edit_plan: boolean
  can_manage_tasks: boolean
  can_manage_expenses: boolean
  email_notifications: boolean
  push_notifications: boolean
  joined_at: string
  created_at: string
}

export interface MoveInTask {
  id: string
  plan_id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  due_date?: string
  estimated_duration_hours?: number
  is_recurring: boolean
  recurrence_pattern?: string
  assigned_to?: string
  status: TaskStatus
  completed_at?: string
  completed_by?: string
  depends_on_task_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface MoveInExpense {
  id: string
  plan_id: string
  title: string
  description?: string
  category: ExpenseCategory
  amount: number
  currency: string
  is_shared_expense: boolean
  split_method: SplitMethod
  payment_status: PaymentStatus
  payment_method?: string
  payment_app?: string
  payment_reference?: string
  due_date?: string
  paid_date?: string
  receipt_url?: string
  paid_by?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface MoveInExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount_owed: number
  amount_paid: number
  percentage?: number
  payment_status: PaymentStatus
  paid_date?: string
  created_at: string
  updated_at: string
}

export interface MoveInTimelineEvent {
  id: string
  plan_id: string
  title: string
  description?: string
  event_type: EventType
  event_date: string
  event_time?: string
  duration_minutes?: number
  is_all_day: boolean
  location?: string
  attendees?: string[]
  reminder_minutes?: number[]
  notification_sent: boolean
  status: EventStatus
  completed_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface MoveInChecklist {
  id: string
  plan_id: string
  title: string
  description?: string
  category: ChecklistCategory
  is_template: boolean
  total_items: number
  completed_items: number
  completion_percentage: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface MoveInChecklistItem {
  id: string
  checklist_id: string
  title: string
  description?: string
  order_index: number
  is_completed: boolean
  completed_at?: string
  completed_by?: string
  assigned_to?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface MoveInNote {
  id: string
  plan_id: string
  title?: string
  content: string
  note_type: NoteType
  tags?: string[]
  is_pinned: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Enums
export type PropertyType = 'apartment' | 'house' | 'studio' | 'shared_room' | 'dormitory'
export type PlanStatus = 'planning' | 'in_progress' | 'completed' | 'cancelled'
export type ParticipantRole = 'tenant' | 'landlord' | 'property_manager' | 'helper'

export type TaskCategory = 
  | 'packing' 
  | 'cleaning' 
  | 'utilities' 
  | 'furniture' 
  | 'documents' 
  | 'insurance' 
  | 'transport' 
  | 'setup' 
  | 'other'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'

export type ExpenseCategory = 
  | 'deposit' 
  | 'rent' 
  | 'utilities' 
  | 'furniture' 
  | 'appliances' 
  | 'cleaning' 
  | 'transport' 
  | 'storage' 
  | 'insurance' 
  | 'other'

export type SplitMethod = 'equal' | 'by_room_size' | 'by_usage' | 'custom'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled'

export type EventType = 'milestone' | 'deadline' | 'reminder' | 'meeting' | 'delivery' | 'appointment' | 'other'
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export type ChecklistCategory = 'packing' | 'cleaning' | 'setup' | 'utilities' | 'documents' | 'furniture' | 'general'
export type NoteType = 'general' | 'update' | 'reminder' | 'question' | 'issue' | 'solution'

// Form types
export interface CreateMoveInPlanData {
  title: string
  description?: string
  move_in_date: string
  move_out_date?: string
  property_address: string
  property_type: PropertyType
  is_shared?: boolean
  budget_limit?: number
  currency?: string
  participant_ids?: string[]
}

export interface CreateTaskData {
  plan_id: string
  title: string
  description?: string
  category: TaskCategory
  priority?: TaskPriority
  due_date?: string
  estimated_duration_hours?: number
  assigned_to?: string
  depends_on_task_id?: string
}

export interface CreateExpenseData {
  plan_id: string
  title: string
  description?: string
  category: ExpenseCategory
  amount: number
  currency?: string
  is_shared_expense?: boolean
  split_method?: SplitMethod
  due_date?: string
  payment_method?: string
  payment_app?: string
}

export interface CreateTimelineEventData {
  plan_id: string
  title: string
  description?: string
  event_type: EventType
  event_date: string
  event_time?: string
  duration_minutes?: number
  is_all_day?: boolean
  location?: string
  attendees?: string[]
  reminder_minutes?: number[]
}

export interface CreateChecklistData {
  plan_id: string
  title: string
  description?: string
  category?: ChecklistCategory
  is_template?: boolean
}

export interface CreateNoteData {
  plan_id: string
  title?: string
  content: string
  note_type?: NoteType
  tags?: string[]
  is_pinned?: boolean
}

// Summary and dashboard types
export interface MoveInPlanSummary {
  plan_id: string
  title: string
  status: PlanStatus
  move_in_date: string
  total_tasks: number
  completed_tasks: number
  total_expenses: number
  paid_expenses: number
  total_participants: number
  completion_percentage: number
}

export interface TaskSummary {
  total: number
  completed: number
  in_progress: number
  overdue: number
  by_category: Record<TaskCategory, number>
  by_priority: Record<TaskPriority, number>
}

export interface ExpenseSummary {
  total_amount: number
  paid_amount: number
  pending_amount: number
  by_category: Record<ExpenseCategory, number>
  by_status: Record<PaymentStatus, number>
}

export interface TimelineSummary {
  upcoming_events: MoveInTimelineEvent[]
  overdue_events: MoveInTimelineEvent[]
  completed_events: MoveInTimelineEvent[]
}

// Configuration types
export interface TaskCategoryConfig {
  category: TaskCategory
  name: string
  description: string
  icon: string
  color: string
  default_priority: TaskPriority
}

export interface ExpenseCategoryConfig {
  category: ExpenseCategory
  name: string
  description: string
  icon: string
  color: string
  is_shared_default: boolean
  default_split_method: SplitMethod
}

export interface EventTypeConfig {
  type: EventType
  name: string
  description: string
  icon: string
  color: string
  default_reminder_minutes: number[]
}

// Pre-defined configurations
export const TASK_CATEGORY_CONFIGS: Record<TaskCategory, TaskCategoryConfig> = {
  packing: {
    category: 'packing',
    name: 'Packing',
    description: 'Items to pack and organize',
    icon: 'Package',
    color: 'bg-blue-100 text-blue-800',
    default_priority: 'medium'
  },
  cleaning: {
    category: 'cleaning',
    name: 'Cleaning',
    description: 'Cleaning tasks and supplies',
    icon: 'Sparkles',
    color: 'bg-green-100 text-green-800',
    default_priority: 'high'
  },
  utilities: {
    category: 'utilities',
    name: 'Utilities',
    description: 'Utility setup and connections',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-800',
    default_priority: 'high'
  },
  furniture: {
    category: 'furniture',
    name: 'Furniture',
    description: 'Furniture purchase and assembly',
    icon: 'Sofa',
    color: 'bg-purple-100 text-purple-800',
    default_priority: 'medium'
  },
  documents: {
    category: 'documents',
    name: 'Documents',
    description: 'Important paperwork and forms',
    icon: 'FileText',
    color: 'bg-indigo-100 text-indigo-800',
    default_priority: 'high'
  },
  insurance: {
    category: 'insurance',
    name: 'Insurance',
    description: 'Insurance setup and claims',
    icon: 'Shield',
    color: 'bg-red-100 text-red-800',
    default_priority: 'high'
  },
  transport: {
    category: 'transport',
    name: 'Transport',
    description: 'Moving and transportation',
    icon: 'Truck',
    color: 'bg-orange-100 text-orange-800',
    default_priority: 'medium'
  },
  setup: {
    category: 'setup',
    name: 'Setup',
    description: 'Home setup and configuration',
    icon: 'Wrench',
    color: 'bg-teal-100 text-teal-800',
    default_priority: 'medium'
  },
  other: {
    category: 'other',
    name: 'Other',
    description: 'Miscellaneous tasks',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 text-gray-800',
    default_priority: 'low'
  }
}

export const EXPENSE_CATEGORY_CONFIGS: Record<ExpenseCategory, ExpenseCategoryConfig> = {
  deposit: {
    category: 'deposit',
    name: 'Deposit',
    description: 'Security and other deposits',
    icon: 'CreditCard',
    color: 'bg-red-100 text-red-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  rent: {
    category: 'rent',
    name: 'Rent',
    description: 'Monthly rent payments',
    icon: 'Home',
    color: 'bg-blue-100 text-blue-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  utilities: {
    category: 'utilities',
    name: 'Utilities',
    description: 'Electricity, gas, water, internet',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  furniture: {
    category: 'furniture',
    name: 'Furniture',
    description: 'Furniture and home decor',
    icon: 'Sofa',
    color: 'bg-purple-100 text-purple-800',
    is_shared_default: false,
    default_split_method: 'custom'
  },
  appliances: {
    category: 'appliances',
    name: 'Appliances',
    description: 'Kitchen and home appliances',
    icon: 'Microwave',
    color: 'bg-indigo-100 text-indigo-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  cleaning: {
    category: 'cleaning',
    name: 'Cleaning',
    description: 'Cleaning supplies and services',
    icon: 'Sparkles',
    color: 'bg-green-100 text-green-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  transport: {
    category: 'transport',
    name: 'Transport',
    description: 'Moving and transportation costs',
    icon: 'Truck',
    color: 'bg-orange-100 text-orange-800',
    is_shared_default: false,
    default_split_method: 'custom'
  },
  storage: {
    category: 'storage',
    name: 'Storage',
    description: 'Storage unit and temporary storage',
    icon: 'Archive',
    color: 'bg-teal-100 text-teal-800',
    is_shared_default: false,
    default_split_method: 'custom'
  },
  insurance: {
    category: 'insurance',
    name: 'Insurance',
    description: 'Home and contents insurance',
    icon: 'Shield',
    color: 'bg-red-100 text-red-800',
    is_shared_default: true,
    default_split_method: 'equal'
  },
  other: {
    category: 'other',
    name: 'Other',
    description: 'Miscellaneous expenses',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 text-gray-800',
    is_shared_default: false,
    default_split_method: 'custom'
  }
}

export const EVENT_TYPE_CONFIGS: Record<EventType, EventTypeConfig> = {
  milestone: {
    type: 'milestone',
    name: 'Milestone',
    description: 'Important milestone or deadline',
    icon: 'Flag',
    color: 'bg-blue-100 text-blue-800',
    default_reminder_minutes: [1440, 60] // 1 day, 1 hour
  },
  deadline: {
    type: 'deadline',
    name: 'Deadline',
    description: 'Critical deadline or cutoff',
    icon: 'Clock',
    color: 'bg-red-100 text-red-800',
    default_reminder_minutes: [2880, 1440, 60] // 2 days, 1 day, 1 hour
  },
  reminder: {
    type: 'reminder',
    name: 'Reminder',
    description: 'General reminder or note',
    icon: 'Bell',
    color: 'bg-yellow-100 text-yellow-800',
    default_reminder_minutes: [60] // 1 hour
  },
  meeting: {
    type: 'meeting',
    name: 'Meeting',
    description: 'Meeting or appointment',
    icon: 'Users',
    color: 'bg-green-100 text-green-800',
    default_reminder_minutes: [1440, 30] // 1 day, 30 minutes
  },
  delivery: {
    type: 'delivery',
    name: 'Delivery',
    description: 'Package or service delivery',
    icon: 'Package',
    color: 'bg-purple-100 text-purple-800',
    default_reminder_minutes: [1440, 60] // 1 day, 1 hour
  },
  appointment: {
    type: 'appointment',
    name: 'Appointment',
    description: 'Scheduled appointment',
    icon: 'Calendar',
    color: 'bg-indigo-100 text-indigo-800',
    default_reminder_minutes: [1440, 60, 15] // 1 day, 1 hour, 15 minutes
  },
  other: {
    type: 'other',
    name: 'Other',
    description: 'Other event type',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 text-gray-800',
    default_reminder_minutes: [60] // 1 hour
  }
}

// Status configurations
export const PLAN_STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
} as const

export const TASK_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' }
} as const

export const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
} as const

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
} as const
