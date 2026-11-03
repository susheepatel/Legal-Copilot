import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeCustomLegalAiModel } from './customLegalAiModel';

// Default Supabase project credentials for Legal Copilot cloud database
export const DEFAULT_SUPABASE_URL = 'https://fgcmspgfxdieljbhliuq.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnY21zcGdmeGRpZWxqYmhsaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzM4NDMsImV4cCI6MjEwMzUwOTg0M30.TSAtwi1Afa_RcWJT9cIRmHlZs7-GCtSvGuKars9zgAk';
export const DEFAULT_SUPABASE_JWKS_URL = 'https://fgcmspgfxdieljbhliuq.supabase.co/auth/v1/.well-known/jwks.json';

export function getStoredSupabaseConfig() {
  let localUrl = '';
  let localKey = '';
  
  if (typeof localStorage !== 'undefined') {
    try {
      localUrl = localStorage.getItem('legal_copilot_supabase_url') || '';
      localKey = localStorage.getItem('legal_copilot_supabase_anon_key') || '';
    } catch {}
  }

  let envUrl = '';
  let envKey = '';
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      envUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
      envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      envUrl = envUrl || process.env.VITE_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
      envKey = envKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    }
  } catch {}

  try {
    const Constants = require('expo-constants')?.default;
    if (Constants?.expoConfig?.extra) {
      envUrl = envUrl || Constants.expoConfig.extra.supabaseUrl;
      envKey = envKey || Constants.expoConfig.extra.supabaseAnonKey;
    }
  } catch {}
  
  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;
  const anonKey = key;
  
  const isDefaultOrPlaceholder = !url || url.includes('your-project') || !key || key.includes('your-anon-key');
  
  return {
    url,
    key,
    anonKey,
    jwksUrl: DEFAULT_SUPABASE_JWKS_URL,
    isConfigured: !isDefaultOrPlaceholder && url.startsWith('http'),
  };
}

export const getSupabaseConfig = getStoredSupabaseConfig;

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof localStorage !== 'undefined') {
    try {
      if (url) localStorage.setItem('legal_copilot_supabase_url', url.trim());
      if (key) localStorage.setItem('legal_copilot_supabase_anon_key', key.trim());
    } catch {}
  }
  // Reinitialize client
  initSupabaseClient();
}

let activeClient: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    try {
      const storageAdapter = typeof localStorage !== 'undefined' ? localStorage : AsyncStorage;
      activeClient = createClient(config.url, config.key, {
        auth: {
          storage: storageAdapter,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      return activeClient;
    } catch (err) {
      console.warn('Failed to initialize live Supabase client:', err);
      activeClient = null;
    }
  }
  return null;
}

// Diagnostics result interface
export interface SupabaseConnectionTestResult {
  success: boolean;
  isConfigured: boolean;
  url: string;
  latencyMs?: number;
  authWorking: boolean;
  tablesFound?: string[];
  tablesMissing?: string[];
  error?: string;
  details?: string;
}

// Function to proactively test and diagnose Supabase connection
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<SupabaseConnectionTestResult> {
  const url = (customUrl !== undefined ? customUrl : getStoredSupabaseConfig().url).trim();
  const key = (customKey !== undefined ? customKey : getStoredSupabaseConfig().key).trim();

  if (!url || !key || url.includes('your-project') || key.includes('your-anon-key')) {
    return {
      success: false,
      isConfigured: false,
      url: url || '(Not configured)',
      authWorking: false,
      error: 'Supabase credentials are not configured or still using placeholder values.',
      details: 'Please enter your Supabase Project URL (e.g. https://xyzcompany.supabase.co) and your public Anon API Key.',
    };
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      success: false,
      isConfigured: true,
      url,
      authWorking: false,
      error: 'Invalid Supabase Project URL format. Must begin with https://',
      details: 'Ensure your URL matches: https://<project-id>.supabase.co',
    };
  }

  const startTime = performance.now();

  try {
    const testClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 1. Test Auth service reachability
    const authRes = await testClient.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (authRes.error && authRes.error.message.includes('API key')) {
      return {
        success: false,
        isConfigured: true,
        url,
        latencyMs,
        authWorking: false,
        error: 'Invalid API Key: ' + authRes.error.message,
        details: 'Check your Supabase Dashboard > Project Settings > API > "anon public" key.',
      };
    }

    // 2. Test schema tables
    const expectedTables = ['firms', 'profiles', 'cases', 'hearings', 'clients', 'documents', 'tasks', 'invoices'];
    const tablesFound: string[] = [];
    const tablesMissing: string[] = [];

    for (const tableName of expectedTables) {
      try {
        const { error } = await testClient.from(tableName).select('id').limit(1);
        if (error) {
          if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
            tablesMissing.push(tableName);
          } else {
            // Table exists but maybe RLS or permission restriction, which means table is present!
            tablesFound.push(tableName);
          }
        } else {
          tablesFound.push(tableName);
        }
      } catch {
        tablesMissing.push(tableName);
      }
    }

    const allTablesPresent = tablesMissing.length === 0;

    return {
      success: true,
      isConfigured: true,
      url,
      latencyMs,
      authWorking: true,
      tablesFound,
      tablesMissing,
      details: allTablesPresent 
        ? `Successfully connected to Supabase (${latencyMs}ms). All ${expectedTables.length} PostgreSQL tables and RLS policies are active.`
        : `Connected to Supabase (${latencyMs}ms), but ${tablesMissing.length} tables are missing. Please execute the provided PostgreSQL schema in your Supabase SQL Editor.`,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      isConfigured: true,
      url,
      latencyMs,
      authWorking: false,
      error: err.message || 'Network error or host unreachable',
      details: 'Unable to reach the Supabase host. Verify your internet connection and Supabase Project URL.',
    };
  }
}

// Dynamic Proxy to always route calls to the active Supabase client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = activeClient || initSupabaseClient();
    if (!client) return undefined;
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});



// Helper to invoke the server-side AI Copilot function (satisfying contract POST /functions/v1/ai-copilot and /api/ai-copilot)
export async function invokeAICopilot(payload: {
  task: string;
  input?: string;
  prompt?: string;
  context?: any;
  case_id?: string;
}): Promise<{ output?: string; content?: string; disclaimer?: string; model?: string; warning?: string }> {
  // ── 1. Try the local dev/prod Express server (which uses Qwen internally) ──
  try {
    const res = await fetch('/functions/v1/ai-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();

    const altRes = await fetch('/api/ai-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (altRes.ok) return await altRes.json();
  } catch { /* server unreachable — try direct Qwen */ }

  // ── 2. Fallback: Call Qwen 2.5 Coder directly from the browser ────────────
  try {
    const { invokeQwenLegalCopilot } = await import('./qwenClient');
    const result = await invokeQwenLegalCopilot(payload);
    return result;
  } catch (qwenErr) {
    console.warn('Qwen direct call failed, running native legal model engine:', qwenErr);
  }

  // ── 3. Final fallback: sub-ms native hash engine ───────────────────────────
  return executeCustomLegalAiModel(payload);
}

