-- Move-in Planner with Tasks, Expenses & Timeline System
-- This migration adds tables for managing move-in planning and coordination

-- Table for move-in plans (shared planning sessions)
CREATE TABLE move_in_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Move-in details
    move_in_date DATE NOT NULL,
    move_out_date DATE, -- For planning purposes
    property_address TEXT NOT NULL,
    property_type VARCHAR(50) DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'house', 'studio', 'shared_room', 'dormitory')),
    
    -- Plan settings
    is_shared BOOLEAN DEFAULT TRUE, -- Shared with roommates
    budget_limit DECIMAL(10,2), -- Total budget limit
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for plan participants (roommates involved in planning)
CREATE TABLE move_in_plan_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'property_manager', 'helper')),
    
    -- Participation settings
    can_edit_plan BOOLEAN DEFAULT TRUE,
    can_manage_tasks BOOLEAN DEFAULT TRUE,
    can_manage_expenses BOOLEAN DEFAULT TRUE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for move-in tasks
CREATE TABLE move_in_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Task details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('packing', 'cleaning', 'utilities', 'furniture', 'documents', 'insurance', 'transport', 'setup', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Task scheduling
    due_date DATE,
    estimated_duration_hours DECIMAL(4,2),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- e.g., 'weekly', 'monthly'
    
    -- Assignment and completion
    assigned_to UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    
    -- Task dependencies
    depends_on_task_id UUID REFERENCES move_in_tasks(id),
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for move-in expenses
CREATE TABLE move_in_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Expense details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('deposit', 'rent', 'utilities', 'furniture', 'appliances', 'cleaning', 'transport', 'storage', 'insurance', 'other')),
    
    -- Financial details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    is_shared_expense BOOLEAN DEFAULT TRUE, -- Shared among roommates
    split_method VARCHAR(50) DEFAULT 'equal' CHECK (split_method IN ('equal', 'by_room_size', 'by_usage', 'custom')),
    
    -- Payment information
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'cancelled')),
    payment_method VARCHAR(50), -- e.g., 'bank_transfer', 'cash', 'card', 'app'
    payment_app VARCHAR(50), -- e.g., 'tikkie', 'paypal', 'splitwise'
    payment_reference VARCHAR(100), -- Reference number or link
    
    -- Dates
    due_date DATE,
    paid_date DATE,
    receipt_url TEXT,
    
    -- Assignment
    paid_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for expense splits (how shared expenses are divided)
CREATE TABLE move_in_expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES move_in_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Split details
    amount_owed DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    percentage DECIMAL(5,2), -- Percentage of total expense
    
    -- Payment status for this user
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
    paid_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(expense_id, user_id)
);

-- Table for move-in timeline events
CREATE TABLE move_in_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('milestone', 'deadline', 'reminder', 'meeting', 'delivery', 'appointment', 'other')),
    
    -- Scheduling
    event_date DATE NOT NULL,
    event_time TIME,
    duration_minutes INTEGER,
    is_all_day BOOLEAN DEFAULT FALSE,
    
    -- Location and attendees
    location VARCHAR(200),
    attendees UUID[], -- Array of user IDs
    
    -- Notifications
    reminder_minutes INTEGER[], -- Array of reminder times in minutes before event
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for move-in checklists (pre-defined or custom checklists)
CREATE TABLE move_in_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Checklist details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('packing', 'cleaning', 'setup', 'utilities', 'documents', 'furniture', 'general')),
    is_template BOOLEAN DEFAULT FALSE, -- System template vs custom
    
    -- Progress tracking
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for checklist items
CREATE TABLE move_in_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES move_in_checklists(id) ON DELETE CASCADE,
    
    -- Item details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    
    -- Completion
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for move-in notes and updates
CREATE TABLE move_in_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Note details
    title VARCHAR(200),
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'update', 'reminder', 'question', 'issue', 'solution')),
    
    -- Organization
    tags VARCHAR(50)[],
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_move_in_plans_created_by ON move_in_plans(created_by);
CREATE INDEX idx_move_in_plans_status ON move_in_plans(status);
CREATE INDEX idx_move_in_plans_move_in_date ON move_in_plans(move_in_date);

CREATE INDEX idx_move_in_plan_participants_plan ON move_in_plan_participants(plan_id);
CREATE INDEX idx_move_in_plan_participants_user ON move_in_plan_participants(user_id);

CREATE INDEX idx_move_in_tasks_plan ON move_in_tasks(plan_id);
CREATE INDEX idx_move_in_tasks_assigned_to ON move_in_tasks(assigned_to);
CREATE INDEX idx_move_in_tasks_status ON move_in_tasks(status);
CREATE INDEX idx_move_in_tasks_due_date ON move_in_tasks(due_date);
CREATE INDEX idx_move_in_tasks_category ON move_in_tasks(category);

