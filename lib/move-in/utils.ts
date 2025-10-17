// Move-in Planner with Tasks, Expenses & Timeline System Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  MoveInPlan,
  MoveInPlanParticipant,
  MoveInTask,
  MoveInExpense,
  MoveInExpenseSplit,
  MoveInTimelineEvent,
  MoveInChecklist,
  MoveInChecklistItem,
  MoveInNote,
  MoveInPlanSummary,
  TaskSummary,
  ExpenseSummary,
  TimelineSummary,
  CreateMoveInPlanData,
  CreateTaskData,
  CreateExpenseData,
  CreateTimelineEventData,
  CreateChecklistData,
  CreateNoteData
} from './types'
import { TASK_CATEGORY_CONFIGS, EXPENSE_CATEGORY_CONFIGS, EVENT_TYPE_CONFIGS } from './types'

const supabase = createClient()

// Plan functions
export async function createMoveInPlan(data: CreateMoveInPlanData): Promise<MoveInPlan | null> {
  try {
    const { data: plan, error } = await supabase.rpc('create_move_in_plan', {
      p_title: data.title,
      p_description: data.description,
      p_move_in_date: data.move_in_date,
      p_property_address: data.property_address,
      p_participant_ids: data.participant_ids || []
    })

    if (error) {
      console.error('Error creating move-in plan:', error)
      return null
    }

    return plan
  } catch (error) {
    console.error('Error creating move-in plan:', error)
    return null
  }
}

export async function getMoveInPlansForUser(userId: string): Promise<MoveInPlan[]> {
  try {
    const { data: plans, error } = await supabase
      .from('move_in_plans')
      .select(`
        *,
        move_in_plan_participants!inner(user_id)
      `)
      .eq('move_in_plan_participants.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching move-in plans:', error)
      return []
    }

    return plans || []
  } catch (error) {
    console.error('Error fetching move-in plans:', error)
    return []
  }
}

export async function getMoveInPlan(planId: string): Promise<MoveInPlan | null> {
  try {
    const { data: plan, error } = await supabase
      .from('move_in_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Error fetching move-in plan:', error)
      return null
    }

    return plan
  } catch (error) {
    console.error('Error fetching move-in plan:', error)
    return null
  }
}

export async function getMoveInPlanSummary(planId: string): Promise<MoveInPlanSummary | null> {
  try {
    const { data: summary, error } = await supabase.rpc('get_move_in_plan_summary', {
      p_plan_id: planId
    })

    if (error) {
      console.error('Error fetching plan summary:', error)
      return null
    }

    return summary?.[0] || null
  } catch (error) {
    console.error('Error fetching plan summary:', error)
    return null
  }
}

// Participant functions
export async function getMoveInPlanParticipants(planId: string): Promise<MoveInPlanParticipant[]> {
  try {
    const { data: participants, error } = await supabase
      .from('move_in_plan_participants')
      .select('*')
      .eq('plan_id', planId)
      .order('joined_at')

    if (error) {
      console.error('Error fetching plan participants:', error)
      return []
    }

    return participants || []
  } catch (error) {
    console.error('Error fetching plan participants:', error)
    return []
  }
}

