import React, { useState } from 'react';
import { X, Scale, Building2, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CaseStatus, CourtCategory } from '../../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  onCaseCreated?: (caseId: string) => void;
}

const COMMON_COURTS: CourtCategory[] = [
  'Supreme Court of India',
  'High Court',
  'District & Sessions Court',
  'Chief Judicial Magistrate (CJM)',
  'Metropolitan Magistrate (MM)',
  'Civil Judge Senior Division',
  'National Company Law Tribunal (NCLT)',
  'National Green Tribunal (NGT)',
  'Debt Recovery Tribunal (DRT)',
  'Consumer Disputes Redressal Commission',
  'Arbitration Tribunal',
  'Other Forum',
];

const COMMON_CASE_TYPES = [
  'Writ Petition (Civil) - Article 226',
  'Special Leave Petition (Civil/Crl) - Art 136',
  'Civil Suit for Permanent Injunction (CPC Order 39)',
  'Commercial Suit (Commercial Courts Act 2015)',
  'Anticipatory Bail Application (Sec 482 BNSS / Sec 438 CrPC)',
  'Regular Bail Application (Sec 483 BNSS / Sec 439 CrPC)',
  'Criminal Revision / Criminal Appeal',
  'Section 138 Negotiable Instruments Act (Cheque Bounce)',
  'Arbitration Petition under Section 9 / 11 / 34',
  'Insolvency & Bankruptcy Petition (IBC Sec 7 / 9)',
  'Partition & Rendition of Accounts Suit',
  'Matrimonial / Divorce Petition (HMA 1955)',
  'Consumer Protection Complaint (CPA 2019)',
];

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  onCaseCreated,
}) => {
  const { clients, addCase, addClient } = useData();
  const { user, firm } = useAuth();

  const [clientId, setClientId] = useState(preselectedClientId || (clients[0]?.id || ''));
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Form Fields
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [courtName, setCourtName] = useState('Delhi High Court (Original Side)');
  const [caseType, setCaseType] = useState(COMMON_CASE_TYPES[0]);
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<CaseStatus>('active');
  const [opposingParty, setOpposingParty] = useState('');
  const [opposingCounsel, setOpposingCounsel] = useState('');
  const [judgeBench, setJudgeBench] = useState('Courtroom No. 24');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [assignedLawyerId, setAssignedLawyerId] = useState(user?.id || 'user-001');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle || !caseNumber || !courtName) return;

    setIsSubmitting(true);

    let effectiveClientId = clientId;

    // If inline new client is being created
    if (isCreatingNewClient && newClientName) {
      const createdCl = await addClient({
        name: newClientName,
        phone: newClientPhone,
        firm_id: firm?.id || 'firm-delhi-001',
      });
      effectiveClientId = createdCl.id;
    }

    const created = await addCase({
      firm_id: firm?.id || 'firm-delhi-001',
      client_id: effectiveClientId,
      case_title: caseTitle,
      case_number: caseNumber,
      court_name: courtName,
      case_type: caseType,
      filing_date: filingDate,
      status,
      opposing_party: opposingParty,
      opposing_counsel: opposingCounsel,
      judge_bench: judgeBench,
      next_hearing_date: nextHearingDate ? new Date(nextHearingDate).toISOString() : undefined,
      assigned_lawyer_id: assignedLawyerId,
      assigned_lawyer_name: user?.full_name || 'Adv. Rajesh Verma',
      notes,
    });

    setIsSubmitting(false);
    onClose();
    if (onCaseCreated) onCaseCreated(created.id);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Institute New Court Case / Docket</h2>
              <p className="text-xs text-slate-400">Register CNR number, court bench, and hearing schedules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Case Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Case Title / Cause Title *
            </label>
            <input
              type="text"
              required
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="e.g. Ananya Buildcon Pvt. Ltd. v. Delhi Development Authority (DDA)"
              className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Client Selection */}
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Linked Client *
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewClient(!isCreatingNewClient)}
                className="text-[11px] text-indigo-300 hover:underline cursor-pointer font-medium"
              >
                {isCreatingNewClient ? '← Select existing client' : '+ Quick create new client'}
              </button>
            </div>

            {isCreatingNewClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client Full Name / Company"
                  className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Phone: +91 98110..."
                  className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name} {cl.company_name ? `(${cl.company_name})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Case Number & Court Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case / CNR Number *
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. W.P.(C) 4892/2024 (CNR: DLDL010048922024)"
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Court Forum / Bench *
              </label>
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Delhi High Court, Saket Sessions Court, Supreme Court"
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Case Type & Filing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case Category / Type *
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {COMMON_CASE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Filing Date
              </label>
              <input
                type="date"
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Opposing Party & Counsel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Opposing Party (Respondent / Defendant)
              </label>
              <input
                type="text"
                value={opposingParty}
                onChange={(e) => setOpposingParty(e.target.value)}
                placeholder="e.g. State of NCT of Delhi / M/s ABC Corp"
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Opposing Counsel (if known)
              </label>
              <input
                type="text"
                value={opposingCounsel}
                onChange={(e) => setOpposingCounsel(e.target.value)}
                placeholder="e.g. Adv. Manjit Singh / Standing Counsel"
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Next Hearing Date & Judge Bench */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Next Court Hearing Date & Time
              </label>
              <input
                type="datetime-local"
                value={nextHearingDate}
                onChange={(e) => setNextHearingDate(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Courtroom / Judge Bench
              </label>
              <input
                type="text"
                value={judgeBench}
                onChange={(e) => setJudgeBench(e.target.value)}
                placeholder="e.g. Court 38, Hon'ble Ms. Justice Rekha Palli"
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Case Brief / Running Chamber Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief facts of dispute, interim relief granted, key statutory sections..."
              className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs md:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Instituting Case...' : 'Institute Case & Docket'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
