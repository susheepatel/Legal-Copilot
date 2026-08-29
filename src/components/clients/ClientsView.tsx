import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building2, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Client } from '../../types';

interface ClientsViewProps {
  onSelectCase: (caseId: string) => void;
  onOpenNewCaseWithClient: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onSelectCase,
  onOpenNewCaseWithClient,
}) => {
  const { clients, cases, addClient, updateClient, deleteClient } = useData();
  const { firm } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);

  // New Client Modal
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Filtered clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const created = await addClient({
      firm_id: firm?.id || 'firm-delhi-001',
      name,
      company_name: companyName,
      phone,
      email,
      address,
      notes,
    });

    setIsAddingClient(false);
    setSelectedClient(created);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const clientCases = selectedClient
    ? cases.filter(c => c.client_id === selectedClient.id)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Client Directory & Retainers</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              {clients.length} Clients
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain client KYC, contact directories, active dockets, and retainership history
          </p>
        </div>

        <button
          onClick={() => setIsAddingClient(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Client</span>
        </button>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Client Search & List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, company, phone..."
              className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 text-xs text-slate-400">
                No clients found matching "{searchQuery}".
              </div>
            ) : (
              filteredClients.map((cl) => {
                const isSelected = selectedClient?.id === cl.id;
                const count = cases.filter(c => c.client_id === cl.id).length;

                return (
                  <div
                    key={cl.id}
                    onClick={() => setSelectedClient(cl)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                        {cl.name}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-400 border border-slate-700/50">
                        {count} {count === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                    {cl.company_name && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{cl.company_name}</p>
                    )}
                    {cl.phone && (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {cl.phone}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Client Profile & Active Cases */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClient ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-white">{selectedClient.name}</h2>
                      {selectedClient.company_name && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                          {selectedClient.company_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Client ID: {selectedClient.id} • Added {new Date(selectedClient.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenNewCaseWithClient(selectedClient.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Institute Case for Client</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete client ${selectedClient.name}?`)) {
                          deleteClient(selectedClient.id);
                          setSelectedClient(null);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact & KYC Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
                    <a
                      href={`tel:${selectedClient.phone}`}
                      className="text-indigo-300 hover:underline font-semibold mt-1 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {selectedClient.phone || 'Not provided'}
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                    <a
                      href={`mailto:${selectedClient.email}`}
                      className="text-slate-300 hover:text-white font-medium mt-1 flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedClient.email || 'Not provided'}
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Chambers Notes</span>
                    <p className="text-slate-300 mt-1 truncate">
                      {selectedClient.notes || 'General Retainership'}
                    </p>
                  </div>
                </div>

                {selectedClient.address && (
                  <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50 text-xs flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{selectedClient.address}</span>
                  </div>
                )}
              </div>

              {/* Linked Cases List */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      Associated Cases & Dockets ({clientCases.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {clientCases.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-700/50">
                      No active or disposed court cases recorded for this client.
                    </div>
                  ) : (
                    clientCases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectCase(c.id)}
                        className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                              {c.case_title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.case_number} • {c.court_name}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-12 text-center text-slate-400">
              Select a client from the directory to view retainership dockets and contact details.
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-base font-bold text-white">Add New Client to Chamber CRM</h3>
              <button onClick={() => setIsAddingClient(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Full Name / Entity *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smt. Sunita Devi / Ananya Buildcon Ltd."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization (if applicable)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Ananya Buildcon Pvt. Ltd."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98110 12345"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Office / Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 42, Barakhamba Road, Connaught Place, New Delhi"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chambers KYC & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Billing terms, retainer frequency, special instructions..."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Add Client to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
