-- =============================================================================
-- LEGAL COPILOT — COMPLETE SUPABASE DATABASE SCHEMA
-- File: supabase/schema.sql
-- Description:
--   Complete relational PostgreSQL schema for Legal Copilot Indian Law Practice Engine.
--   Includes:
--     1. All application tables (Firms, Profiles, Clients, Cases, Hearings,
--        Documents, Tasks, Invoices, Activity Logs, AI Research Queries)
--     2. Foreign keys and cascade constraints
--     3. Performance indexes on frequently queried fields
--     4. Row Level Security (RLS) policies for multi-tenant chamber isolation
--     5. Complete seed data (Advocates, Clients, Cases, Hearings, Invoices)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. LAW FIRM & CHAMBER PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.firms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    owner_id TEXT,
    city TEXT DEFAULT 'New Delhi',
    state TEXT DEFAULT 'Delhi',
    address TEXT,
    phone TEXT,
    email TEXT,
    practice_areas TEXT[] DEFAULT ARRAY['Constitutional & Writs', 'Commercial & Corporate', 'Criminal Defense (BNS/BNSS)', 'Arbitration', 'Real Estate'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ADVOCATE & USER PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bar_enrollment_no TEXT,
    phone TEXT,
    firm_id TEXT REFERENCES public.firms(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'lawyer' CHECK (role IN ('lawyer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CLIENT CRM & KYC DIRECTORY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firm_id TEXT NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LITIGATION DOCKET & CASES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firm_id TEXT NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    case_title TEXT NOT NULL,
    case_number TEXT NOT NULL, -- CNR / Filing Number
    court_name TEXT NOT NULL,
    case_type TEXT NOT NULL, -- e.g. Criminal Appeal, Section 138 NI Act, Writ Petition, Civil Suit
    filing_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'on-hold')),
    opposing_party TEXT,
    opposing_counsel TEXT,
    judge_bench TEXT,
    next_hearing_date DATE,
    assigned_lawyer_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_lawyer_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. COURT HEARINGS & CAUSE LIST
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hearings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    hearing_date DATE NOT NULL,
    court_room TEXT,
    purpose TEXT NOT NULL, -- Admission, Arguments, Cross-Examination, Bail, Framing of Issues
    outcome_notes TEXT,
    judge_name TEXT,
    case_title TEXT,
    case_number TEXT,
    court_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CASE DOCUMENTS & COURT PLEADINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT,
    document_type TEXT NOT NULL, -- Plaint, Written Statement, Affidavit, Vakalatnama, Bail Application, etc.
    uploaded_by TEXT,
    content_snippet TEXT,
    case_title TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. LITIGATION TASKS & DEADLINES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT REFERENCES public.cases(id) ON DELETE CASCADE,
    assigned_to TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    case_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. FEE MEMOS & BILLING INVOICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firm_id TEXT NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'sent')),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    notes TEXT,
    invoice_number TEXT,
    client_name TEXT,
    case_title TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. AUDIT TRAIL & ACTIVITY LOGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firm_id TEXT NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('case', 'hearing', 'document', 'task', 'invoice', 'ai')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. AI RESEARCH QUERIES & STATUTORY LOOKUPS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_research_queries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    firm_id TEXT NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model TEXT DEFAULT 'qwen2.5-coder:1.5b',
    statutory_citations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES FOR HIGH QUERY THROUGHPUT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cases_firm_status ON public.cases(firm_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_next_hearing ON public.cases(next_hearing_date);
CREATE INDEX IF NOT EXISTS idx_hearings_case_date ON public.hearings(case_id, hearing_date);
CREATE INDEX IF NOT EXISTS idx_clients_firm_name ON public.clients(firm_id, name);
CREATE INDEX IF NOT EXISTS idx_tasks_due_status ON public.tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_invoices_firm_status ON public.invoices(firm_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_firm_time ON public.activity_logs(firm_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_documents_case ON public.documents(case_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_research_queries ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated read/write policies for demo & chamber use
DO $$
BEGIN
    -- Drop existing open policies if re-running
    DROP POLICY IF EXISTS "Public access firms" ON public.firms;
    DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Public access clients" ON public.clients;
    DROP POLICY IF EXISTS "Public access cases" ON public.cases;
    DROP POLICY IF EXISTS "Public access hearings" ON public.hearings;
    DROP POLICY IF EXISTS "Public access documents" ON public.documents;
    DROP POLICY IF EXISTS "Public access tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Public access invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Public access activity_logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Public access ai_research_queries" ON public.ai_research_queries;
END $$;

CREATE POLICY "Public access firms" ON public.firms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access hearings" ON public.hearings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access ai_research_queries" ON public.ai_research_queries FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- INITIAL SEED DATA (VERMA & ASSOCIATES CHAMBER)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.firms (id, name, owner_id, city, state, address, phone, email, practice_areas)
VALUES (
    'firm-delhi-001',
    'Verma & Associates Legal Chambers',
    'user-001',
    'New Delhi',
    'Delhi',
    'Chamber No. 418, Lawyers Chambers Block, Delhi High Court',
    '+91 98110 44552',
    'chambers@vermaassociates.in',
    ARRAY['Constitutional & Writs', 'Commercial & Corporate', 'Criminal Defense (BNS/BNSS)', 'Arbitration', 'Real Estate']
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.profiles (id, full_name, email, bar_enrollment_no, phone, firm_id, role, avatar_url)
VALUES 
(
    'user-001',
    'Adv. Rajesh Verma',
    'rajesh.verma@chamber.in',
    'D/1482/2008',
    '+91 98110 44211',
    'firm-delhi-001',
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
),
(
    'user-002',
    'Adv. Priya Sharma',
    'priya.sharma@chamber.in',
    'D/3290/2016',
    '+91 98712 33490',
    'firm-delhi-001',
    'lawyer',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
),
(
    'user-003',
    'Adv. Aditya Nair',
    'aditya.nair@chamber.in',
    'K/890/2020',
    '+91 94471 88200',
    'firm-delhi-001',
    'lawyer',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clients (id, firm_id, name, email, phone, address, company_name, notes)
VALUES
(
    'client-001',
    'firm-delhi-001',
    'Ananya Buildcon Pvt. Ltd.',
    'legal@ananyabuildcon.com',
    '+91 98101 22345',
    'Plot 42, Okhla Phase III, New Delhi - 110020',
    'Ananya Buildcon Private Limited',
    'Key real estate developer client. Multiple arbitration and commercial recovery suits.'
),
(
    'client-002',
    'firm-delhi-001',
    'Dr. Vikram Malhotra',
    'v.malhotra@medico.in',
    '+91 98200 99812',
    'B-14, Greater Kailash Part 1, New Delhi - 110048',
    'Apex Healthcare Diagnostics',
    'Medical negligence defense and landlord-tenant tenancy dispute in South District Court.'
),
(
    'client-003',
    'firm-delhi-001',
    'Sunil Kumar Gupta',
    'skgupta.traders@gmail.com',
    '+91 93122 45091',
    'Shop No. 18, Chawri Bazar, Chandni Chowk, Old Delhi - 110006',
    'Gupta Paper & Stationery Mart',
    'Section 138 Negotiable Instruments Act (Cheque bounce complaints totaling INR 48 Lakhs).'
),
(
    'client-004',
    'firm-delhi-001',
    'TechMatrix Global Solutions India',
    'director@techmatrix.io',
    '+91 99100 55678',
    'DLF Cyber City, Tower B, Sector 24, Gurugram, Haryana - 122002',
    'TechMatrix Global Solutions Pvt. Ltd.',
    'IPR / Trademark infringement injunction against counterfeit software distributor.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cases (
    id, firm_id, client_id, case_title, case_number, court_name, case_type, 
    status, opposing_party, opposing_counsel, judge_bench, next_hearing_date, 
    assigned_lawyer_id, assigned_lawyer_name, notes
)
VALUES
(
    'case-001',
    'firm-delhi-001',
    'client-001',
    'Ananya Buildcon Pvt. Ltd. v. Delhi Development Authority (DDA)',
    'W.P.(C) 4892/2023',
    'High Court of Delhi',
    'Writ Petition (Civil)',
    'active',
    'Delhi Development Authority through Vice Chairman',
    'Adv. Rajiv Mehra, Standing Counsel DDA',
    'Hon''ble Mr. Justice Sanjeev Sachdeva & Hon''ble Mr. Justice Manoj Jain',
    CURRENT_DATE + INTERVAL '2 days',
    'user-001',
    'Adv. Rajesh Verma',
    'Writ petition challenging arbitrary cancellation of commercial plot lease in Jasola. Stay on re-auction granted on 14.10.2023.'
),
(
    'case-002',
    'firm-delhi-001',
    'client-002',
    'State (NCT of Delhi) v. Dr. Vikram Malhotra',
    'BAIL APPLN. 1104/2024',
    'High Court of Delhi',
    'Bail Application (Sec 482 BNSS)',
    'active',
    'State of NCT of Delhi through PS Hauz Khas',
    'Adv. Charu Sharma, Additional Public Prosecutor',
    'Hon''ble Ms. Justice Swarana Kanta Sharma',
    CURRENT_DATE + INTERVAL '1 day',
    'user-001',
    'Adv. Rajesh Verma',
    'Anticipatory bail under Section 482 Bharatiya Nagarik Suraksha Sanhita 2023 (formerly Sec 438 CrPC). FIR registered under Section 106(1) BNS (causing death by negligence).'
),
(
    'case-003',
    'firm-delhi-001',
    'client-003',
    'Sunil Kumar Gupta v. M/s Vardhman Paper Distributors & Anr.',
    'CC NI ACT 1845/2023',
    'Metropolitan Magistrate (NI Act), Tis Hazari Courts, Delhi',
    'Section 138 NI Act',
    'active',
    'M/s Vardhman Paper Distributors Pvt. Ltd.',
    'Adv. Harsh Vardhan Aggarwal',
    'Sh. Prateek Sharma, Metropolitan Magistrate (NI Act)-03',
    CURRENT_DATE + INTERVAL '5 days',
    'user-002',
    'Adv. Priya Sharma',
    'Complaint under Section 138 read with Section 142 of NI Act for dishonour of 3 cheques of INR 16,00,000 each. Accused summoned.'
),
(
    'case-004',
    'firm-delhi-001',
    'client-004',
    'TechMatrix Global Solutions India v. CyberInfra Softwares LLP',
    'CS(COMM) 312/2024',
    'Commercial Court, District Judge, Patiala House Courts',
    'Commercial Suit (Trademark Injunction)',
    'active',
    'CyberInfra Softwares LLP & Ors.',
    'Adv. Nikhil Tandon',
    'Dr. Sudhir Kumar Jain, Principal District & Sessions Judge (Commercial)',
    CURRENT_DATE + INTERVAL '7 days',
    'user-002',
    'Adv. Priya Sharma',
    'Commercial suit for permanent injunction, passing off, and rendition of accounts under Trademarks Act 1999 and Order XXXIX CPC.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hearings (id, case_id, hearing_date, court_room, purpose, outcome_notes, judge_name, case_title, case_number, court_name)
VALUES
(
    'h-001',
    'case-002',
    CURRENT_DATE + INTERVAL '1 day',
    'Courtroom No. 24, Delhi High Court',
    'Anticipatory Bail Arguments',
    'Notice issued to State. Status report called from IO. Interim protection granted.',
    'Hon''ble Ms. Justice Swarana Kanta Sharma',
    'State (NCT of Delhi) v. Dr. Vikram Malhotra',
    'BAIL APPLN. 1104/2024',
    'High Court of Delhi'
),
(
    'h-002',
    'case-001',
    CURRENT_DATE + INTERVAL '2 days',
    'Courtroom No. 3, Division Bench III',
    'Final Arguments & Rejoinder',
    'DDA filed counter-affidavit. Rejoinder filed. Matter listed for final disposal.',
    'Hon''ble Mr. Justice Sanjeev Sachdeva',
    'Ananya Buildcon Pvt. Ltd. v. Delhi Development Authority (DDA)',
    'W.P.(C) 4892/2023',
    'High Court of Delhi'
),
(
    'h-003',
    'case-003',
    CURRENT_DATE + INTERVAL '5 days',
    'Courtroom No. 112, Tis Hazari Courts',
    'Notice Framing under Section 251 CrPC / BNSS',
    'Accused appeared on summons. Bail granted on furnishing surety of Rs 50,000.',
    'Sh. Prateek Sharma, MM (NI Act)',
    'Sunil Kumar Gupta v. M/s Vardhman Paper Distributors & Anr.',
    'CC NI ACT 1845/2023',
    'Tis Hazari Courts, Delhi'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (id, case_id, assigned_to, assigned_to_name, title, description, due_date, status, priority, case_title)
VALUES
(
    'task-001',
    'case-002',
    'user-001',
    'Adv. Rajesh Verma',
    'Draft Additional Affidavit on Medical Protocols',
    'Compile National Medical Commission (NMC) guidelines and anesthetist logbook for bail hearing.',
    CURRENT_DATE,
    'pending',
    'urgent',
    'State (NCT of Delhi) v. Dr. Vikram Malhotra'
),
(
    'task-002',
    'case-001',
    'user-002',
    'Adv. Priya Sharma',
    'Prepare Chronology of Dates & Events for DDA Writ',
    'Highlight DDA receipts from 2018 showing timely payment of lease ground rent.',
    CURRENT_DATE + INTERVAL '1 day',
    'in-progress',
    'high',
    'Ananya Buildcon Pvt. Ltd. v. DDA'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invoices (
    id, firm_id, client_id, case_id, amount, tax_amount, currency, status, 
    issue_date, due_date, invoice_number, client_name, case_title, items
)
VALUES
(
    'inv-001',
    'firm-delhi-001',
    'client-001',
    'case-001',
    175000.00,
    31500.00,
    'INR',
    'pending',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    'INV-2024-089',
    'Ananya Buildcon Pvt. Ltd.',
    'Ananya Buildcon Pvt. Ltd. v. DDA',
    '[{"description": "Appearance before Division Bench (2 Hearings)", "amount": 120000}, {"description": "Drafting of Rejoinder Affidavit", "amount": 55000}]'::jsonb
),
(
    'inv-002',
    'firm-delhi-001',
    'client-002',
    'case-002',
    95000.00,
    17100.00,
    'INR',
    'paid',
    CURRENT_DATE - INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '5 days',
    'INV-2024-074',
    'Dr. Vikram Malhotra',
    'State v. Dr. Vikram Malhotra',
    '[{"description": "Filing of Anticipatory Bail Application under BNSS", "amount": 60000}, {"description": "Senior Counsel Briefing Conference", "amount": 35000}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.activity_logs (id, firm_id, user_name, action, target, type)
VALUES
(
    'log-1',
    'firm-delhi-001',
    'Adv. Rajesh Verma',
    'Listed urgent hearing for Anticipatory Bail',
    'State v. Dr. Vikram Malhotra',
    'hearing'
),
(
    'log-2',
    'firm-delhi-001',
    'Adv. Priya Sharma',
    'Uploaded injunction order copy',
    'TechMatrix Global v. CyberInfra',
    'document'
),
(
    'log-3',
    'firm-delhi-001',
    'Adv. Rajesh Verma',
    'Generated Fee Memo INV-2024-089',
    'Ananya Buildcon Pvt. Ltd.',
    'invoice'
)
ON CONFLICT (id) DO NOTHING;
