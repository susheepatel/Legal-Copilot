import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CalendarDays, 
  FolderArchive, 
  CheckSquare, 
  Receipt, 
  Sparkles, 
  Settings, 
  Scale, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export type NavTab = 
  | 'dashboard' 
  | 'cases' 
  | 'clients' 
  | 'calendar' 
  | 'documents' 
  | 'tasks' 
  | 'billing' 
  | 'ai-copilot' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewCase: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewCase,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, firm, logout, isSupabaseConnected } = useAuth();
  const { urgentHearings3Days, pendingTasksCount, activeCasesCount } = useData();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: urgentHearings3Days.length > 0 ? `${urgentHearings3Days.length} Urgent` : undefined,
      badgeColor: 'bg-rose-900/80 text-rose-300 border-rose-700',
    },
    {
      id: 'cases' as NavTab,
      label: 'Cases & Dockets',
      icon: Briefcase,
      badge: `${activeCasesCount} Active`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'clients' as NavTab,
      label: 'Clients (CRM)',
      icon: Users,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Court Calendar',
      icon: CalendarDays,
      badge: urgentHearings3Days.length > 0 ? `${urgentHearings3Days.length}` : undefined,
      badgeColor: 'bg-amber-900/80 text-amber-300 border-amber-700',
    },
    {
      id: 'documents' as NavTab,
      label: 'Document Vault',
      icon: FolderArchive,
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks & Actions',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : undefined,
      badgeColor: 'bg-sky-900/80 text-sky-300 border-sky-700',
    },
    {
      id: 'billing' as NavTab,
      label: 'Billing & Invoices',
      icon: Receipt,
    },
    {
      id: 'ai-copilot' as NavTab,
      label: 'AI Legal Copilot',
      icon: Sparkles,
      highlight: true,
      badge: 'BNS 2023',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold border-amber-400 shadow-sm',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Schema',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">Legal Copilot</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  IND
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                <Building2 className="w-3 h-3 text-slate-500 inline shrink-0" />
                {firm?.name || 'Verma & Associates'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick New Case Action */}
        <div className="px-5 pt-5 pb-2">
          <button
            onClick={() => {
              onOpenNewCase();
              onCloseMobile();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Scale className="w-4 h-4" />
            <span>+ Institution / New Case</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Practice Chambers
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold backdrop-blur-md shadow-xs'
                    : item.highlight
                    ? 'text-indigo-300 hover:bg-white/5 bg-indigo-500/5 border border-indigo-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-indigo-400'
                        : item.highlight
                        ? 'text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                      item.badgeColor || 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Local AI Engine Status Indicator */}
        <div className="p-3 mx-4 mb-2 rounded-xl bg-slate-800/30 backdrop-blur-md border border-slate-700/40 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Local AI Engine
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Qwen 2.5 Coder • Real-Time Stream
          </p>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-indigo-300 text-xs overflow-hidden shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'A'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
                  {user?.full_name || 'Advocate'}
                  {user?.role === 'admin' && (
                    <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                  )}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.bar_enrollment_no ? `Bar: ${user.bar_enrollment_no}` : user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
