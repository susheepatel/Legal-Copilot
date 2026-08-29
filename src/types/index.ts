export type UserRole = 'lawyer' | 'admin';

export type CaseStatus = 'active' | 'disposed' | 'on-hold';

export type TaskStatus = 'pending' | 'in_progress' | 'in-progress' | 'completed';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'sent';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type DocumentType = 
  | 'Plaint'
  | 'Written Statement'
  | 'Affidavit'
  | 'Vakalatnama'
  | 'Evidence'
  | 'Order Copy'
  | 'Judgment'
  | 'Notice'
  | 'Bail Application'
  | 'Writ Petition'
  | 'Other';

export type CourtCategory = 
  | 'Supreme Court of India'
  | 'High Court'
  | 'District & Sessions Court'
  | 'Chief Judicial Magistrate (CJM)'
  | 'Metropolitan Magistrate (MM)'
  | 'Civil Judge Senior Division'
  | 'National Company Law Tribunal (NCLT)'
  | 'National Green Tribunal (NGT)'
  | 'Debt Recovery Tribunal (DRT)'
  | 'Consumer Disputes Redressal Commission'
  | 'Central Administrative Tribunal (CAT)'
  | 'Arbitration Tribunal'
  | 'Other Forum';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  bar_enrollment_no?: string;
  phone?: string;
  firm_id?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Firm {
  id: string;
  name: string;
  owner_id?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  practice_areas?: string[];
  created_at: string;
}

export interface Client {
  id: string;
  firm_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  notes?: string;
  created_at: string;
}

export interface Case {
  id: string;
  firm_id: string;
  client_id: string;
  case_title: string;
  case_number: string; // CNR Number or filing number, e.g. DLDL010012342024 / CS(OS) 142/2024
  court_name: string;
  case_type: string; // e.g. Civil Suit, Criminal Appeal, Writ Petition (Civil), Bail Application, Section 138 NI Act, Trademark Injunction, Arbitration Sec 9
  filing_date?: string;
  status: CaseStatus;
  opposing_party?: string;
  opposing_counsel?: string;
  judge_bench?: string;
  next_hearing_date?: string;
  assigned_lawyer_id?: string;
  assigned_lawyer_name?: string;
  notes?: string;
  created_at: string;
  
  // Enriched runtime fields
  client?: Client;
  hearings?: Hearing[];
  documents?: CaseDocument[];
  tasks?: Task[];
  invoices?: Invoice[];
}

export interface Hearing {
  id: string;
  case_id: string;
  hearing_date: string;
  court_room?: string;
  purpose: string; // e.g. Admission, Arguments, Cross-Examination, Framing of Issues, Interim Injunction, Judgment, Bail Hearing
  outcome_notes?: string;
  judge_name?: string;
  created_at: string;
  case_title?: string;
  case_number?: string;
  court_name?: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  document_type: DocumentType;
  uploaded_by?: string;
  uploaded_at: string;
  content_snippet?: string;
  case_title?: string;
}

export interface Task {
  id: string;
  case_id?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: TaskStatus;
  priority?: Priority;
  created_at: string;
  case_title?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  firm_id: string;
  client_id: string;
  case_id?: string;
  amount: number;
  tax_amount?: number;
  currency?: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  notes?: string;
  invoice_number?: string;
  created_at: string;
  client_name?: string;
  case_title?: string;
  items?: InvoiceItem[];
}

export interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'case' | 'hearing' | 'document' | 'task' | 'invoice' | 'ai';
}

export type AICopilotTask = 
  | 'general-research'
  | 'bns-transition'
  | 'drafting'
  | 'case-brief'
  | 'limitation-check'
  | 'research'
  | 'draft'
  | 'summarize';

export interface AICopilotRequest {
  task: AICopilotTask;
  prompt?: string;
  input?: string;
  context?: string | Record<string, any>;
  case_id?: string;
}

export interface AICopilotResponse {
  content: string;
  disclaimer: string;
  model: string;
  references?: string[];
  output?: string;
  warning?: string;
  error?: string;
}
