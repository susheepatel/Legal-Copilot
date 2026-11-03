import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Case, 
  Client, 
  Hearing, 
  CaseDocument, 
  Task, 
  Invoice, 
  ActivityLog, 
  InvoiceStatus 
} from '../../types';
import { 
  INITIAL_CASES, 
  INITIAL_CLIENTS, 
  INITIAL_HEARINGS, 
  INITIAL_DOCUMENTS, 
  INITIAL_TASKS, 
  INITIAL_INVOICES 
} from '../../lib/mockData';
import { supabase, getStoredSupabaseConfig } from '../../lib/supabaseClient';
import { useMobileAuth } from './MobileAuthContext';

interface MobileDataContextType {
  cases: Case[];
  clients: Client[];
  hearings: Hearing[];
  documents: CaseDocument[];
  tasks: Task[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  isLoadingData: boolean;
  addCase: (caseData: Omit<Case, 'id' | 'created_at'>) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  getCaseById: (id: string) => Case | undefined;
  addClient: (clientData: Omit<Client, 'id' | 'created_at'>) => Promise<Client>;
  addHearing: (hearingData: Omit<Hearing, 'id'>) => Promise<Hearing>;
  addTask: (taskData: Omit<Task, 'id' | 'created_at'>) => Promise<Task>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'created_at'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  upcomingHearings7Days: Hearing[];
  urgentHearings3Days: Hearing[];
  pendingTasksCount: number;
  activeCasesCount: number;
  totalOutstandingDues: number;
  refreshData: () => Promise<void>;
}

const MobileDataContext = createContext<MobileDataContextType | undefined>(undefined);

export const MobileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, firm } = useMobileAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadData = async () => {
    setIsLoadingData(true);
    const config = getStoredSupabaseConfig();

    if (supabase && config.isConfigured && firm?.id) {
      try {
        const [
          { data: casesData },
          { data: clientsData },
          { data: hearingsData },
          { data: docsData },
          { data: tasksData },
          { data: invoicesData },
          { data: logsData },
        ] = await Promise.all([
          supabase.from('cases').select('*').eq('firm_id', firm.id).order('created_at', { ascending: false }),
          supabase.from('clients').select('*').eq('firm_id', firm.id).order('name', { ascending: true }),
          supabase.from('hearings').select('*').order('hearing_date', { ascending: true }),
          supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
          supabase.from('tasks').select('*').order('due_date', { ascending: true }),
          supabase.from('invoices').select('*').eq('firm_id', firm.id).order('created_at', { ascending: false }),
          supabase.from('activity_logs').select('*').eq('firm_id', firm.id).order('timestamp', { ascending: false }).limit(25),
        ]);

        if (casesData !== null && clientsData !== null) {
          setCases(casesData || []);
          setClients(clientsData || []);
          setHearings(hearingsData || []);
          setDocuments(docsData || []);
          setTasks(tasksData || []);
          setInvoices(invoicesData || []);
          if (logsData && logsData.length > 0) {
            setActivityLogs(logsData);
          }
          setIsLoadingData(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase tables load notice, using mobile vault:', err);
      }
    }

    // Fallback to AsyncStorage cache or Mock Data
    try {
      const localCases = await AsyncStorage.getItem('mobile_copilot_cases');
      const localClients = await AsyncStorage.getItem('mobile_copilot_clients');
      const localHearings = await AsyncStorage.getItem('mobile_copilot_hearings');
      const localDocs = await AsyncStorage.getItem('mobile_copilot_docs');
      const localTasks = await AsyncStorage.getItem('mobile_copilot_tasks');
      const localInvoices = await AsyncStorage.getItem('mobile_copilot_invoices');
      const localLogs = await AsyncStorage.getItem('mobile_copilot_logs');

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
        ];
        setActivityLogs(initialLogs);
      }
    } catch (e) {
      setCases(INITIAL_CASES);
      setClients(INITIAL_CLIENTS);
      setHearings(INITIAL_HEARINGS);
      setDocuments(INITIAL_DOCUMENTS);
      setTasks(INITIAL_TASKS);
      setInvoices(INITIAL_INVOICES);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, [user, firm]);

  const logActivity = async (action: string, target: string, type: ActivityLog['type']) => {
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
    await AsyncStorage.setItem('mobile_copilot_logs', JSON.stringify(updated));

    if (supabase && getStoredSupabaseConfig().isConfigured && firm?.id) {
      supabase.from('activity_logs').insert([{
        id: newLog.id,
        firm_id: firm.id,
        user_name: newLog.user_name,
        action: newLog.action,
        target: newLog.target,
        type: newLog.type,
        timestamp: newLog.timestamp,
      }]).then(() => {});
    }
  };

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
      } catch (e) {}
    }

    const updated = [newCase, ...cases];
    setCases(updated);
    await AsyncStorage.setItem('mobile_copilot_cases', JSON.stringify(updated));
    logActivity('Created new case record', newCase.case_title, 'case');
    return newCase;
  };

  const updateCase = async (id: string, updates: Partial<Case>) => {
    const updated = cases.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCases(updated);
    await AsyncStorage.setItem('mobile_copilot_cases', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('cases').update(updates).eq('id', id);
    }
  };

  const deleteCase = async (id: string) => {
    const targetCase = cases.find(c => c.id === id);
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    await AsyncStorage.setItem('mobile_copilot_cases', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('cases').delete().eq('id', id);
    }
    if (targetCase) logActivity('Removed case docket', targetCase.case_title, 'case');
  };

  const getCaseById = (id: string) => cases.find(c => c.id === id);

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
          logActivity('Onboarded new client', newClient.name, 'case');
          return data;
        }
      } catch (e) {}
    }

    const updated = [newClient, ...clients];
    setClients(updated);
    await AsyncStorage.setItem('mobile_copilot_clients', JSON.stringify(updated));
    logActivity('Onboarded new client', newClient.name, 'case');
    return newClient;
  };

  const addHearing = async (hearingData: Omit<Hearing, 'id'>): Promise<Hearing> => {
    const newHearing: Hearing = {
      ...hearingData,
      id: `hearing-${Date.now()}`,
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('hearings').insert([newHearing]).select().single();
        if (!error && data) {
          setHearings(prev => [...prev, data]);
          logActivity('Scheduled judicial listing', `${newHearing.court_name} (${newHearing.hearing_date})`, 'hearing');
          return data;
        }
      } catch (e) {}
    }

    const updated = [...hearings, newHearing];
    setHearings(updated);
    await AsyncStorage.setItem('mobile_copilot_hearings', JSON.stringify(updated));
    logActivity('Scheduled judicial listing', `${newHearing.court_name} (${newHearing.hearing_date})`, 'hearing');
    return newHearing;
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
        if (!error && data) {
          setTasks(prev => [data, ...prev]);
          logActivity('Created procedural task', newTask.title, 'task');
          return data;
        }
      } catch (e) {}
    }

    const updated = [newTask, ...tasks];
    setTasks(updated);
    await AsyncStorage.setItem('mobile_copilot_tasks', JSON.stringify(updated));
    logActivity('Created procedural task', newTask.title, 'task');
    return newTask;
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status } : t));
    setTasks(updated);
    await AsyncStorage.setItem('mobile_copilot_tasks', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('tasks').update({ status }).eq('id', id);
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      firm_id: firm?.id || 'firm-delhi-001',
      created_at: new Date().toISOString(),
    };

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      try {
        const { data, error } = await supabase.from('invoices').insert([newInvoice]).select().single();
        if (!error && data) {
          setInvoices(prev => [data, ...prev]);
          logActivity('Generated fee invoice', `INR ${newInvoice.amount.toLocaleString('en-IN')}`, 'invoice');
          return data;
        }
      } catch (e) {}
    }

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    await AsyncStorage.setItem('mobile_copilot_invoices', JSON.stringify(updated));
    logActivity('Generated fee invoice', `INR ${newInvoice.amount.toLocaleString('en-IN')}`, 'invoice');
    return newInvoice;
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const updated = invoices.map(i => (i.id === id ? { ...i, status } : i));
    setInvoices(updated);
    await AsyncStorage.setItem('mobile_copilot_invoices', JSON.stringify(updated));
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('invoices').update({ status }).eq('id', id);
    }
  };

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingHearings7Days = hearings
    .filter(h => {
      const hDate = new Date(h.hearing_date);
      return hDate >= new Date(new Date().setHours(0,0,0,0)) && hDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime());

  const urgentHearings3Days = hearings
    .filter(h => {
      const hDate = new Date(h.hearing_date);
      return hDate >= new Date(new Date().setHours(0,0,0,0)) && hDate <= threeDaysFromNow;
    })
    .sort((a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime());

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const activeCasesCount = cases.filter(c => c.status === 'active').length;
  const totalOutstandingDues = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <MobileDataContext.Provider
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
        addHearing,
        addTask,
        updateTaskStatus,
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
    </MobileDataContext.Provider>
  );
};

export const useMobileData = () => {
  const context = useContext(MobileDataContext);
  if (!context) throw new Error('useMobileData must be used within MobileDataProvider');
  return context;
};

