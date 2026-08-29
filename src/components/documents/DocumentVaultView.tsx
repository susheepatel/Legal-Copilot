import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Upload, 
  FileText, 
  Tag, 
  ExternalLink, 
  Trash2, 
  Filter, 
  Building2, 
  Plus, 
  CheckCircle2, 
  FileCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CaseDocument, DocumentType } from '../../types';

const DOCUMENT_CATEGORIES: DocumentType[] = [
  'Plaint',
  'Written Statement',
  'Affidavit',
  'Vakalatnama',
  'Evidence',
  'Order Copy',
  'Judgment',
  'Notice',
  'Bail Application',
  'Other',
];

interface DocumentVaultViewProps {
  onSelectCase: (caseId: string) => void;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({ onSelectCase }) => {
  const { documents, cases, addDocument, deleteDocument } = useData();
  const { isSupabaseConnected } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('all');

  // Upload modal
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('Plaint');
  const [docSnippet, setDocSnippet] = useState('');
  const [fakeFileName, setFakeFileName] = useState('');

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content_snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.case_title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || d.document_type === selectedType;
    const matchesCase = selectedCaseFilter === 'all' || d.case_id === selectedCaseFilter;

    return matchesSearch && matchesType && matchesCase;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !selectedCaseId) return;

    await addDocument({
      case_id: selectedCaseId,
      file_name: docName.endsWith('.pdf') || docName.endsWith('.docx') ? docName : `${docName}.pdf`,
      file_url: 'https://storage.supabase.co/legal-vault/chambers-upload.pdf',
      file_size: '2.4 MB',
      document_type: docType,
      content_snippet: docSnippet,
    });

    setIsUploading(false);
    setDocName('');
    setDocSnippet('');
    setFakeFileName('');
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFakeFileName(file.name);
      if (!docName) {
        setDocName(file.name);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Storage Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Legal Document Vault</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              {documents.length} Files
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            Centralized Supabase Storage Bucket • RLS Restricted to Firm Advocates
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>+ Upload Legal Document</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document title, snippet..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Document Tags (Plaints, Orders, WS)</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Case Filter */}
          <div>
            <select
              value={selectedCaseFilter}
              onChange={(e) => setSelectedCaseFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Case Dockets</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_title} ({c.case_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-700/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 pr-1">Pleadings:</span>
          {['all', 'Plaint', 'Written Statement', 'Order Copy', 'Affidavit', 'Vakalatnama', 'Bail Application'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedType(tag)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                selectedType === tag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              {tag === 'all' ? 'All Tags' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8">
          <FolderArchive className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Documents Match Filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Upload petitions, interim orders, affidavits, or vakalatnamas directly to your chamber vault.
          </p>
          <button
            onClick={() => setIsUploading(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-800/40 hover:bg-slate-800/70 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 rounded-2xl transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    doc.document_type === 'Order Copy' || doc.document_type === 'Judgment'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : doc.document_type === 'Plaint' || doc.document_type === 'Bail Application'
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-750 text-slate-300 border border-slate-700/60'
                  }`}>
                    {doc.document_type}
                  </span>
                  <span className="text-[10px] text-slate-400">{doc.file_size || '1.5 MB'}</span>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {doc.file_name}
                    </h3>
                    <p 
                      onClick={() => onSelectCase(doc.case_id)}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 cursor-pointer truncate mt-0.5 font-medium"
                    >
                      {doc.case_title || 'Case Matter'}
                    </p>
                  </div>
                </div>

                {doc.content_snippet && (
                  <p className="mt-3 text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/40 line-clamp-2 italic leading-relaxed">
                    "{doc.content_snippet}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">
                  Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                </span>

                <div className="flex items-center space-x-1.5">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800/60 rounded-xl transition-colors"
                    title="View / Download from Supabase"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-base font-bold text-white">Upload Pleading or Court Order</h3>
              <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              {/* Drag & drop container */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">
                  {fakeFileName ? fakeFileName : 'Drag & drop court PDF/DOCX or click to browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOCX up to 50MB per file</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Interim_Order_24May2024.pdf"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Category *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Prayer / Order Snippet</label>
                <textarea
                  rows={2}
                  value={docSnippet}
                  onChange={(e) => setDocSnippet(e.target.value)}
                  placeholder="Key paragraphs or findings for quick reference..."
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
