import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  Gavel,
  ChevronDown,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onToggleMobile: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewCase: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  onSelectTab,
  onOpenNewCase,
  onSelectCase,
}) => {
  const { urgentHearings3Days, cases, clients } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Filtered search results
  const filteredCases = searchQuery.trim()
    ? cases.filter(
        c =>
          c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.court_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredClients = searchQuery.trim()
    ? clients.filter(
        cl =>
          cl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cl.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Current Docket Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobile}
            className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Court Hours Active:</span>
            <span className="text-indigo-400 font-semibold">10:30 AM – 4:30 PM IST</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search CNR number, case title, court bench, client..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl backdrop-blur-md pl-9 pr-8 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                <span>Search results for "{searchQuery}"</span>
                <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                  Close
                </button>
              </div>

              {filteredCases.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Cases ({filteredCases.length})
                  </div>
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (onSelectCase) onSelectCase(c.id);
                        onSelectTab('cases');
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white truncate">{c.case_title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.case_number} • {c.court_name}</p>
                    </div>
                  ))}
                </div>
              )}

              {filteredClients.length > 0 && (
                <div className="p-2 border-t border-slate-700/40">
                  <div className="px-2 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    Clients ({filteredClients.length})
                  </div>
                  {filteredClients.map((cl) => (
                    <div
                      key={cl.id}
                      onClick={() => {
                        onSelectTab('clients');
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-white">{cl.name}</p>
                      <p className="text-[11px] text-slate-400">{cl.company_name || cl.phone || cl.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {filteredCases.length === 0 && filteredClients.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No matching cases, CNR numbers, or clients found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Quick Action AI & Notifications */}
        <div className="flex items-center space-x-2.5">
          {/* Quick AI Trigger */}
          <button
            onClick={() => onSelectTab('ai-copilot')}
            className="hidden sm:flex items-center space-x-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
          </button>

          {/* Urgent Hearing Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50"
            >
              <Bell className="w-4 h-4" />
              {urgentHearings3Days.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/50 text-xs font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Urgent Court Hearings (Next 3 Days)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                    {urgentHearings3Days.length}
                  </span>
                </div>

                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {urgentHearings3Days.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">No hearings in the next 3 days.</p>
                  ) : (
                    urgentHearings3Days.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          onSelectTab('calendar');
                          setIsNotifOpen(false);
                        }}
                        className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/40 hover:border-indigo-500/40 hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-rose-300">
                            {new Date(h.hearing_date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400">{h.court_room || 'Court'}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200 truncate mt-0.5">{h.case_title}</p>
                        <p className="text-[11px] text-indigo-300/90 truncate">{h.purpose}</p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    onSelectTab('calendar');
                    setIsNotifOpen(false);
                  }}
                  className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 pt-2 border-t border-slate-700/50 cursor-pointer font-medium"
                >
                  View Full Court Calendar →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
