import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ActivityLog, 
  Case, 
  CaseDocument, 
  CaseStatus, 
  Client, 
  Hearing, 
  Invoice, 
  InvoiceStatus, 
  Task, 
  TaskStatus 
} from '../types';
import { 
  INITIAL_CASES, 
  INITIAL_CLIENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_HEARINGS, 
  INITIAL_INVOICES, 
  INITIAL_TASKS 
} from '../lib/mockData';
import { useAuth } from './AuthContext';
import { getStoredSupabaseConfig, supabase } from '../lib/supabaseClient';

interface DataContextType {
  cases: Case[];
  clients: Client[];
  hearings: Hearing[];
  documents: CaseDocument[];
  tasks: Task[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  isLoadingData: boolean;
  
  // Case Operations
  addCase: (newCase: Omit<Case, 'id' | 'created_at'>) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  getCaseById: (id: string) => Case | undefined;
  
  // Client Operations
  addClient: (newClient: Omit<Client, 'id' | 'created_at'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  // Hearing Operations
  addHearing: (newHearing: Omit<Hearing, 'id' | 'created_at'>) => Promise<Hearing>;
  updateHearing: (id: string, updates: Partial<Hearing>) => Promise<void>;
  
  // Document Operations
  addDocument: (newDoc: Omit<CaseDocument, 'id' | 'uploaded_at'>) => Promise<CaseDocument>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Task Operations
  addTask: (newTask: Omit<Task, 'id' | 'created_at'>) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Invoice Operations
  addInvoice: (newInvoice: Omit<Invoice, 'id' | 'created_at'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  
  // Computed helpers
  upcomingHearings7Days: Hearing[];
  urgentHearings3Days: Hearing[];
  pendingTasksCount: number;
  activeCasesCount: number;
  totalOutstandingDues: number;
  
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, firm } = useAuth();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load data from Supabase (if connected) or LocalStorage / Seed Mock Data
  const loadData = async () => {
    setIsLoadingData(true);
    const config = getStoredSupabaseConfig();

    if (supabase && config.isConfigured && firm?.id) {
      try {
        // Query Supabase tables respecting RLS (firm_id)
        const [
          { data: casesData },
          { data: clientsData },
          { data: hearingsData },
          { data: docsData },
          { data: tasksData },
          { data: invoicesData },
        ] = await Promise.all([
          supabase.from('cases').select('*').eq('firm_id', firm.id).order('created_at', { ascending: false }),
          supabase.from('clients').select('*').eq('firm_id', firm.id).order('name', { ascending: true }),
          supabase.from('hearings').select('*').order('hearing_date', { ascending: true }),
          supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
          supabase.from('tasks').select('*').order('due_date', { ascending: true }),
          supabase.from('invoices').select('*').eq('firm_id', firm.id).order('created_at', { ascending: false }),
        ]);

        if (casesData && casesData.length > 0) {
          setCases(casesData);
          if (clientsData) setClients(clientsData);
          if (hearingsData) setHearings(hearingsData);
          if (docsData) setDocuments(docsData);
          if (tasksData) setTasks(tasksData);
          if (invoicesData) setInvoices(invoicesData);
          setIsLoadingData(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase tables load failed, using local vault:', err);
      }
    }

    // Fallback to LocalStorage or Mock Seed Data
    const localCases = localStorage.getItem('legal_copilot_cases');
    const localClients = localStorage.getItem('legal_copilot_clients');
    const localHearings = localStorage.getItem('legal_copilot_hearings');
    const localDocs = localStorage.getItem('legal_copilot_docs');
    const localTasks = localStorage.getItem('legal_copilot_tasks');
    const localInvoices = localStorage.getItem('legal_copilot_invoices');
    const localLogs = localStorage.getItem('legal_copilot_logs');

    setCases(localCases ? JSON.parse(localCases) : INITIAL_CASES);
    setClients(localClients ? JSON.parse(localClients) : INITIAL_CLIENTS);
    setHearings(localHearings ? JSON.parse(localHearings) : INITIAL_HEARINGS);
    setDocuments(localDocs ? JSON.parse(localDocs) : INITIAL_DOCUMENTS);
    setTasks(localTasks ? JSON.parse(localTasks) : INITIAL_TASKS);
    setInvoices(localInvoices ? JSON.parse(localInvoices) : INITIAL_INVOICES);

    if (localLogs) {
      setActivityLogs(JSON.parse(localLogs));
    } else {
      const initialLogs: ActivityLog[] = [
        {
          id: 'log-1',
          user_name: 'Adv. Rajesh Verma',
          action: 'Listed urgent hearing for Anticipatory Bail',
          target: 'State v. Dr. Vikram Malhotra',
          timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          type: 'hearing',
        },
        {
          id: 'log-2',
          user_name: 'Adv. Priya Sharma',
          action: 'Uploaded injunction order copy',
          target: 'TechMatrix Global v. CyberInfra',
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          type: 'document',
        },
        {
          id: 'log-3',
          user_name: 'Adv. Rajesh Verma',
          action: 'Generated legal notice draft via AI Copilot',
          target: 'Ananya Buildcon Pvt. Ltd.',
          timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          type: 'ai',
        },
      ];
      setActivityLogs(initialLogs);
      localStorage.setItem('legal_copilot_logs', JSON.stringify(initialLogs));
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, [user, firm]);

  const logActivity = (action: string, target: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user_name: user?.full_name || 'Advocate',
      action,
      target,
      timestamp: new Date().toISOString(),
      type,
    };
    const updated = [newLog, ...activityLogs.slice(0, 25)];
    setActivityLogs(updated);
    localStorage.setItem('legal_copilot_logs', JSON.stringify(updated));
  };

  // Case Operations
  const addCase = async (newCaseData: Omit<Case, 'id' | 'created_at'>): Promise<Case> => {
    const newCase: Case = {
      ...newCaseData,
      id: `case-${Date.now()}`,
      firm_id: firm?.id || 'firm-delhi-001',
      created_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('cases').insert([newCase]).select().single();
        if (!error && data) {
          setCases(prev => [data, ...prev]);
          logActivity('Created new case record', newCase.case_title, 'case');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addCase error, saving locally:', e);
      }
    }

    const updated = [newCase, ...cases];
    setCases(updated);
    localStorage.setItem('legal_copilot_cases', JSON.stringify(updated));
    logActivity('Created new case record', newCase.case_title, 'case');

    // If next hearing date is given, create a hearing record
    if (newCase.next_hearing_date) {
      addHearing({
        case_id: newCase.id,
        hearing_date: newCase.next_hearing_date,
        court_room: newCase.judge_bench || 'Bench Courtroom',
        purpose: 'First Listing / Admission & Arguments',
        outcome_notes: 'Newly instituted matter. Notice to be served on opposite counsel.',
      });
    }

    return newCase;
  };

  const updateCase = async (id: string, updates: Partial<Case>) => {
    const updated = cases.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCases(updated);
    localStorage.setItem('legal_copilot_cases', JSON.stringify(updated));

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('cases').update(updates).eq('id', id);
    }
    const targetCase = cases.find(c => c.id === id);
    logActivity('Updated case details & status', targetCase?.case_title || id, 'case');
  };

  const deleteCase = async (id: string) => {
    const targetCase = cases.find(c => c.id === id);
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    localStorage.setItem('legal_copilot_cases', JSON.stringify(updated));

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('cases').delete().eq('id', id);
    }
    logActivity('Removed case file', targetCase?.case_title || id, 'case');
  };

  const getCaseById = (id: string): Case | undefined => {
    const found = cases.find(c => c.id === id);
    if (!found) return undefined;

    return {
      ...found,
      client: clients.find(cl => cl.id === found.client_id),
      hearings: hearings.filter(h => h.case_id === id).sort((a, b) => new Date(b.hearing_date).getTime() - new Date(a.hearing_date).getTime()),
      documents: documents.filter(d => d.case_id === id),
      tasks: tasks.filter(t => t.case_id === id),
      invoices: invoices.filter(i => i.case_id === id),
    };
  };

  // Client Operations
  const addClient = async (newClientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    const newClient: Client = {
      ...newClientData,
      id: `client-${Date.now()}`,
      firm_id: firm?.id || 'firm-delhi-001',
      created_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('clients').insert([newClient]).select().single();
        if (!error && data) {
          setClients(prev => [data, ...prev]);
          logActivity('Added new client profile', newClient.name, 'case');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addClient error, saving locally:', e);
      }
    }

    const updated = [newClient, ...clients];
    setClients(updated);
    localStorage.setItem('legal_copilot_clients', JSON.stringify(updated));
    logActivity('Added new client profile', newClient.name, 'case');
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const updated = clients.map(cl => (cl.id === id ? { ...cl, ...updates } : cl));
    setClients(updated);
    localStorage.setItem('legal_copilot_clients', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('clients').update(updates).eq('id', id);
    }
  };

  const deleteClient = async (id: string) => {
    const updated = clients.filter(cl => cl.id !== id);
    setClients(updated);
    localStorage.setItem('legal_copilot_clients', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('clients').delete().eq('id', id);
    }
  };

  // Hearing Operations
  const addHearing = async (newHearingData: Omit<Hearing, 'id' | 'created_at'>): Promise<Hearing> => {
    const matchedCase = cases.find(c => c.id === newHearingData.case_id);
    const newHearing: Hearing = {
      ...newHearingData,
      id: `hearing-${Date.now()}`,
      created_at: new Date().toISOString(),
      case_title: matchedCase?.case_title,
      case_number: matchedCase?.case_number,
      court_name: matchedCase?.court_name,
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('hearings').insert([newHearing]).select().single();
        if (!error && data) {
          setHearings(prev => [...prev, data]);
          // Update next_hearing_date in case
          updateCase(newHearing.case_id, { next_hearing_date: newHearing.hearing_date });
          logActivity('Scheduled court hearing', `${matchedCase?.case_title || ''} (${newHearing.purpose})`, 'hearing');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addHearing error:', e);
      }
    }

    const updated = [...hearings, newHearing];
    setHearings(updated);
    localStorage.setItem('legal_copilot_hearings', JSON.stringify(updated));
    
    // Update next_hearing_date in case
    updateCase(newHearing.case_id, { next_hearing_date: newHearing.hearing_date });
    logActivity('Scheduled court hearing', `${matchedCase?.case_title || ''} (${newHearing.purpose})`, 'hearing');
    return newHearing;
  };

  const updateHearing = async (id: string, updates: Partial<Hearing>) => {
    const updated = hearings.map(h => (h.id === id ? { ...h, ...updates } : h));
    setHearings(updated);
    localStorage.setItem('legal_copilot_hearings', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('hearings').update(updates).eq('id', id);
    }
  };

  // Document Operations
  const addDocument = async (newDocData: Omit<CaseDocument, 'id' | 'uploaded_at'>): Promise<CaseDocument> => {
    const newDoc: CaseDocument = {
      ...newDocData,
      id: `doc-${Date.now()}`,
      uploaded_by: user?.full_name || 'Advocate',
      uploaded_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('documents').insert([newDoc]).select().single();
        if (!error && data) {
          setDocuments(prev => [data, ...prev]);
          logActivity('Uploaded case document', newDoc.file_name, 'document');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addDoc error:', e);
      }
    }

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem('legal_copilot_docs', JSON.stringify(updated));
    logActivity('Uploaded case document', newDoc.file_name, 'document');
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    const target = documents.find(d => d.id === id);
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem('legal_copilot_docs', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('documents').delete().eq('id', id);
    }
    logActivity('Deleted document', target?.file_name || id, 'document');
  };

  // Task Operations
  const addTask = async (newTaskData: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const matchedCase = cases.find(c => c.id === newTaskData.case_id);
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      case_title: matchedCase?.case_title,
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
        if (!error && data) {
          setTasks(prev => [data, ...prev]);
          logActivity('Assigned task', newTask.title, 'task');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addTask error:', e);
      }
    }

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('legal_copilot_tasks', JSON.stringify(updated));
    logActivity('Assigned task', newTask.title, 'task');
    return newTask;
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status } : t));
    setTasks(updated);
    localStorage.setItem('legal_copilot_tasks', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('tasks').update({ status }).eq('id', id);
    }
    const t = tasks.find(item => item.id === id);
    logActivity(`Marked task as ${status}`, t?.title || id, 'task');
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('legal_copilot_tasks', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  };

  // Invoice Operations
  const addInvoice = async (newInvData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const matchedClient = clients.find(cl => cl.id === newInvData.client_id);
    const matchedCase = cases.find(c => c.id === newInvData.case_id);
    const newInvoice: Invoice = {
      ...newInvData,
      id: `inv-${Date.now()}`,
      firm_id: firm?.id || 'firm-delhi-001',
      invoice_number: newInvData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: matchedClient?.name,
      case_title: matchedCase?.case_title,
      created_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('invoices').insert([newInvoice]).select().single();
        if (!error && data) {
          setInvoices(prev => [data, ...prev]);
          logActivity('Generated professional fee invoice', `INR ${newInvoice.amount.toLocaleString('en-IN')}`, 'invoice');
          return data;
        }
      } catch (e) {
        console.warn('Supabase addInvoice error:', e);
      }
    }

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    localStorage.setItem('legal_copilot_invoices', JSON.stringify(updated));
    logActivity('Generated professional fee invoice', `INR ${newInvoice.amount.toLocaleString('en-IN')}`, 'invoice');
    return newInvoice;
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const updated = invoices.map(i => (i.id === id ? { ...i, status } : i));
    setInvoices(updated);
    localStorage.setItem('legal_copilot_invoices', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('invoices').update({ status }).eq('id', id);
    }
  };

  // Computed Helpers
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingHearings7Days = hearings
    .filter(h => {
      const hDate = new Date(h.hearing_date);
      return hDate >= new Date(now.setHours(0,0,0,0)) && hDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime());

  const urgentHearings3Days = hearings
    .filter(h => {
      const hDate = new Date(h.hearing_date);
      return hDate >= new Date(now.setHours(0,0,0,0)) && hDate <= threeDaysFromNow;
    })
    .sort((a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime());

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const activeCasesCount = cases.filter(c => c.status === 'active').length;
  const totalOutstandingDues = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <DataContext.Provider
      value={{
        cases,
        clients,
        hearings,
        documents,
        tasks,
        invoices,
        activityLogs,
        isLoadingData,
        addCase,
        updateCase,
        deleteCase,
        getCaseById,
        addClient,
        updateClient,
        deleteClient,
        addHearing,
        updateHearing,
        addDocument,
        deleteDocument,
        addTask,
        updateTaskStatus,
        deleteTask,
        addInvoice,
        updateInvoiceStatus,
        upcomingHearings7Days,
        urgentHearings3Days,
        pendingTasksCount,
        activeCasesCount,
        totalOutstandingDues,
        refreshData: loadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