CREATE INDEX idx_move_in_expenses_plan ON move_in_expenses(plan_id);
CREATE INDEX idx_move_in_expenses_category ON move_in_expenses(category);
CREATE INDEX idx_move_in_expenses_payment_status ON move_in_expenses(payment_status);
CREATE INDEX idx_move_in_expenses_due_date ON move_in_expenses(due_date);

CREATE INDEX idx_move_in_expense_splits_expense ON move_in_expense_splits(expense_id);
CREATE INDEX idx_move_in_expense_splits_user ON move_in_expense_splits(user_id);

CREATE INDEX idx_move_in_timeline_events_plan ON move_in_timeline_events(plan_id);
CREATE INDEX idx_move_in_timeline_events_date ON move_in_timeline_events(event_date);
CREATE INDEX idx_move_in_timeline_events_type ON move_in_timeline_events(event_type);

CREATE INDEX idx_move_in_checklists_plan ON move_in_checklists(plan_id);
CREATE INDEX idx_move_in_checklists_category ON move_in_checklists(category);

CREATE INDEX idx_move_in_checklist_items_checklist ON move_in_checklist_items(checklist_id);
CREATE INDEX idx_move_in_checklist_items_assigned_to ON move_in_checklist_items(assigned_to);

CREATE INDEX idx_move_in_notes_plan ON move_in_notes(plan_id);
CREATE INDEX idx_move_in_notes_created_by ON move_in_notes(created_by);
CREATE INDEX idx_move_in_notes_type ON move_in_notes(note_type);

-- RLS Policies
ALTER TABLE move_in_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_plan_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_notes ENABLE ROW LEVEL SECURITY;

-- Users can view plans they participate in
CREATE POLICY "Users can view their move-in plans" ON move_in_plans
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM move_in_plan_participants 
            WHERE move_in_plan_participants.plan_id = move_in_plans.id 
            AND move_in_plan_participants.user_id = auth.uid()
        )
    );

-- Users can create plans
CREATE POLICY "Users can create move-in plans" ON move_in_plans
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update plans they created or have edit permissions
CREATE POLICY "Users can update move-in plans" ON move_in_plans
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM move_in_plan_participants 
            WHERE move_in_plan_participants.plan_id = move_in_plans.id 
            AND move_in_plan_participants.user_id = auth.uid()
            AND move_in_plan_participants.can_edit_plan = true
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view plan participants" ON move_in_plan_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_plan_participants.plan_id 
            AND move_in_plans.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage plan participants" ON move_in_plan_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_plan_participants.plan_id 
            AND move_in_plans.created_by = auth.uid()
        )
    );

-- Task policies
CREATE POLICY "Users can view plan tasks" ON move_in_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_tasks.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_tasks.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage plan tasks" ON move_in_tasks
    FOR ALL USING (
        auth.uid() = created_by OR
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_tasks.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_tasks.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                    AND move_in_plan_participants.can_manage_tasks = true
                )
            )
        )
    );

-- Expense policies
CREATE POLICY "Users can view plan expenses" ON move_in_expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_expenses.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_expenses.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage plan expenses" ON move_in_expenses
    FOR ALL USING (
        auth.uid() = created_by OR
        paid_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_expenses.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_expenses.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                    AND move_in_plan_participants.can_manage_expenses = true
                )
            )
        )
    );

-- Expense split policies
CREATE POLICY "Users can view their expense splits" ON move_in_expense_splits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their expense splits" ON move_in_expense_splits
    FOR UPDATE USING (user_id = auth.uid());

-- Timeline event policies
CREATE POLICY "Users can view plan timeline events" ON move_in_timeline_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_timeline_events.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_timeline_events.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage plan timeline events" ON move_in_timeline_events
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_timeline_events.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_timeline_events.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                    AND move_in_plan_participants.can_edit_plan = true
                )
            )
        )
    );

-- Checklist policies
CREATE POLICY "Users can view plan checklists" ON move_in_checklists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_checklists.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_checklists.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage plan checklists" ON move_in_checklists
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_checklists.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_checklists.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                    AND move_in_plan_participants.can_edit_plan = true
                )
            )
        )
    );

