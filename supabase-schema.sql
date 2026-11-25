-- ==============================================================================
-- Chirpdesk Database Schema (Supabase PostgreSQL)
-- Multi-tenant WhatsApp Automation & AI SaaS for Indian SMBs
-- Strictly scoped by workspace_id with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES (Tenants e.g., Sharma Jewellers, Gupta General Store)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    legal_name TEXT,
    business_type TEXT DEFAULT 'retail', -- 'jeweller', 'kirana', 'retail', 'services'
    phone_number TEXT NOT NULL,
    waba_id TEXT,                        -- Meta WhatsApp Business Account ID (masked in UI)
    phone_number_id TEXT,                -- Meta Cloud API Phone ID (masked in UI)
    messaging_limit TEXT DEFAULT 'Tier 1 (1,000 msgs/day)',
    quality_rating TEXT DEFAULT 'GREEN',
    plan_tier TEXT DEFAULT 'starter',    -- 'trial', 'starter', 'pro', 'enterprise'
    credits_balance INTEGER DEFAULT 500,
    gstin TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACE MEMBERS & RBAC
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'manager', 'agent')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUDIENCE & CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    phone_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    city TEXT,
    tags TEXT[] DEFAULT '{}',
    assigned_to UUID REFERENCES public.workspace_members(id),
    status TEXT DEFAULT 'auto_resolved' CHECK (status IN ('auto_resolved', 'needs_human', 'closed')),
    custom_notes TEXT,
    opt_in_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, phone_number)
);

-- 4. CONVERSATION MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai', 'system')),
    content TEXT NOT NULL,
    media_url TEXT,
    delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DAILY COMMODITY & RATE ALERTS (Jewellers, Kirana, Bullion)
CREATE TABLE IF NOT EXISTS public.rate_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    item_code TEXT NOT NULL,            -- 'g24', 'g22', 's99', 'atta10'
    item_name TEXT NOT NULL,            -- 'Gold 24K (999 Purity)'
    unit TEXT NOT NULL,                 -- 'per 10g', 'per kg'
    current_rate NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    change_amount NUMERIC(10, 2) DEFAULT 0,
    trend TEXT DEFAULT 'up' CHECK (trend IN ('up', 'down', 'flat')),
    is_active BOOLEAN DEFAULT TRUE,
    scheduled_time TIME DEFAULT '10:30:00',
    days_of_week TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat"}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BROADCAST CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_name TEXT NOT NULL,
    audience_query JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'failed')),
    scheduled_at TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATION WORKFLOWS
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    trigger_type TEXT NOT NULL,          -- 'keyword_match', 'pos_billing_webhook', 'time_schedule'
    graph_definition JSONB NOT NULL,    -- Nodes and connections
    is_active BOOLEAN DEFAULT TRUE,
    total_executions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUEUE HEALTH & DISPATCH JOBS
CREATE TABLE IF NOT EXISTS public.queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    job_type TEXT NOT NULL,              -- 'send_rate_alert', 'dispatch_broadcast_chunk', 'generate_pdf'
    status TEXT DEFAULT 'pending' CHECK (status IN ('initiated', 'pending', 'sent', 'delivered', 'read', 'replied', 'failed')),
    process_duration_ms INTEGER,
    payload JSONB NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 9. AGGREGATED DAILY PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL,
    queued_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, metric_date)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each tenant only ever sees data belonging to their workspace_id.
-- ==============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.check_user_in_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
        AND user_id = auth.uid()
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces Policy
CREATE POLICY "Users can access their member workspaces"
    ON public.workspaces FOR ALL
    USING (public.check_user_in_workspace(id));

-- Workspace Members Policy
CREATE POLICY "Users can view members of their workspaces"
    ON public.workspace_members FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Contacts Policy
CREATE POLICY "Contacts scoped by workspace_id"
    ON public.contacts FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Messages Policy
CREATE POLICY "Messages scoped by workspace_id"
    ON public.messages FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Rate Alerts Policy
CREATE POLICY "Rate alerts scoped by workspace_id"
    ON public.rate_alerts FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Broadcasts Policy
CREATE POLICY "Broadcasts scoped by workspace_id"
    ON public.broadcasts FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Workflows Policy
CREATE POLICY "Workflows scoped by workspace_id"
    ON public.workflows FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Queue Jobs Policy
CREATE POLICY "Queue jobs scoped by workspace_id"
    ON public.queue_jobs FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- Daily Metrics Policy
CREATE POLICY "Metrics scoped by workspace_id"
    ON public.daily_metrics FOR ALL
    USING (public.check_user_in_workspace(workspace_id));

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- Enable real-time publication for live chat and queue monitoring
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rate_alerts;

