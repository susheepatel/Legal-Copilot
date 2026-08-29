import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  CheckSquare, 
  Receipt, 
  Sparkles, 
  Building, 
  User, 
  Plus, 
  Gavel, 
  FolderArchive, 
  Upload, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  Scale,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CaseDocument, CaseStatus, DocumentType, Hearing, Task, TaskStatus } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface CaseDetailViewProps {
  caseId: string;
  onBack: () => void;
  onSelectTab: (tab: NavTab) => void;
  onTriggerAICopilotWithCase: (task: 'summarize' | 'draft' | 'limitation-check', caseObj: any) => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseId,
  onBack,
  onSelectTab,
  onTriggerAICopilotWithCase,
}) => {
  const { getCaseById, updateCase, addHearing, addDocument, addTask, deleteDocument, updateTaskStatus } = useData();
  const { user } = useAuth();
  
  const currentCase = getCaseById(caseId);

  const [activeTab, setActiveTab] = useState<'overview' | 'hearings' | 'documents' | 'tasks' | 'client'>('overview');

  // Modals / Input states
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [caseNotes, setCaseNotes] = useState(currentCase?.notes || '');
  
  // New Hearing State
  const [isAddingHearing, setIsAddingHearing] = useState(false);
  const [newHearingDate, setNewHearingDate] = useState('');
  const [newHearingPurpose, setNewHearingPurpose] = useState('Arguments on Application');
  const [newHearingRoom, setNewHearingRoom] = useState(currentCase?.judge_bench || 'Court 24');

  // New Document State
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('Plaint');
  const [newDocUrl, setNewDocUrl] = useState('https://storage.supabase.co/legal-documents/case-filing.pdf');
  const [newDocSnippet, setNewDocSnippet] = useState('');

  // New Task State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  if (!currentCase) {
    return (
      <div className="text-center py-20 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Case Docket Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">The requested case record may have been archived or removed.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-medium hover:bg-slate-700 cursor-pointer"
        >
          ← Back to Cases List
        </button>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    await updateCase(currentCase.id, { notes: caseNotes });
    setIsEditingNotes(false);
  };

  const handleCreateHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHearingDate || !newHearingPurpose) return;

    await addHearing({
      case_id: currentCase.id,
      hearing_date: new Date(newHearingDate).toISOString(),
      court_room: newHearingRoom,
      purpose: newHearingPurpose,
    });

    setIsAddingHearing(false);
    setNewHearingDate('');
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    await addDocument({
      case_id: currentCase.id,
      file_name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      file_url: newDocUrl,
      file_size: '1.8 MB',
      document_type: newDocType,
      content_snippet: newDocSnippet,
    });

    setIsAddingDoc(false);
    setNewDocName('');
    setNewDocSnippet('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    await addTask({
      case_id: currentCase.id,
      assigned_to: user?.id,
      assigned_to_name: user?.full_name || 'Counsel',
      title: newTaskTitle,
      due_date: newTaskDue ? new Date(newTaskDue).toISOString() : undefined,
      status: 'pending',
      priority: newTaskPriority,
    });

    setIsAddingTask(false);
    setNewTaskTitle('');
    setNewTaskDue('');
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    await updateCase(currentCase.id, { status: newStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Dockets</span>
        </button>

        {/* AI Action Quick Triggers for this Case */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => onTriggerAICopilotWithCase('summarize', currentCase)}
            className="bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Hearing Brief</span>
          </button>
          
          <button
            onClick={() => onTriggerAICopilotWithCase('draft', currentCase)}
            className="bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Draft for this Case</span>
          </button>

          <button
            onClick={() => onTriggerAICopilotWithCase('limitation-check', currentCase)}
            className="bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Check Limitation</span>
          </button>
        </div>
      </div>

      {/* Case Main Header Card */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                {currentCase.case_number}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentCase.case_type}
              </span>
              {currentCase.filing_date && (
                <span className="text-xs text-slate-500">
                  • Filed: {new Date(currentCase.filing_date).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {currentCase.case_title}
            </h1>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={currentCase.status}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                currentCase.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : currentCase.status === 'disposed'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <option value="active">ACTIVE</option>
              <option value="disposed">DISPOSED / DECIDED</option>
              <option value="on-hold">ON-HOLD / STAYED</option>
            </select>
          </div>
        </div>

        {/* Case Metadata Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/50 text-xs">
          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Court Forum</span>
            <span className="text-slate-200 font-medium truncate block mt-0.5">{currentCase.court_name}</span>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Judge / Bench</span>
            <span className="text-slate-200 font-medium truncate block mt-0.5">{currentCase.judge_bench || 'Bench Courtroom'}</span>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Opposing Party</span>
            <span className="text-slate-200 font-medium truncate block mt-0.5">
              {currentCase.opposing_party || 'Opposing Party'} 
              {currentCase.opposing_counsel ? ` (Adv. ${currentCase.opposing_counsel})` : ''}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Lead Advocate</span>
            <span className="text-indigo-300 font-semibold truncate block mt-0.5">
              {currentCase.assigned_lawyer_name || user?.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700/50 space-x-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Case Brief & Notes', icon: FileText },
          { id: 'hearings', label: `Hearing History (${currentCase.hearings?.length || 0})`, icon: Calendar },
          { id: 'documents', label: `Document Vault (${currentCase.documents?.length || 0})`, icon: FolderArchive },
          { id: 'tasks', label: `Action Items (${currentCase.tasks?.length || 0})`, icon: CheckSquare },
          { id: 'client', label: 'Client & Billing', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & RUNNING NOTES */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Running Chamber Brief & Case Notes
                </h3>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-indigo-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Brief
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs cursor-pointer shadow-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {isEditingNotes ? (
                  <textarea
                    rows={8}
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                  />
                ) : (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {currentCase.notes || 'No case brief recorded yet. Click Edit Brief to write facts and strategies.'}
                  </div>
                )}
              </div>
            </div>

            {/* Next Hearing Alert Card */}
            {currentCase.next_hearing_date && (
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/30">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300">Next Court Listing</span>
                    <p className="text-sm font-bold text-white">
                      {new Date(currentCase.next_hearing_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hearings')}
                  className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-200 font-medium rounded-xl cursor-pointer"
                >
                  View Hearing Docket →
                </button>
              </div>
            )}
          </div>

          {/* Right Col: Quick Client Snippet & AI Summary */}
          <div className="space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Linked Client Profile</h3>
              {currentCase.client ? (
                <div className="space-y-2 text-xs">
                  <p className="text-sm font-bold text-white">{currentCase.client.name}</p>
                  {currentCase.client.company_name && (
                    <p className="text-slate-400">{currentCase.client.company_name}</p>
                  )}
                  {currentCase.client.phone && (
                    <p className="text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {currentCase.client.phone}
                    </p>
                  )}
                  {currentCase.client.email && (
                    <p className="text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {currentCase.client.email}
                    </p>
                  )}
                  {currentCase.client.address && (
                    <p className="text-slate-400 pt-2 border-t border-slate-700/50 text-[11px]">
                      {currentCase.client.address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No client details linked.</p>
              )}
            </div>

            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Quick Copilot Research</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Run AI analysis on this case's facts to generate hearing talking points or check BNS sections.
              </p>
              <button
                onClick={() => onTriggerAICopilotWithCase('summarize', currentCase)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                Synthesize Pre-Hearing Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEARINGS HISTORY */}
      {activeTab === 'hearings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Court Hearings & Order History</h3>
            <button
              onClick={() => setIsAddingHearing(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Next Hearing</span>
            </button>
          </div>

          {isAddingHearing && (
            <form onSubmit={handleCreateHearing} className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Hearing Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newHearingDate}
                    onChange={(e) => setNewHearingDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Purpose of Listing *</label>
                  <input
                    type="text"
                    required
                    value={newHearingPurpose}
                    onChange={(e) => setNewHearingPurpose(e.target.value)}
                    placeholder="e.g. Final Arguments / Evidence / Bail"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Courtroom / Bench</label>
                  <input
                    type="text"
                    value={newHearingRoom}
                    onChange={(e) => setNewHearingRoom(e.target.value)}
                    placeholder="Court 24, Saket Court"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingHearing(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Confirm Listing
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {(!currentCase.hearings || currentCase.hearings.length === 0) ? (
              <div className="text-center py-10 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No hearing history recorded for this matter yet.</p>
              </div>
            ) : (
              currentCase.hearings.map((h, idx) => {
                const hDate = new Date(h.hearing_date);
                const isPast = hDate.getTime() < Date.now();

                return (
                  <div
                    key={h.id}
                    className="p-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`p-2.5 rounded-xl text-center shrink-0 border min-w-[60px] ${
                        isPast ? 'bg-slate-900/60 border-slate-700/50 text-slate-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      }`}>
                        <div className="text-[10px] font-bold uppercase">{hDate.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                        <div className="text-base font-extrabold">{hDate.getDate()}</div>
                        <div className="text-[9px] uppercase">{hDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-white">{h.purpose}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                            isPast ? 'bg-slate-800 text-slate-400 border border-slate-700/50' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {isPast ? 'CONCLUDED' : 'UPCOMING'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {h.court_room || 'Courtroom Bench'}
                        </p>
                        {h.outcome_notes && (
                          <div className="mt-1 text-xs text-emerald-400/90 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/60 inline-block">
                            Bench Direction / Outcome: {h.outcome_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Case Document Vault (Supabase Storage)</h3>
              <p className="text-xs text-slate-400">Plaints, Written Statements, Affidavits, Vakalatnamas & Orders</p>
            </div>
            <button
              onClick={() => setIsAddingDoc(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {isAddingDoc && (
            <form onSubmit={handleCreateDocument} className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Document File Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Rejoinder_Affidavit_Final.pdf"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tag / Category *</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Plaint">Plaint / Petition</option>
                    <option value="Written Statement">Written Statement / Reply</option>
                    <option value="Affidavit">Affidavit / Verification</option>
                    <option value="Vakalatnama">Vakalatnama</option>
                    <option value="Evidence">Evidence / Annexures</option>
                    <option value="Order Copy">Order Copy / Interim Order</option>
                    <option value="Judgment">Judgment / Final Decree</option>
                    <option value="Notice">Legal Notice</option>
                    <option value="Bail Application">Bail Application</option>
                    <option value="Other">Other Pleading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Summary / Snippet</label>
                  <input
                    type="text"
                    value={newDocSnippet}
                    onChange={(e) => setNewDocSnippet(e.target.value)}
                    placeholder="Key prayers or orders..."
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Upload & Secure in Vault
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(!currentCase.documents || currentCase.documents.length === 0) ? (
              <div className="col-span-2 text-center py-10 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50">
                <FolderArchive className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No documents uploaded to this case vault yet.</p>
              </div>
            ) : (
              currentCase.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex items-start justify-between gap-3 group hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/80 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-700/50">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
                        {doc.document_type}
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-1">{doc.file_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.file_size || '1.2 MB'} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                      </p>
                      {doc.content_snippet && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic">
                          "{doc.content_snippet}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Open / Download"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Action Items & Deadlines for this Matter</h3>
            <button
              onClick={() => setIsAddingTask(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action Item</span>
            </button>
          </div>

          {isAddingTask && (
            <form onSubmit={handleCreateTask} className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Serve advance copy of bail application to APP"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Assign Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {(!currentCase.tasks || currentCase.tasks.length === 0) ? (
              <div className="text-center py-10 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50">
                <CheckSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No action items pending for this case.</p>
              </div>
            ) : (
              currentCase.tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => updateTaskStatus(t.id, t.status === 'completed' ? 'pending' : 'completed')}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        t.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${t.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'} truncate`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString('en-IN')}` : 'No deadline'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase shrink-0 ${
                    t.priority === 'urgent' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {t.priority || 'medium'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CLIENT & BILLING */}
      {activeTab === 'client' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Client Particulars</h3>
            {currentCase.client ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Name</span>
                  <p className="text-sm font-bold text-white">{currentCase.client.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Company / Entity</span>
                  <p className="text-slate-200">{currentCase.client.company_name || 'Individual'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Contact</span>
                  <p className="text-slate-200">{currentCase.client.phone || 'N/A'}</p>
                  <p className="text-slate-200">{currentCase.client.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Office / Residence Address</span>
                  <p className="text-slate-300">{currentCase.client.address || 'Address not listed'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No client data attached.</p>
            )}
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Case Invoices & Professional Fees</h3>
              <button
                onClick={() => onSelectTab('billing')}
                className="text-xs text-indigo-300 hover:underline cursor-pointer font-medium"
              >
                Go to Invoicing →
              </button>
            </div>
            
            <div className="space-y-2">
              {(!currentCase.invoices || currentCase.invoices.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">No invoices issued for this case yet.</p>
              ) : (
                currentCase.invoices.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{inv.invoice_number}</p>
                      <p className="text-[11px] text-slate-400">Date: {inv.issue_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">₹ {Number(inv.amount).toLocaleString('en-IN')}</p>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700/50">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