-- Checklist item policies
CREATE POLICY "Users can view checklist items" ON move_in_checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_checklists 
            WHERE move_in_checklists.id = move_in_checklist_items.checklist_id 
            AND EXISTS (
                SELECT 1 FROM move_in_plans 
                WHERE move_in_plans.id = move_in_checklists.plan_id 
                AND (
                    move_in_plans.created_by = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM move_in_plan_participants 
                        WHERE move_in_plan_participants.plan_id = move_in_checklists.plan_id 
                        AND move_in_plan_participants.user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can manage checklist items" ON move_in_checklist_items
    FOR ALL USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM move_in_checklists 
            WHERE move_in_checklists.id = move_in_checklist_items.checklist_id 
            AND EXISTS (
                SELECT 1 FROM move_in_plans 
                WHERE move_in_plans.id = move_in_checklists.plan_id 
                AND (
                    move_in_plans.created_by = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM move_in_plan_participants 
                        WHERE move_in_plan_participants.plan_id = move_in_checklists.plan_id 
                        AND move_in_plan_participants.user_id = auth.uid()
                        AND move_in_plan_participants.can_edit_plan = true
                    )
                )
            )
        )
    );

-- Notes policies
CREATE POLICY "Users can view plan notes" ON move_in_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_notes.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_notes.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage plan notes" ON move_in_notes
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM move_in_plans 
            WHERE move_in_plans.id = move_in_notes.plan_id 
            AND (
                move_in_plans.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM move_in_plan_participants 
                    WHERE move_in_plan_participants.plan_id = move_in_notes.plan_id 
                    AND move_in_plan_participants.user_id = auth.uid()
                    AND move_in_plan_participants.can_edit_plan = true
                )
            )
        )
    );

-- Functions for move-in planning
CREATE OR REPLACE FUNCTION create_move_in_plan(
    p_title VARCHAR(200),
    p_description TEXT,
    p_move_in_date DATE,
    p_property_address TEXT,
    p_participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    v_plan_id UUID;
    v_participant_id UUID;
BEGIN
    -- Create the plan
    INSERT INTO move_in_plans (
        title, description, move_in_date, property_address, created_by
    ) VALUES (
        p_title, p_description, p_move_in_date, p_property_address, auth.uid()
    ) RETURNING id INTO v_plan_id;
    
    -- Add participants
    FOREACH v_participant_id IN ARRAY p_participant_ids
    LOOP
        INSERT INTO move_in_plan_participants (plan_id, user_id)
        VALUES (v_plan_id, v_participant_id);
    END LOOP;
    
    -- Add creator as participant
    INSERT INTO move_in_plan_participants (plan_id, user_id)
    VALUES (v_plan_id, auth.uid());
    
    RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get plan summary
CREATE OR REPLACE FUNCTION get_move_in_plan_summary(p_plan_id UUID)
RETURNS TABLE (
    plan_id UUID,
    title VARCHAR(200),
    status VARCHAR(20),
    move_in_date DATE,
    total_tasks BIGINT,
    completed_tasks BIGINT,
    total_expenses DECIMAL(10,2),
    paid_expenses DECIMAL(10,2),
    total_participants BIGINT,
    completion_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        mp.title,
        mp.status,
        mp.move_in_date,
        COUNT(mt.id) as total_tasks,
        COUNT(mt.id) FILTER (WHERE mt.status = 'completed') as completed_tasks,
        COALESCE(SUM(me.amount), 0) as total_expenses,
        COALESCE(SUM(me.amount) FILTER (WHERE me.payment_status = 'paid'), 0) as paid_expenses,
        COUNT(DISTINCT mpp.user_id) as total_participants,
        CASE 
            WHEN COUNT(mt.id) > 0 THEN 
                (COUNT(mt.id) FILTER (WHERE mt.status = 'completed')::DECIMAL / COUNT(mt.id)) * 100
            ELSE 0 
        END as completion_percentage
    FROM move_in_plans mp
    LEFT JOIN move_in_tasks mt ON mp.id = mt.plan_id
    LEFT JOIN move_in_expenses me ON mp.id = me.plan_id
    LEFT JOIN move_in_plan_participants mpp ON mp.id = mpp.plan_id
    WHERE mp.id = p_plan_id
    GROUP BY mp.id, mp.title, mp.status, mp.move_in_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_move_in_plans_updated_at
    BEFORE UPDATE ON move_in_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_tasks_updated_at
    BEFORE UPDATE ON move_in_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_expenses_updated_at
    BEFORE UPDATE ON move_in_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_expense_splits_updated_at
    BEFORE UPDATE ON move_in_expense_splits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_timeline_events_updated_at
    BEFORE UPDATE ON move_in_timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_checklists_updated_at
    BEFORE UPDATE ON move_in_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_checklist_items_updated_at
    BEFORE UPDATE ON move_in_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_in_notes_updated_at
    BEFORE UPDATE ON move_in_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
