-- Support Tickets System
-- This migration adds tables for support tickets and ticket messages

-- Table for support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ticket identification
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ticket number
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Ticket categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'account', 'matching', 'payment', 'safety', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')),
    
    -- User information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id), -- Admin user assigned to ticket
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    tags VARCHAR(50)[],
    metadata JSONB, -- Additional metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Table for ticket messages
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message identification
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    
    -- Message content
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user' CHECK (message_type IN ('user', 'admin', 'system')),
    
    -- Sender information
    sender_id UUID REFERENCES auth.users(id), -- NULL for system messages
    sender_name VARCHAR(200),
    sender_email VARCHAR(200),
    
    -- Message metadata
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes visible only to admins
    attachments JSONB, -- Array of attachment URLs/metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for ticket attachments
CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Attachment identification
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
    
    -- File information
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER, -- Size in bytes
    file_url TEXT NOT NULL, -- URL to file storage
    
    -- Upload information
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_university ON support_tickets(university_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_sender ON ticket_messages(sender_id);
CREATE INDEX idx_ticket_messages_created_at ON ticket_messages(created_at);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_message ON ticket_attachments(message_id);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can access all tickets
CREATE POLICY "Admins can access all tickets" ON support_tickets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view messages in their tickets
CREATE POLICY "Users can view messages in their tickets" ON ticket_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
            AND ticket_messages.is_internal = FALSE
        )
    );

-- Users can create messages in their tickets
CREATE POLICY "Users can create messages in their tickets" ON ticket_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can access all messages
CREATE POLICY "Admins can access all messages" ON ticket_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view attachments in their tickets
CREATE POLICY "Users can view attachments in their tickets" ON ticket_attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_attachments.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Users can upload attachments to their tickets
CREATE POLICY "Users can upload attachments to their tickets" ON ticket_attachments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_attachments.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can access all attachments
CREATE POLICY "Admins can access all attachments" ON ticket_attachments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    ticket_count INTEGER;
BEGIN
    -- Generate ticket number: TICKET-YYYYMMDD-XXXX
    ticket_num := 'TICKET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((SELECT COUNT(*)::INTEGER FROM support_tickets WHERE DATE(created_at) = CURRENT_DATE)::TEXT, 4, '0');
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate ticket number on insert
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Comments
COMMENT ON TABLE support_tickets IS 'Support tickets for user issues and inquiries';
COMMENT ON TABLE ticket_messages IS 'Messages in support tickets';
COMMENT ON TABLE ticket_attachments IS 'File attachments in support tickets';

