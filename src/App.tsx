import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CaseListView } from './components/cases/CaseListView';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { NewCaseModal } from './components/cases/NewCaseModal';
import { ClientsView } from './components/clients/ClientsView';
import { CalendarView } from './components/calendar/CalendarView';
import { DocumentVaultView } from './components/documents/DocumentVaultView';
import { TasksView } from './components/tasks/TasksView';
import { BillingView } from './components/billing/BillingView';
import { AICopilotView } from './components/ai/AICopilotView';
import { SettingsView } from './components/settings/SettingsView';
import { AICopilotTask, Case } from './types';
import { useData } from './context/DataContext';

export function App() {
  const { user, loading } = useAuth();
  const { getCaseById } = useData();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  // Modals
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [newCaseClientId, setNewCaseClientId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // AI Copilot deep link state
  const [aiInitialTask, setAiInitialTask] = useState<AICopilotTask>('general-research');
  const [aiInitialCase, setAiInitialCase] = useState<Case | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-slate-200 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 relative z-10" />
        <p className="text-sm font-semibold text-slate-300 relative z-10">Initializing Legal Practice Chambers...</p>
      </div>
    );
  }

  // If not logged in, show Auth / Landing Page
  if (!user) {
    return <AuthPage />;
  }

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
  };

  const handleOpenNewCaseWithClient = (clientId: string) => {
    setNewCaseClientId(clientId);
    setIsNewCaseOpen(true);
  };

  const handleTriggerAICopilotWithCase = (action: 'summarize' | 'draft' | 'limitation-check', caseObj: Case) => {
    let taskType: AICopilotTask = 'general-research';
    if (action === 'summarize') taskType = 'case-brief';
    if (action === 'draft') taskType = 'drafting';
    if (action === 'limitation-check') taskType = 'limitation-check';

    setAiInitialTask(taskType);
    setAiInitialCase(caseObj);
    setActiveTab('ai-copilot');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">
      {/* Ambient Frosted Glass Glow Background */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'cases') setSelectedCaseId(null);
        }}
        onOpenNewCase={() => {
          setNewCaseClientId(undefined);
          setIsNewCaseOpen(true);
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'cases') setSelectedCaseId(null);
          }}
          onOpenNewCase={() => {
            setNewCaseClientId(undefined);
            setIsNewCaseOpen(true);
          }}
          onSelectCase={handleSelectCase}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectTab={setActiveTab}
              onOpenNewCase={() => {
                setNewCaseClientId(undefined);
                setIsNewCaseOpen(true);
              }}
              onOpenNewClient={() => setActiveTab('clients')}
              onSelectCase={handleSelectCase}
            />
          )}

          {activeTab === 'cases' && (
            <>
              {selectedCaseId ? (
                <CaseDetailView
                  caseId={selectedCaseId}
                  onBack={() => setSelectedCaseId(null)}
                  onSelectTab={setActiveTab}
                  onTriggerAICopilotWithCase={handleTriggerAICopilotWithCase}
                />
              ) : (
                <CaseListView
                  onSelectCase={handleSelectCase}
                  onOpenNewCase={() => {
                    setNewCaseClientId(undefined);
                    setIsNewCaseOpen(true);
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onSelectCase={handleSelectCase}
              onOpenNewCaseWithClient={handleOpenNewCaseWithClient}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView onSelectCase={handleSelectCase} />
          )}

          {activeTab === 'documents' && (
            <DocumentVaultView onSelectCase={handleSelectCase} />
          )}

          {activeTab === 'tasks' && (
            <TasksView onSelectCase={handleSelectCase} />
          )}

          {activeTab === 'billing' && (
            <BillingView onSelectCase={handleSelectCase} />
          )}

          {activeTab === 'ai-copilot' && (
            <AICopilotView
              initialTask={aiInitialTask}
              initialCase={aiInitialCase}
              onSelectCase={handleSelectCase}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        preselectedClientId={newCaseClientId}
        onCaseCreated={(newId) => {
          setSelectedCaseId(newId);
          setActiveTab('cases');
        }}
      />
    </div>
  );
}
export default App;
