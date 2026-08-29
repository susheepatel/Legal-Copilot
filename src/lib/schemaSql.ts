export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- LEGAL COPILOT — SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Practice Management & AI Assistant for Indian Advocates & Law Firms
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FIRMS TABLE
CREATE TABLE IF NOT EXISTS public.firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    city TEXT DEFAULT 'New Delhi',
    state TEXT DEFAULT 'Delhi',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bar_enrollment_no TEXT, -- e.g. D/1234/2018 (State Bar Council Enrollment)
    phone TEXT,
    firm_id UUID REFERENCES public.firms(id) ON DELETE SET NULL,
    role TEXT CHECK (role IN ('lawyer', 'admin')) DEFAULT 'lawyer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CLIENTS TABLE (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CASES TABLE (Dockets & Matter Management)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    case_title TEXT NOT NULL,
    case_number TEXT NOT NULL, -- CNR / Filing No. e.g. DLDL010023452024
    court_name TEXT NOT NULL,  -- e.g. Delhi High Court, Tis Hazari District Court, Supreme Court of India
    case_type TEXT NOT NULL,   -- Civil Suit, Criminal Appeal, Writ Petition, Bail Application, Sec 138 NI Act
    filing_date DATE,
    status TEXT CHECK (status IN ('active', 'disposed', 'on-hold')) DEFAULT 'active',
    opposing_party TEXT,
    opposing_counsel TEXT,
    judge_bench TEXT,
    next_hearing_date TIMESTAMPTZ,
    assigned_lawyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. HEARINGS TABLE (Court Hearings & Order Sheets)
CREATE TABLE IF NOT EXISTS public.hearings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    hearing_date TIMESTAMPTZ NOT NULL,
    court_room TEXT,
    purpose TEXT NOT NULL, -- Arguments, Evidence, Framing of Issues, Interim Injunction, Judgment
    outcome_notes TEXT,
    judge_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. DOCUMENTS TABLE (Case Document Vault & Metadata)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT,
    document_type TEXT NOT NULL, -- Plaint, Written Statement, Affidavit, Vakalatnama, Evidence, Order Copy, Judgment, Notice, Other
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TASKS TABLE (Workflow & Case Actionables)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. INVOICES TABLE (Billing & Fee Recovery)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    invoice_number TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT CHECK (status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each advocate/firm only accesses records within their assigned firm.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's firm_id
CREATE OR REPLACE FUNCTION public.get_auth_user_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Profiles Policy
CREATE POLICY "Users can view profiles in their own firm"
ON public.profiles FOR SELECT
USING (
    id = auth.uid() 
    OR firm_id = public.get_auth_user_firm_id()
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their initial profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- 2. Firms Policy
CREATE POLICY "Users can view their own firm"
ON public.firms FOR SELECT
USING (id = public.get_auth_user_firm_id() OR owner_id = auth.uid());

CREATE POLICY "Admins can manage firm profile"
ON public.firms FOR UPDATE
USING (owner_id = auth.uid());

-- 3. Clients Policy
CREATE POLICY "Firm members can manage clients"
ON public.clients FOR ALL
USING (firm_id = public.get_auth_user_firm_id())
WITH CHECK (firm_id = public.get_auth_user_firm_id());

-- 4. Cases Policy
CREATE POLICY "Firm members can manage cases"
ON public.cases FOR ALL
USING (firm_id = public.get_auth_user_firm_id())
WITH CHECK (firm_id = public.get_auth_user_firm_id());

-- 5. Hearings Policy
CREATE POLICY "Firm members can view and manage hearings"
ON public.hearings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = hearings.case_id 
        AND c.firm_id = public.get_auth_user_firm_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = hearings.case_id 
        AND c.firm_id = public.get_auth_user_firm_id()
    )
);

-- 6. Documents Policy
CREATE POLICY "Firm members can view and manage documents"
ON public.documents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = documents.case_id 
        AND c.firm_id = public.get_auth_user_firm_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = documents.case_id 
        AND c.firm_id = public.get_auth_user_firm_id()
    )
);

-- 7. Tasks Policy
CREATE POLICY "Firm members can manage tasks"
ON public.tasks FOR ALL
USING (
    case_id IS NULL 
    OR EXISTS (
        SELECT 1 FROM public.cases c 
        WHERE c.id = tasks.case_id 
        AND c.firm_id = public.get_auth_user_firm_id()
    )
);

-- 8. Invoices Policy
CREATE POLICY "Firm members can manage invoices"
ON public.invoices FOR ALL
USING (firm_id = public.get_auth_user_firm_id())
WITH CHECK (firm_id = public.get_auth_user_firm_id());

-- ==============================================================================
-- SUPABASE STORAGE BUCKET FOR CASE DOCUMENTS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legal-documents', 'legal-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lawyers can upload documents to legal-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'legal-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Lawyers can view documents in legal-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'legal-documents' AND auth.role() = 'authenticated');
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
