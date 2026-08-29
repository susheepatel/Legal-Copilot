import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Receipt, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Gavel, 
  ChevronRight, 
  UserPlus, 
  Check, 
  FileText,
  Building,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NavTab } from '../layout/Sidebar';
import { Hearing } from '../../types';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenNewCase: () => void;
  onOpenNewClient: () => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenNewCase,
  onOpenNewClient,
  onSelectCase,
}) => {
  const { user, firm } = useAuth();
  const { 
    cases, 
    upcomingHearings7Days, 
    urgentHearings3Days, 
    tasks, 
    activityLogs, 
    activeCasesCount, 
    pendingTasksCount, 
    totalOutstandingDues,
    updateTaskStatus,
    updateHearing
  } = useData();

  const [selectedHearingForOutcome, setSelectedHearingForOutcome] = useState<Hearing | null>(null);
  const [hearingOutcomeText, setHearingOutcomeText] = useState('');

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHearingForOutcome) return;
    await updateHearing(selectedHearingForOutcome.id, {
      outcome_notes: hearingOutcomeText,
    });
    setSelectedHearingForOutcome(null);
    setHearingOutcomeText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner & Chambers Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>High Court & District Practice</span>
            <span>•</span>
            <span>{firm?.city || 'New Delhi'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {user?.full_name || 'Counsel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {urgentHearings3Days.length > 0 ? (
              <span className="text-rose-300 font-medium">
                ⚠️ You have {urgentHearings3Days.length} urgent court {urgentHearings3Days.length === 1 ? 'hearing' : 'hearings'} scheduled in the next 3 days.
              </span>
            ) : (
              'All court dockets and statutory matters are up to date.'
            )}
          </p>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenNewCase}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Case / Docket</span>
          </button>
          
          <button
            onClick={onOpenNewClient}
            className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 font-medium px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700/50 backdrop-blur-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-400" />
            <span>Add Client</span>
          </button>

          <button
            onClick={() => onSelectTab('ai-copilot')}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cases */}
        <div 
          onClick={() => onSelectTab('cases')}
          className="bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 p-5 rounded-2xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Dockets</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{activeCasesCount}</span>
            <span className="text-xs text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across High Court & District Forums</p>
        </div>

        {/* Hearings Next 7 Days */}
        <div 
          onClick={() => onSelectTab('calendar')}
          className="bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-rose-500/40 p-5 rounded-2xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Hearings (Next 7 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-300 tracking-tight">{upcomingHearings7Days.length}</span>
            {urgentHearings3Days.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {urgentHearings3Days.length} in next 3 days
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Court appearances scheduled</p>
        </div>

        {/* Pending Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 p-5 rounded-2xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Actions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{pendingTasksCount}</span>
            <span className="text-xs text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 font-medium">
              View Tasks <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Drafting, rejoinders & filings</p>
        </div>

        {/* Outstanding Dues */}
        <div 
          onClick={() => onSelectTab('billing')}
          className="bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/40 p-5 rounded-2xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Outstanding Retainers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-400 tracking-tight">
              ₹ {totalOutstandingDues.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 font-medium">
              Invoices <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending fee recovery from clients</p>
        </div>
      </div>

      {/* Main 2-Column Section: Upcoming Hearings (Urgent 7 Days) + Pending Tasks / Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Upcoming Hearings Calendar List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <Gavel className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Upcoming Court Hearings (Next 7 Days)</h2>
              </div>
              <button
                onClick={() => onSelectTab('calendar')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                Full Calendar <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingHearings7Days.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/60">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No hearings listed for the next 7 days.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Add next hearing dates in case files to populate.</p>
                </div>
              ) : (
                upcomingHearings7Days.map((h) => {
                  const hDate = new Date(h.hearing_date);
                  const isToday = hDate.toDateString() === new Date().toDateString();
                  const isTomorrow = new Date(Date.now() + 24*3600*1000).toDateString() === hDate.toDateString();

                  return (
                    <div
                      key={h.id}
                      className="p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/40 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        {/* Date badge */}
                        <div className={`p-2.5 rounded-xl text-center shrink-0 border min-w-[64px] ${
                          isToday 
                            ? 'bg-rose-950/80 border-rose-700/60 text-rose-300 font-bold' 
                            : isTomorrow
                            ? 'bg-amber-950/80 border-amber-700/60 text-amber-300 font-bold'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                        }`}>
                          <div className="text-[10px] uppercase tracking-wider font-semibold">
                            {hDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                          </div>
                          <div className="text-base font-extrabold leading-none my-0.5">
                            {hDate.getDate()}
                          </div>
                          <div className="text-[9px] uppercase text-slate-400">
                            {hDate.toLocaleDateString('en-IN', { month: 'short' })}
                          </div>
                        </div>

                        {/* Hearing Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span 
                              onClick={() => onSelectCase(h.case_id)}
                              className="text-xs font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer truncate"
                            >
                              {h.case_title}
                            </span>
                            {isToday && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white">
                                LISTED TODAY
                              </span>
                            )}
                            {isTomorrow && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950">
                                TOMORROW
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-indigo-300/90 font-medium mt-0.5">
                            📌 Purpose: {h.purpose}
                          </p>

                          <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-500" />
                              {h.court_room || 'Courtroom Bench'}
                            </span>
                            <span>•</span>
                            <span>{h.court_name || 'Court'}</span>
                          </div>

                          {h.outcome_notes && (
                            <p className="text-[11px] text-emerald-300/90 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 mt-1.5 inline-block">
                              Outcome: {h.outcome_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedHearingForOutcome(h);
                            setHearingOutcomeText(h.outcome_notes || '');
                          }}
                          className="px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                        >
                          Log Outcome
                        </button>
                        <button
                          onClick={() => onSelectCase(h.case_id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                          title="Open Case File"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Case Tasks Preview */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Actionable Case Tasks</h2>
              </div>
              <button
                onClick={() => onSelectTab('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                All Tasks ({tasks.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.filter(t => t.status !== 'completed').slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="w-5 h-5 rounded-lg border border-slate-600 hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {task.case_title ? `${task.case_title} • ` : ''}
                        Assigned to: {task.assigned_to_name || 'Counsel'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {task.priority && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        task.priority === 'urgent'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : task.priority === 'high'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Feed & AI Quick Query Box */}
        <div className="space-y-4">
          {/* Quick AI Legal Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-purple-900/30 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Legal Copilot (BNS/BNSS/BSA)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Instant research across Bharatiya Nyaya Sanhita (BNS 2023), Limitation Act 1963, and court drafting.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onSelectTab('ai-copilot')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-indigo-500/50 text-xs text-slate-300 flex items-center justify-between group cursor-pointer transition-all hover:bg-slate-900/80"
              >
                <span>🔍 Compare BNS vs IPC Sections</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </button>
              <button
                onClick={() => onSelectTab('ai-copilot')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-indigo-500/50 text-xs text-slate-300 flex items-center justify-between group cursor-pointer transition-all hover:bg-slate-900/80"
              >
                <span>📝 Draft Bail Application (482 BNSS)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </button>
              <button
                onClick={() => onSelectTab('ai-copilot')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-indigo-500/50 text-xs text-slate-300 flex items-center justify-between group cursor-pointer transition-all hover:bg-slate-900/80"
              >
                <span>⏱️ Check Statutory Limitation Period</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Chambers Activity Feed</h3>
              </div>
            </div>

            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No recent activity logged.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="text-xs border-l-2 border-indigo-500/50 pl-3 py-1">
                    <p className="text-slate-300 font-medium leading-tight">
                      <span className="text-indigo-300 font-semibold">{log.user_name}</span> {log.action}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">"{log.target}"</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Outcome Modal */}
      {selectedHearingForOutcome && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Log Court Hearing Outcome
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {selectedHearingForOutcome.case_title} ({selectedHearingForOutcome.court_room})
            </p>

            <form onSubmit={handleSaveOutcome} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Court Orders / Bench Directions / Next Steps
                </label>
                <textarea
                  rows={4}
                  required
                  value={hearingOutcomeText}
                  onChange={(e) => setHearingOutcomeText(e.target.value)}
                  placeholder="e.g. Interim injunction extended till next date. Pleadings completed. Fixed for final arguments on 15.09.2024."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHearingForOutcome(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Save Outcome & Update File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
