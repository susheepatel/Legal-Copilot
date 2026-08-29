import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  Building, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  SlidersHorizontal,
  Gavel
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Case, CaseStatus } from '../../types';

interface CaseListViewProps {
  onSelectCase: (caseId: string) => void;
  onOpenNewCase: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  onSelectCase,
  onOpenNewCase,
}) => {
  const { cases, clients, deleteCase, updateCase } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Extract unique courts for filter
  const uniqueCourts = Array.from(new Set(cases.map(c => c.court_name)));

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.opposing_party?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCourt = courtFilter === 'all' || c.court_name === courtFilter;
    const matchesClient = clientFilter === 'all' || c.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesCourt && matchesClient;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & New Case Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Cases & Court Dockets</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              {cases.length} Total Matters
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage litigation dockets, track CNR numbers, hearing timelines, and opposing party records
          </p>
        </div>

        <button
          onClick={onOpenNewCase}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Institute New Case</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, CNR, party..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses (Active, Disposed, On-Hold)</option>
              <option value="active">Active Only</option>
              <option value="disposed">Disposed Matters</option>
              <option value="on-hold">On-Hold / Reserved</option>
            </select>
          </div>

          {/* Court Filter */}
          <div>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer truncate"
            >
              <option value="all">All Court Forums</option>
              {uniqueCourts.map((court) => (
                <option key={court} value={court}>
                  {court}
                </option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Clients</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary if applied */}
        {(searchQuery || statusFilter !== 'all' || courtFilter !== 'all' || clientFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span>Showing {filteredCases.length} of {cases.length} cases</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCourtFilter('all');
                setClientFilter('all');
              }}
              className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer text-[11px]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/40 p-8">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Cases Match Your Query</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Try adjusting your search terms or register a new matter in the chamber docket.
          </p>
          <button
            onClick={onOpenNewCase}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Institute New Case</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const matchedClient = clients.find(cl => cl.id === c.client_id);
            const nextHearing = c.next_hearing_date ? new Date(c.next_hearing_date) : null;
            const isUrgent = nextHearing && (nextHearing.getTime() - Date.now()) < 3 * 24 * 3600 * 1000 && nextHearing.getTime() > Date.now();

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="p-5 bg-slate-800/40 hover:bg-slate-800/70 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 rounded-2xl transition-all cursor-pointer group shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Case Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        c.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'disposed'
                          ? 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs font-mono font-medium text-indigo-300 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-700/50">
                        {c.case_number}
                      </span>
                      <span className="text-xs text-slate-400">• {c.case_type}</span>
                    </div>

                    <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {c.case_title}
                    </h2>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {c.court_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Client: <strong className="text-slate-300 font-semibold">{matchedClient?.name || 'Client'}</strong>
                      </span>
                      {c.opposing_party && (
                        <span>vs. {c.opposing_party}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Next Hearing & Assigned Lawyer */}
                  <div className="flex items-center space-x-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/40">
                    {nextHearing ? (
                      <div className={`p-2.5 rounded-xl border text-right min-w-[130px] ${
                        isUrgent 
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' 
                          : 'bg-slate-900/50 border-slate-700/50 text-slate-300'
                      }`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          Next Hearing
                        </div>
                        <div className="text-xs font-bold mt-0.5">
                          {nextHearing.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {isUrgent && (
                          <div className="text-[9px] font-bold text-rose-400">Urgent (In 3 Days)</div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl border bg-slate-900/50 border-slate-700/50 text-right min-w-[130px]">
                        <div className="text-[10px] text-slate-500 uppercase">Next Hearing</div>
                        <div className="text-xs text-slate-400 font-medium">To be listed</div>
                      </div>
                    )}

                    <div className="w-8 h-8 rounded-full bg-slate-800/70 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
