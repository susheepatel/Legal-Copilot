import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Download, 
  Check, 
  Scale, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const SettingsView: React.FC = () => {
  const { user, firm } = useAuth();
  const { cases, clients, hearings, documents, tasks, invoices } = useData();

  const [activeTab, setActiveTab] = useState<'firm' | 'team' | 'export'>('firm');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Firm Info state
  const [firmName, setFirmName] = useState(firm?.name || 'Verma & Associates Legal Chambers');
  const [firmAddress, setFirmAddress] = useState(firm?.address || 'Chamber No. 418, Lawyers Chambers Block, Delhi High Court');
  const [firmCity, setFirmCity] = useState(firm?.city || 'New Delhi');
  const [firmPhone, setFirmPhone] = useState(firm?.phone || '+91 98110 44552');
  const [firmEmail, setFirmEmail] = useState(firm?.email || 'chambers@vermaassociates.in');

  const handleSaveFirmProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
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
          Manage law firm profile, advocate team members, permissions, and practice data backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 space-x-2">
        {[
          { id: 'firm', label: 'Law Firm Profile', icon: Building2 },
          { id: 'team', label: 'Chamber Advocates & Roles', icon: Users },
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

      {/* TAB 3: EXPORT & BACKUP */}
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
