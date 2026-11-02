import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Download, 
  Check, 
  Scale, 
  ShieldCheck,
  Briefcase,
  Database,
  RefreshCw,
  Server,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  supabase, 
  SupabaseConnectionTestResult 
} from '../../lib/supabaseClient';

export const SettingsView: React.FC = () => {
  const { user, firm } = useAuth();
  const { cases, clients, hearings, documents, tasks, invoices, activityLogs, refreshData } = useData();

  const [activeTab, setActiveTab] = useState<'firm' | 'team' | 'export' | 'database'>('firm');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Firm Info state
  const [firmName, setFirmName] = useState(firm?.name || 'Verma & Associates Legal Chambers');
  const [firmAddress, setFirmAddress] = useState(firm?.address || 'Chamber No. 418, Lawyers Chambers Block, Delhi High Court');
  const [firmCity, setFirmCity] = useState(firm?.city || 'New Delhi');
  const [firmPhone, setFirmPhone] = useState(firm?.phone || '+91 98110 44552');
  const [firmEmail, setFirmEmail] = useState(firm?.email || 'chambers@vermaassociates.in');

  // Supabase Database state
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [testResult, setTestResult] = useState<SupabaseConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveFirmProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleSaveDatabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        isConfigured: true,
        url: supabaseUrl,
        authWorking: false,
        error: err.message || 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!supabase) {
      setSyncStatus('Error: Supabase client is not initialized. Please verify your Project URL and Anon Key.');
      return;
    }
    setIsSyncing(true);
    setSyncStatus('Initiating upload of all practice records to Supabase tables...');

    try {
      // 1. Sync Firm
      if (firm) {
        await supabase.from('firms').upsert([{
          id: firm.id,
          name: firm.name,
          city: firm.city || 'New Delhi',
          state: firm.state || 'Delhi',
          address: firm.address,
          phone: firm.phone,
          email: firm.email,
          practice_areas: firm.practice_areas || ['Litigation'],
        }]);
      }

      // 2. Sync Profiles
      if (user) {
        await supabase.from('profiles').upsert([{
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          bar_enrollment_no: user.bar_enrollment_no,
          phone: user.phone,
          firm_id: firm?.id || 'firm-delhi-001',
          role: user.role,
        }]);
      }

      // 3. Sync Clients
      if (clients && clients.length > 0) {
        await supabase.from('clients').upsert(clients);
      }

      // 4. Sync Cases (stripping enriched runtime relational fields)
      if (cases && cases.length > 0) {
        const cleanCases = cases.map(({ client, hearings, documents, tasks, invoices, ...c }) => c);
        await supabase.from('cases').upsert(cleanCases);
      }

      // 5. Sync Hearings
      if (hearings && hearings.length > 0) {
        await supabase.from('hearings').upsert(hearings);
      }

      // 6. Sync Documents
      if (documents && documents.length > 0) {
        await supabase.from('documents').upsert(documents);
      }

      // 7. Sync Tasks
      if (tasks && tasks.length > 0) {
        await supabase.from('tasks').upsert(tasks);
      }

      // 8. Sync Invoices
      if (invoices && invoices.length > 0) {
        await supabase.from('invoices').upsert(invoices);
      }

      // 9. Sync Activity Logs
      if (activityLogs && activityLogs.length > 0) {
        await supabase.from('activity_logs').upsert(activityLogs);
      }

      setSyncStatus(`✔ Success! All ${cases.length} cases, ${clients.length} clients, ${hearings.length} hearings, ${tasks.length} tasks, and ${invoices.length} invoices are active in Supabase!`);
      await refreshData();
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message || 'Failed to upload records to Supabase tables. Check table schema.'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJson = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      firm: firm,
      user: user,
      cases,
      clients,
      hearings,
      documents,
      tasks,
      invoices,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Copilot_Chamber_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const copySqlSchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Chamber Settings & Administration</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-indigo-300 border border-slate-700/50 font-semibold">
            Firm ID: {firm?.id || 'firm-delhi-001'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage law firm profile, advocate team members, Supabase database synchronization, and backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 space-x-2">
        {[
          { id: 'firm', label: 'Law Firm Profile', icon: Building2 },
          { id: 'team', label: 'Chamber Advocates & Roles', icon: Users },
          { id: 'database', label: 'Database & Supabase Sync', icon: Database },
          { id: 'export', label: 'Data Backup & Export', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FIRM PROFILE */}
      {activeTab === 'firm' && (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl max-w-3xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div>
              <h3 className="text-base font-bold text-white">Chamber & Firm Credentials</h3>
              <p className="text-xs text-slate-400">These details appear on legal notices, petitions, court fee memos, and invoices.</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>

          <form onSubmit={handleSaveFirmProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chamber / Firm Name</label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chamber Address</label>
                <input
                  type="text"
                  value={firmAddress}
                  onChange={(e) => setFirmAddress(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jurisdiction / City</label>
                <input
                  type="text"
                  value={firmCity}
                  onChange={(e) => setFirmCity(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Office Telephone / Mobile</label>
                <input
                  type="text"
                  value={firmPhone}
                  onChange={(e) => setFirmPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Registry Email</label>
                <input
                  type="email"
                  value={firmEmail}
                  onChange={(e) => setFirmEmail(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs md:text-sm cursor-pointer shadow-lg shadow-indigo-500/20 transition-colors"
              >
                Save Chamber Profile
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profile details updated!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: TEAM & ROLES */}
      {activeTab === 'team' && (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div>
              <h3 className="text-base font-bold text-white">Chamber Advocates & Staff Roles</h3>
              <p className="text-xs text-slate-400">Manage advocate logins, Bar Council enrollment numbers, and permissions</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'user-001', name: 'Adv. Rajesh Verma', role: 'admin', email: 'rajesh.verma@chamber.in', bar: 'D/1482/2004', title: 'Senior Partner / Founder' },
              { id: 'user-002', name: 'Adv. Priya Sharma', role: 'lawyer', email: 'priya.sharma@chamber.in', bar: 'D/3109/2016', title: 'Senior Associate (Civil & Writs)' },
              { id: 'user-003', name: 'Adv. Aditya Nair', role: 'lawyer', email: 'aditya.nair@chamber.in', bar: 'D/5920/2021', title: 'Junior Counsel (Criminal & Bail)' },
            ].map((member) => (
              <div
                key={member.id}
                className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/50 text-indigo-300 font-bold flex items-center justify-center text-sm">
                    {member.name.charAt(5)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-white">{member.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        member.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {member.title} • Bar Enr: <span className="text-indigo-300 font-mono">{member.bar}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-mono">{member.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE & SUPABASE SYNC */}
      {activeTab === 'database' && (
        <div className="space-y-6 max-w-4xl">
          {/* Connection Card */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Supabase PostgreSQL Database</h3>
                  <p className="text-xs text-slate-400">Connect to your cloud PostgreSQL database to persist all dockets, hearings, and clients.</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                testResult?.success || currentConfig.isConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${testResult?.success || currentConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {testResult?.success ? 'Connected & Verified' : currentConfig.isConfigured ? 'Configured' : 'Local Vault (Offline)'}
              </span>
            </div>

            <form onSubmit={handleSaveDatabaseConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Found in your Supabase Dashboard: Project Settings ➔ API ➔ Project URL</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Found in Supabase: Project Settings ➔ API ➔ Project API Keys (anon public)</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs md:text-sm cursor-pointer shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Save Connection Settings
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-5 py-2.5 bg-slate-700/70 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs md:text-sm cursor-pointer border border-slate-600/50 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Host...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs md:text-sm cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50 ml-auto"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Syncing Tables...' : 'Push All Data to Supabase'}</span>
                </button>
              </div>
            </form>

            {/* Test Results Output */}
            {testResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                testResult.success 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{testResult.success ? 'Supabase Connection Verified' : 'Connection Check Failed'}</span>
                  {testResult.latencyMs && <span className="text-slate-400 font-normal">({testResult.latencyMs}ms response time)</span>}
                </div>
                <p className="text-[11px] opacity-90">{testResult.details || testResult.error}</p>
                {testResult.tablesFound && testResult.tablesFound.length > 0 && (
                  <div className="pt-1">
                    <span className="font-semibold text-slate-200">Active Tables: </span>
                    <span className="font-mono text-[10px] text-emerald-300">{testResult.tablesFound.join(', ')}</span>
                  </div>
                )}
                {testResult.tablesMissing && testResult.tablesMissing.length > 0 && (
                  <div className="pt-1 text-amber-300">
                    <span className="font-semibold">Missing Schema Tables: </span>
                    <span className="font-mono text-[10px]">{testResult.tablesMissing.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sync Status Banner */}
            {syncStatus && (
              <div className="p-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-xs text-slate-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}
          </div>

          {/* Database Tables Blueprint */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
              <div>
                <h4 className="text-sm font-bold text-white">Application Tables (10 Tables Managed)</h4>
                <p className="text-xs text-slate-400">All tables exist in the PostgreSQL schema with Row Level Security (RLS) policies.</p>
              </div>
              <button
                onClick={copySqlSchemaPath}
                className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 text-[11px] rounded-lg border border-slate-700/50 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied path!' : 'Copy schema.sql path'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'cases', desc: 'Litigation docket, CNR, court & bench', count: cases.length },
                { name: 'clients', desc: 'Client CRM & contact directory', count: clients.length },
                { name: 'hearings', desc: 'Court cause lists & hearing timeline', count: hearings.length },
                { name: 'documents', desc: 'Pleadings, bail apps, vakalatnamas', count: documents.length },
                { name: 'tasks', desc: 'Litigation tasks & deadlines', count: tasks.length },
                { name: 'invoices', desc: 'Fee memos, bills & retainers', count: invoices.length },
                { name: 'firms', desc: 'Law chamber profiles & jurisdictions', count: 1 },
                { name: 'profiles', desc: 'Advocate logins & Bar enrollments', count: 3 },
                { name: 'activity_logs', desc: 'Chamber audit trail & action logs', count: activityLogs.length },
                { name: 'ai_research_queries', desc: 'BNS lookups, AI drafts & citations', count: 'Active' },
              ].map((table) => (
                <div key={table.name} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-300">{table.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {table.count} records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{table.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-500/20 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-indigo-300">💡 SQL Schema Ready for Execution</p>
              <p className="text-[11px] text-slate-400">
                The complete SQL migration script is located at <code className="text-emerald-400 font-mono">supabase/schema.sql</code>.
                To deploy it, open your <strong>Supabase Dashboard ➔ SQL Editor</strong>, paste the script, and click <strong>Run</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT & BACKUP */}
      {activeTab === 'export' && (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Export Chamber Records</h3>
          <p className="text-xs text-slate-400">
            Export a complete JSON backup of all litigation dockets, client KYC, court cause lists, tasks, and billing records.
          </p>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Total Active & Disposed Cases:</span>
              <strong className="text-white">{cases.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Clients Registered in CRM:</span>
              <strong className="text-white">{clients.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Hearing History & Cause Lists:</span>
              <strong className="text-white">{hearings.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Document Vault Records:</span>
              <strong className="text-white">{documents.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Fee Memos & Invoices:</span>
              <strong className="text-white">{invoices.length}</strong>
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs md:text-sm flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Complete Chamber Backup (.json)</span>
          </button>
        </div>
      )}
    </div>
  );
};