// Task functions
export async function createMoveInTask(data: CreateTaskData): Promise<MoveInTask | null> {
  try {
    const { data: task, error } = await supabase
      .from('move_in_tasks')
      .insert({
        plan_id: data.plan_id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'medium',
        due_date: data.due_date,
        estimated_duration_hours: data.estimated_duration_hours,
        assigned_to: data.assigned_to,
        depends_on_task_id: data.depends_on_task_id,
        created_by: 'current_user' // This should be replaced with actual user ID
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return null
    }

    return task
  } catch (error) {
    console.error('Error creating task:', error)
    return null
  }
}

export async function getMoveInTasks(planId: string): Promise<MoveInTask[]> {
  try {
    const { data: tasks, error } = await supabase
      .from('move_in_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return tasks || []
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export async function updateTaskStatus(taskId: string, status: string, completedBy?: string): Promise<boolean> {
  try {
    const updates: any = { status }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
      updates.completed_by = completedBy
    }

    const { error } = await supabase
      .from('move_in_tasks')
      .update(updates)
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating task status:', error)
    return false
  }
}

// Expense functions
export async function createMoveInExpense(data: CreateExpenseData): Promise<MoveInExpense | null> {
  try {
    const { data: expense, error } = await supabase
      .from('move_in_expenses')
      .insert({
        plan_id: data.plan_id,
        title: data.title,
        description: data.description,
        category: data.category,
        amount: data.amount,
        currency: data.currency || 'EUR',
        is_shared_expense: data.is_shared_expense || false,
        split_method: data.split_method || 'equal',
        due_date: data.due_date,
        payment_method: data.payment_method,
        payment_app: data.payment_app,
        created_by: 'current_user' // This should be replaced with actual user ID
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating expense:', error)
      return null
    }

    return expense
  } catch (error) {
    console.error('Error creating expense:', error)
    return null
  }
}

export async function getMoveInExpenses(planId: string): Promise<MoveInExpense[]> {
  try {
    const { data: expenses, error } = await supabase
      .from('move_in_expenses')
      .select('*')
      .eq('plan_id', planId)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching expenses:', error)
      return []
    }

    return expenses || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export async function getMoveInExpenseSplits(expenseId: string): Promise<MoveInExpenseSplit[]> {
  try {
    const { data: splits, error } = await supabase
      .from('move_in_expense_splits')
      .select('*')
      .eq('expense_id', expenseId)

    if (error) {
      console.error('Error fetching expense splits:', error)
      return []
    }

    return splits || []
  } catch (error) {
    console.error('Error fetching expense splits:', error)
    return []
  }
}

// Timeline event functions
export async function createMoveInTimelineEvent(data: CreateTimelineEventData): Promise<MoveInTimelineEvent | null> {
  try {
    const { data: event, error } = await supabase
      .from('move_in_timeline_events')
      .insert({
        plan_id: data.plan_id,
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        event_date: data.event_date,
        event_time: data.event_time,
        duration_minutes: data.duration_minutes,
        is_all_day: data.is_all_day || false,
        location: data.location,
        attendees: data.attendees,
        reminder_minutes: data.reminder_minutes,
        created_by: 'current_user' // This should be replaced with actual user ID
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating timeline event:', error)
      return null
    }

    return event
  } catch (error) {
    console.error('Error creating timeline event:', error)
    return null
  }
}

export async function getMoveInTimelineEvents(planId: string): Promise<MoveInTimelineEvent[]> {
  try {
    const { data: events, error } = await supabase
      .from('move_in_timeline_events')
      .select('*')
      .eq('plan_id', planId)
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching timeline events:', error)
      return []
    }

    return events || []
  } catch (error) {
    console.error('Error fetching timeline events:', error)
    return []
  }
}

// Checklist functions
export async function createMoveInChecklist(data: CreateChecklistData): Promise<MoveInChecklist | null> {
  try {
    const { data: checklist, error } = await supabase
      .from('move_in_checklists')
      .insert({
        plan_id: data.plan_id,
        title: data.title,
        description: data.description,
        category: data.category || 'general',
        is_template: data.is_template || false,
        created_by: 'current_user' // This should be replaced with actual user ID
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating checklist:', error)
      return null
    }

    return checklist
  } catch (error) {
    console.error('Error creating checklist:', error)
    return null
  }
}

export async function getMoveInChecklists(planId: string): Promise<MoveInChecklist[]> {
  try {
    const { data: checklists, error } = await supabase
      .from('move_in_checklists')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching checklists:', error)
      return []
    }

    return checklists || []
  } catch (error) {
    console.error('Error fetching checklists:', error)
    return []
  }
}

export async function getMoveInChecklistItems(checklistId: string): Promise<MoveInChecklistItem[]> {
  try {
    const { data: items, error } = await supabase
      .from('move_in_checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('order_index')

    if (error) {
      console.error('Error fetching checklist items:', error)
      return []
    }

    return items || []
  } catch (error) {
    console.error('Error fetching checklist items:', error)
    return []
  }
}

// Note functions
export async function createMoveInNote(data: CreateNoteData): Promise<MoveInNote | null> {
  try {
    const { data: note, error } = await supabase
      .from('move_in_notes')
      .insert({
        plan_id: data.plan_id,
        title: data.title,
        content: data.content,
        note_type: data.note_type || 'general',
        tags: data.tags,
        is_pinned: data.is_pinned || false,
        created_by: 'current_user' // This should be replaced with actual user ID
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return null
    }

    return note
  } catch (error) {
    console.error('Error creating note:', error)
    return null
  }
}

export async function getMoveInNotes(planId: string): Promise<MoveInNote[]> {
  try {
    const { data: notes, error } = await supabase
      .from('move_in_notes')
      .select('*')
      .eq('plan_id', planId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }

    return notes || []
  } catch (error) {
    console.error('Error fetching notes:', error)
    return []
  }
}

// Summary and analytics functions
export function calculateTaskSummary(tasks: MoveInTask[]): TaskSummary {
  const summary: TaskSummary = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    by_category: {} as Record<string, number>,
    by_priority: {} as Record<string, number>
  }

  // Initialize category counts
  Object.keys(TASK_CATEGORY_CONFIGS).forEach(category => {
    summary.by_category[category as keyof typeof TASK_CATEGORY_CONFIGS] = 0
  })

  // Initialize priority counts
  Object.keys({ low: 0, medium: 0, high: 0, urgent: 0 }).forEach(priority => {
    summary.by_priority[priority as keyof typeof summary.by_priority] = 0
  })

  // Count tasks by category and priority
  tasks.forEach(task => {
    summary.by_category[task.category]++
    summary.by_priority[task.priority]++
  })

  return summary
}

export function calculateExpenseSummary(expenses: MoveInExpense[]): ExpenseSummary {
  const summary: ExpenseSummary = {
    total_amount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    paid_amount: expenses
      .filter(e => e.payment_status === 'paid')
      .reduce((sum, expense) => sum + expense.amount, 0),
    pending_amount: expenses
      .filter(e => e.payment_status === 'pending')
      .reduce((sum, expense) => sum + expense.amount, 0),
    by_category: {} as Record<string, number>,
    by_status: {} as Record<string, number>
  }

  // Initialize category counts
  Object.keys(EXPENSE_CATEGORY_CONFIGS).forEach(category => {
    summary.by_category[category as keyof typeof EXPENSE_CATEGORY_CONFIGS] = 0
  })

  // Initialize status counts
  Object.keys({ pending: 0, paid: 0, partial: 0, cancelled: 0 }).forEach(status => {
    summary.by_status[status as keyof typeof summary.by_status] = 0
  })

  // Count expenses by category and status
  expenses.forEach(expense => {
    summary.by_category[expense.category] += expense.amount
    summary.by_status[expense.payment_status] += expense.amount
  })

  return summary
}

export function calculateTimelineSummary(events: MoveInTimelineEvent[]): TimelineSummary {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return {
    upcoming_events: events.filter(event => {
      const eventDate = new Date(event.event_date)
      return eventDate >= today && event.status === 'scheduled'
    }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    
    overdue_events: events.filter(event => {
      const eventDate = new Date(event.event_date)
      return eventDate < today && event.status === 'scheduled'
    }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    
    completed_events: events.filter(event => event.status === 'completed')
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
  }
}

// Utility functions
export function formatMoveInDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getDaysUntilMoveIn(moveInDate: string): number {
  const moveIn = new Date(moveInDate)
  const today = new Date()
  const diffTime = moveIn.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isTaskOverdue(task: MoveInTask): boolean {
  if (!task.due_date || task.status === 'completed') return false
  return new Date(task.due_date) < new Date()
}

export function getTaskCategoryConfig(category: string) {
  return TASK_CATEGORY_CONFIGS[category as keyof typeof TASK_CATEGORY_CONFIGS]
}

export function getExpenseCategoryConfig(category: string) {
  return EXPENSE_CATEGORY_CONFIGS[category as keyof typeof EXPENSE_CATEGORY_CONFIGS]
}

export function getEventTypeConfig(type: string) {
  return EVENT_TYPE_CONFIGS[type as keyof typeof EVENT_TYPE_CONFIGS]
}

// Demo data functions for testing
export function getDemoMoveInPlans(): MoveInPlan[] {
  return [
    {
      id: '1',
      title: 'Spring 2024 Move-in',
      description: 'Moving into our new shared apartment',
      move_in_date: '2024-03-15',
      move_out_date: '2024-08-31',
      property_address: '123 University Ave, Amsterdam',
      property_type: 'apartment',
      is_shared: true,
      budget_limit: 5000,
      currency: 'EUR',
      status: 'in_progress',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Summer Move-in Plan',
      description: 'Planning for summer semester move-in',
      move_in_date: '2024-06-01',
      property_address: '456 Student Street, Utrecht',
      property_type: 'studio',
      is_shared: false,
      budget_limit: 3000,
      currency: 'EUR',
      status: 'planning',
      created_by: 'demo-user-id',
      created_at: '2024-02-01T14:30:00Z',
      updated_at: '2024-02-01T14:30:00Z'
    }
  ]
}

export function getDemoTasks(): MoveInTask[] {
  return [
    {
      id: '1',
      plan_id: '1',
      title: 'Pack bedroom items',
      description: 'Pack clothes, books, and personal items',
      category: 'packing',
      priority: 'high',
      due_date: '2024-03-10',
      estimated_duration_hours: 4,
      is_recurring: false,
      assigned_to: 'demo-user-id',
      status: 'completed',
      completed_at: '2024-03-09T16:00:00Z',
      completed_by: 'demo-user-id',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-03-09T16:00:00Z'
    },
    {
      id: '2',
      plan_id: '1',
      title: 'Set up internet connection',
      description: 'Contact provider and schedule installation',
      category: 'utilities',
      priority: 'high',
      due_date: '2024-03-14',
      estimated_duration_hours: 2,
      is_recurring: false,
      assigned_to: 'user-1',
      status: 'in_progress',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '3',
      plan_id: '1',
      title: 'Deep clean apartment',
      description: 'Clean all rooms before move-in',
      category: 'cleaning',
      priority: 'medium',
      due_date: '2024-03-12',
      estimated_duration_hours: 6,
      is_recurring: false,
      status: 'pending',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]
}

export function getDemoExpenses(): MoveInExpense[] {
  return [
    {
      id: '1',
      plan_id: '1',
      title: 'Security deposit',
      description: 'First month security deposit',
      category: 'deposit',
      amount: 1200,
      currency: 'EUR',
      is_shared_expense: true,
      split_method: 'equal',
      payment_status: 'paid',
      payment_method: 'bank_transfer',
      due_date: '2024-03-01',
      paid_date: '2024-02-28',
      paid_by: 'demo-user-id',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-02-28T10:00:00Z'
    },
    {
      id: '2',
      plan_id: '1',
      title: 'Moving truck rental',
      description: 'Rental for moving day',
      category: 'transport',
      amount: 150,
      currency: 'EUR',
      is_shared_expense: true,
      split_method: 'equal',
      payment_status: 'pending',
      due_date: '2024-03-15',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]
}

export function getDemoTimelineEvents(): MoveInTimelineEvent[] {
  return [
    {
      id: '1',
      plan_id: '1',
      title: 'Move-in day',
      description: 'Official move-in date',
      event_type: 'milestone',
      event_date: '2024-03-15',
      is_all_day: true,
      location: '123 University Ave, Amsterdam',
      attendees: ['demo-user-id', 'user-1'],
      reminder_minutes: [1440, 60],
      notification_sent: false,
      status: 'scheduled',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      plan_id: '1',
      title: 'Internet installation',
      description: 'Internet provider installation appointment',
      event_type: 'appointment',
      event_date: '2024-03-14',
      event_time: '14:00',
      duration_minutes: 120,
      is_all_day: false,
      location: '123 University Ave, Amsterdam',
      attendees: ['user-1'],
      reminder_minutes: [1440, 60, 15],
      notification_sent: false,
      status: 'scheduled',
      created_by: 'demo-user-id',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]
}
