import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Gavel, 
  Building, 
  Clock, 
  AlertTriangle, 
  Printer, 
  CheckCircle2, 
  ExternalLink,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Hearing } from '../../types';

interface CalendarViewProps {
  onSelectCase: (caseId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectCase }) => {
  const { hearings, cases, urgentHearings3Days, addHearing, updateHearing } = useData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'cause-list'>('month');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState('all');

  // New Hearing Modal State
  const [isAddingHearing, setIsAddingHearing] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [newHearingDate, setNewHearingDate] = useState('');
  const [newHearingPurpose, setNewHearingPurpose] = useState('Final Arguments');
  const [newHearingRoom, setNewHearingRoom] = useState('Courtroom 24');

  // Outcome log state
  const [selectedHearingForOutcome, setSelectedHearingForOutcome] = useState<Hearing | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredHearings = hearings.filter(h => {
    if (selectedCourtFilter === 'all') return true;
    return h.court_name === selectedCourtFilter;
  });

  const uniqueCourts = Array.from(new Set(hearings.map(h => h.court_name).filter(Boolean)));

  const handleCreateHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newHearingDate) return;

    await addHearing({
      case_id: selectedCaseId,
      hearing_date: new Date(newHearingDate).toISOString(),
      court_room: newHearingRoom,
      purpose: newHearingPurpose,
    });

    setIsAddingHearing(false);
    setNewHearingDate('');
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHearingForOutcome) return;
    await updateHearing(selectedHearingForOutcome.id, { outcome_notes: outcomeText });
    setSelectedHearingForOutcome(null);
    setOutcomeText('');
  };

  const handlePrintCauseList = () => {
    window.print();
  };

  // Group hearings by date for cause list
  const sortedHearings = [...filteredHearings].sort(
    (a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Court Hearing Calendar & Cause List</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              {hearings.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track daily court listings, courtroom benches, hearing outcomes, and advance cause lists
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Print Cause List button */}
          <button
            onClick={handlePrintCauseList}
            className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border border-slate-700/50 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Cause List</span>
          </button>

          {/* New Hearing Button */}
          <button
            onClick={() => setIsAddingHearing(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center space-x-2 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Court Hearing</span>
          </button>
        </div>
      </div>

      {/* Urgency Notification Banner if hearings in 3 days */}
      {urgentHearings3Days.length > 0 && (
        <div className="p-4 bg-rose-500/10 backdrop-blur-md border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-300">
                {urgentHearings3Days.length} Urgent Court {urgentHearings3Days.length === 1 ? 'Hearing' : 'Hearings'} Scheduled in Next 3 Days
              </p>
              <p className="text-[11px] text-slate-400">
                Ensure case files, vakalatnamas, and brief points are ready for the Hon'ble Bench.
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewMode('cause-list')}
            className="px-3.5 py-2 bg-rose-500 text-white font-medium rounded-xl text-xs hover:bg-rose-400 transition-colors cursor-pointer self-end sm:self-center"
          >
            Review Urgent List
          </button>
        </div>
      )}

      {/* View Switcher & Month Controls */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              viewMode === 'month'
                ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-700/50'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            onClick={() => setViewMode('cause-list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
              viewMode === 'cause-list'
                ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-700/50'
            }`}
          >
            Daily Cause List (Docket View)
          </button>
        </div>

        {/* Month Navigation */}
        {viewMode === 'month' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-white min-w-[140px] text-center">
              {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline px-2 py-1 cursor-pointer"
            >
              Today
            </button>
          </div>
        )}

        {/* Court Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Court:</span>
          <select
            value={selectedCourtFilter}
            onChange={(e) => setSelectedCourtFilter(e.target.value)}
            className="bg-slate-900/60 border border-slate-700/50 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Court Benches</option>
            {uniqueCourts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-700/50">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="min-h-[90px] bg-slate-900/20 rounded-xl p-1.5 opacity-40" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

              // Find hearings for this day
              const dayHearings = filteredHearings.filter(h => {
                const hDate = new Date(h.hearing_date);
                return hDate.getFullYear() === year && hDate.getMonth() === month && hDate.getDate() === dayNum;
              });

              return (
                <div
                  key={dateStr}
                  className={`min-h-[100px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                    isToday
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-inner'
                      : dayHearings.length > 0
                      ? 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
                      : 'bg-slate-900/30 border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-md' : 'text-slate-400'}`}>
                      {dayNum}
                    </span>
                    {dayHearings.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {dayHearings.length}
                      </span>
                    )}
                  </div>

                  {/* Hearing items */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayHearings.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => onSelectCase(h.case_id)}
                        className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-750 border border-slate-700/50 hover:border-indigo-500/40 text-[10px] cursor-pointer transition-all truncate group"
                        title={`${h.case_title} (${h.court_room}): ${h.purpose}`}
                      >
                        <p className="font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                          {h.case_title}
                        </p>
                        <p className="text-[9px] text-indigo-300/90 truncate">
                          {h.court_room} • {h.purpose}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY CAUSE LIST VIEW (Printable & Linear) */}
      {viewMode === 'cause-list' && (
        <div className="space-y-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
            <div>
              <h2 className="text-base font-bold text-white">Daily Cause List & Hearing Roster</h2>
              <p className="text-xs text-slate-400">Chronological schedule of listed matters across courts</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 font-mono">
              Chambers Cause List
            </span>
          </div>

          <div className="space-y-3">
            {sortedHearings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hearings listed in this period or forum.
              </div>
            ) : (
              sortedHearings.map((h) => {
                const hDate = new Date(h.hearing_date);
                const isPast = hDate.getTime() < Date.now();
                const isToday = hDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isToday
                        ? 'bg-rose-950/30 border-rose-700/60 shadow-md backdrop-blur-sm'
                        : isPast
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-80 backdrop-blur-sm'
                        : 'bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      {/* Date box */}
                      <div className={`p-2.5 rounded-xl border text-center shrink-0 min-w-[70px] ${
                        isToday
                          ? 'bg-rose-900/40 border-rose-700/60 text-rose-200'
                          : 'bg-slate-850 border-slate-700/50 text-slate-300'
                      }`}>
                        <div className="text-[10px] font-bold uppercase">{hDate.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                        <div className="text-lg font-extrabold leading-none my-0.5">{hDate.getDate()}</div>
                        <div className="text-[9px] uppercase text-slate-400">{hDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span 
                            onClick={() => onSelectCase(h.case_id)}
                            className="text-xs md:text-sm font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                          >
                            {h.case_title}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                              LISTED TODAY
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              CONCLUDED
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-indigo-300 font-medium mt-0.5">
                          📌 Purpose: {h.purpose}
                        </p>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-500" />
                            {h.court_room || 'Courtroom'}
                          </span>
                          <span>•</span>
                          <span>{h.court_name}</span>
                        </div>

                        {h.outcome_notes && (
                          <p className="text-xs text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 mt-1.5 inline-block">
                            Outcome / Order: {h.outcome_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setSelectedHearingForOutcome(h);
                          setOutcomeText(h.outcome_notes || '');
                        }}
                        className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        {h.outcome_notes ? 'Edit Outcome' : 'Log Outcome'}
                      </button>
                      <button
                        onClick={() => onSelectCase(h.case_id)}
                        className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                        title="Open Case File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE HEARING MODAL */}
      {isAddingHearing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-base font-bold text-white">Schedule Court Hearing Listing</h3>
              <button onClick={() => setIsAddingHearing(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHearing} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Case Matter *</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_title} ({c.case_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hearing Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newHearingDate}
                    onChange={(e) => setNewHearingDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Courtroom / Bench</label>
                  <input
                    type="text"
                    value={newHearingRoom}
                    onChange={(e) => setNewHearingRoom(e.target.value)}
                    placeholder="Court 24, Hon'ble Justice..."
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Listing *</label>
                <input
                  type="text"
                  required
                  value={newHearingPurpose}
                  onChange={(e) => setNewHearingPurpose(e.target.value)}
                  placeholder="e.g. Final Arguments / Bail Hearing / Evidence"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsAddingHearing(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Add to Court Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG OUTCOME MODAL */}
      {selectedHearingForOutcome && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-base font-bold text-white">Log Hearing Outcome / Order</h3>
              <button onClick={() => setSelectedHearingForOutcome(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="mt-4 space-y-3">
              <p className="text-xs text-slate-400">
                {selectedHearingForOutcome.case_title} ({selectedHearingForOutcome.court_room})
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Court Orders / Bench Directions / Next Listing Date
                </label>
                <textarea
                  rows={4}
                  required
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  placeholder="e.g. Interim relief continued. Counter affidavit filed. Fixed for final hearing on 18.09.2024."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setSelectedHearingForOutcome(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
