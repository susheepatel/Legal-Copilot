import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  Scale, 
  DollarSign, 
  X,
  CreditCard,
  User
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types';

interface BillingViewProps {
  onSelectCase: (caseId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onSelectCase }) => {
  const { invoices, cases, clients, addInvoice, updateInvoiceStatus, totalOutstandingDues } = useData();
  const { firm, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // New Invoice Modal
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [applyGst, setApplyGst] = useState(true);
  const [clerkagePct, setClerkagePct] = useState(10); // Indian legal convention of 10% clerkage
  const [sacCode, setSacCode] = useState('998211');

  // Itemized breakdown
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Drafting of Writ Petition & Supporting Affidavits', amount: 35000 },
    { description: 'Effective Court Appearance before Hon’ble Bench', amount: 25000 },
    { description: 'Conference & Senior Counsel Briefing', amount: 15000 },
  ]);

  const handleAddItemRow = () => {
    setItems([...items, { description: '', amount: 5000 }]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const clerkageAmount = (subtotal * clerkagePct) / 100;
  const taxableBase = subtotal + clerkageAmount;
  const gstAmount = applyGst ? (taxableBase * 18) / 100 : 0;
  const totalInvoiceAmount = taxableBase + gstAmount;

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invNum = `INV-LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await addInvoice({
      case_id: selectedCaseId,
      client_id: selectedClientId,
      invoice_number: invNum,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      status: 'pending',
      amount: totalInvoiceAmount,
      tax_amount: gstAmount,
      currency: 'INR',
      notes: `SAC Code: ${sacCode} (Legal consultancy and court representation services). Subtotal ₹${subtotal} + 10% Clerkage ₹${clerkageAmount} + 18% GST ₹${gstAmount}.`,
      items,
    });

    setIsCreatingInvoice(false);
    setSelectedInvoiceForPrint(created);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.case_title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Financial Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Billing, Professional Fees & Invoices</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              SAC 998211
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal Fee Memos, itemized drafting & court appearance bills, GST invoices, and track retainers
          </p>
        </div>

        <button
          onClick={() => setIsCreatingInvoice(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generate Fee Memo / Invoice</span>
        </button>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Total Outstanding Dues</span>
          <div className="text-2xl font-bold text-indigo-300 mt-1">
            ₹ {totalOutstandingDues.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending fee recovery from clients</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">Paid Fee Memos</span>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            {invoices.filter(i => i.status === 'paid').length} Invoices
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Reconciled in firm accounts</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-semibold">GST & Service Accounting Code</span>
          <div className="text-sm font-bold text-slate-200 mt-1.5 flex items-center gap-1.5">
            <span>SAC: 998211</span>
            <span className="text-xs text-slate-400 font-normal">(18% GST / RCM)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Bar Council of India compliance</p>
        </div>
      </div>

      {/* Invoices List Toolbar */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, client, case..."
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Invoices (Pending, Paid, Overdue)</option>
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid / Settled</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Receipt className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Invoices Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              Issue professional fee memos to clients for court drafting, conference, and appearance fees.
            </p>
            <button
              onClick={() => setIsCreatingInvoice(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Fee Memo</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-700/50 text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Invoice # & Date</th>
                  <th className="p-4">Client & Matter</th>
                  <th className="p-4">Total Amount (INR)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-750/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">{inv.invoice_number}</div>
                      <div className="text-[11px] text-slate-400">Issued: {inv.issue_date}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{inv.client_name || 'Client'}</div>
                      <div 
                        onClick={() => onSelectCase(inv.case_id)}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 cursor-pointer truncate max-w-xs"
                      >
                        {inv.case_title || 'Case Matter'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">
                        ₹ {Number(inv.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {inv.tax_amount ? `Incl. ₹${Number(inv.tax_amount).toLocaleString('en-IN')} GST` : 'Zero GST / RCM'}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={inv.status}
                        onChange={(e) => updateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase focus:outline-none cursor-pointer ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : inv.status === 'overdue'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="overdue">OVERDUE</option>
                        <option value="draft">DRAFT</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 rounded-xl text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreatingInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div>
                <h3 className="text-base font-bold text-white">Generate Professional Fee Memo</h3>
                <p className="text-xs text-slate-400">Itemized billing for court appearances, drafting & conferences</p>
              </div>
              <button onClick={() => setIsCreatingInvoice(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Client *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {clients.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name} {cl.company_name ? `(${cl.company_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              {/* Itemized Fee Structure */}
              <div className="space-y-2 p-3.5 bg-slate-950/40 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-700/50">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Itemized Fee Particulars</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Particular
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Drafting of Special Leave Petition / Court Appearance"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">₹</span>
                      <input
                        type="number"
                        required
                        value={item.amount}
                        onChange={(e) => handleUpdateItem(idx, 'amount', Number(e.target.value))}
                        className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg pl-6 pr-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Taxes & Clerkage settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-700/50">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyGst}
                      onChange={(e) => setApplyGst(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-300">Apply 18% GST</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">SAC Code 998211</p>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-700/50">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Clerkage %</label>
                  <input
                    type="number"
                    value={clerkagePct}
                    onChange={(e) => setClerkagePct(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Standard: 10%</p>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-700/50">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation summary */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-700/50 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹ {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Clerkage ({clerkagePct}%):</span>
                  <span>₹ {clerkageAmount.toLocaleString('en-IN')}</span>
                </div>
                {applyGst && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% on Taxable Base):</span>
                    <span>₹ {gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700/50">
                  <span>Total Payable:</span>
                  <span className="text-indigo-300 text-base">₹ {totalInvoiceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsCreatingInvoice(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Generate & Save Fee Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE LEGAL INVOICE / BILL OF COSTS MODAL */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8 font-serif">
            {/* Header / Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950 uppercase">{firm?.name || 'VERMA & ASSOCIATES'}</h2>
                <p className="text-xs text-slate-600 font-sans mt-0.5">Advocates & Legal Consultants • Supreme Court & High Court of Delhi</p>
                <p className="text-[11px] text-slate-500 font-sans">Chambers: {firm?.address || 'Chamber No. 418, Lawyers Chambers Block, Delhi High Court'}</p>
                <p className="text-[11px] text-slate-500 font-sans">Phone: {firm?.phone || '+91 98110 44552'} • Email: {firm?.email || 'chambers@vermaassociates.in'}</p>
              </div>

              <div className="text-right font-sans">
                <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded uppercase tracking-wider text-slate-800">
                  MEMO OF PROFESSIONAL FEES
                </div>
                <p className="text-xs text-slate-700 mt-2 font-bold font-mono">{selectedInvoiceForPrint.invoice_number}</p>
                <p className="text-[11px] text-slate-500">Date: {selectedInvoiceForPrint.issue_date}</p>
              </div>
            </div>

            {/* Bill To & Matter Particulars */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Billed To (Client):</span>
                <p className="font-bold text-slate-900">{selectedInvoiceForPrint.client_name || 'Client'}</p>
                <p className="text-slate-600">Client ID: {selectedInvoiceForPrint.client_id}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Matter Reference:</span>
                <p className="font-bold text-slate-900">{selectedInvoiceForPrint.case_title || 'Legal Dispute'}</p>
                <p className="text-slate-600">SAC Code: 998211 (Legal Services)</p>
              </div>
            </div>

            {/* Particulars Table */}
            <div className="py-4 font-sans">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2">Description / Professional Service</th>
                    <th className="py-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoiceForPrint.items || [
                    { description: 'Professional Appearance & Legal Pleadings', amount: selectedInvoiceForPrint.amount }
                  ]).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-slate-800">{it.description}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">₹ {Number(it.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="border-t-2 border-slate-900 pt-4 font-sans text-xs flex justify-between items-start">
              <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
                <p><strong>Bank RTGS/NEFT:</strong> HDFC Bank, Connaught Place</p>
                <p><strong>A/C Name:</strong> Verma & Associates Legal</p>
                <p><strong>IFSC:</strong> HDFC0000003 • <strong>A/C:</strong> 50200012345678</p>
              </div>

              <div className="text-right space-y-1 min-w-[180px]">
                <div className="text-base font-bold text-slate-950">
                  Total Payable: ₹ {Number(selectedInvoiceForPrint.amount).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">
                  Status: {selectedInvoiceForPrint.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end space-x-3 font-sans print:hidden">
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>Print Formal Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
