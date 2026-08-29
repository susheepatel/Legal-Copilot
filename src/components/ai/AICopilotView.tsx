import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  Scale, 
  ShieldAlert, 
  BookOpen, 
  Gavel, 
  Clock, 
  Building2, 
  ArrowRight,
  Download,
  AlertTriangle,
  Lightbulb,
  Zap,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AICopilotTask, Case } from '../../types';
import { invokeQwenLegalCopilot } from '../../lib/qwenClient';
import { executeCustomLegalAiModel } from '../../lib/customLegalAiModel';

interface AICopilotViewProps {
  initialTask?: AICopilotTask;
  initialCase?: Case | null;
  onSelectCase?: (caseId: string) => void;
}

type ModelMode = 'qwen-fast' | 'qwen-deep' | 'native-instant';

const SAMPLE_PROMPT_PRESETS: { task: AICopilotTask; title: string; prompt: string; icon: any }[] = [
  {
    task: 'bns-transition',
    title: 'BNS vs IPC Section Cross-Mapping',
    prompt: 'Compare Section 420 IPC (Cheating), Section 302 IPC (Murder), Section 376 IPC (Rape), and Section 406 IPC (Criminal Breach of Trust) with the new Bharatiya Nyaya Sanhita (BNS 2023). List the corresponding new section numbers, key statutory language differences, changes in punishments, and procedural impact under BNSS 2023.',
    icon: BookOpen,
  },
  {
    task: 'drafting',
    title: 'Draft Anticipatory Bail Application (Sec 482 BNSS)',
    prompt: 'Draft an Anticipatory Bail Application under Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) before the Hon’ble High Court of Delhi on behalf of an accused falsely implicated in an FIR under Sections 316 / 318 BNS 2023. Include grounds of non-custodial interrogation, cooperative conduct, parity, deep roots in society, and standard bail conditions.',
    icon: FileText,
  },
  {
    task: 'drafting',
    title: 'Draft Section 138 NI Act Statutory Legal Notice',
    prompt: 'Draft a formal Statutory Legal Notice under Section 138 of the Negotiable Instruments Act, 1881 for dishonour of cheque due to "Funds Insufficient". Demand payment of ₹15,00,000 within 15 days of receipt of notice, with warning of criminal prosecution under NI Act and BNS.',
    icon: Scale,
  },
  {
    task: 'limitation-check',
    title: 'Limitation Act 1963 Analysis & Section 5 Condonation',
    prompt: 'Analyze the statutory limitation period for filing a Commercial First Appeal against an order rejecting an application under Order VII Rule 11 CPC. What is the prescribed limitation under the Commercial Courts Act 2015 / Limitation Act 1963 Schedule, and what are the essential grounds required for condonation of delay under Section 5?',
    icon: Clock,
  },
  {
    task: 'case-brief',
    title: 'Hearing Brief & Arguable Points for the Bench',
    prompt: 'Prepare a crisp, 1-page Pre-Hearing Synopsis for the Hon’ble Bench in a civil dispute regarding an interim injunction application under CPC Order 39 Rules 1 & 2. Structure into: (1) Cause of Action & Date, (2) Prima Facie Case, (3) Irreparable Injury & Balance of Convenience, (4) Specific interim relief prayed.',
    icon: Gavel,
  },
];

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  initialTask = 'general-research',
  initialCase = null,
  onSelectCase,
}) => {
  const { cases } = useData();
  const { user } = useAuth();

  const [task, setTask] = useState<AICopilotTask>(initialTask);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCase?.id || '');
  const [promptInput, setPromptInput] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [modelMode, setModelMode] = useState<ModelMode>('qwen-fast');
  
  // State for AI Response
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [responseResult, setResponseResult] = useState<{
    content: string;
    disclaimer: string;
    model: string;
    latencyMs?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ query: string; answer: string; task: string; model: string }[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTask) setTask(initialTask);
    if (initialCase) {
      setSelectedCaseId(initialCase.id);
      setCustomContext(`Case: ${initialCase.case_title}\nCNR/Number: ${initialCase.case_number}\nCourt: ${initialCase.court_name}\nType: ${initialCase.case_type}\nOpposing: ${initialCase.opposing_party || 'N/A'}\nNotes: ${initialCase.notes || 'N/A'}`);
    }
  }, [initialTask, initialCase]);

  const handleSelectCaseChange = (cId: string) => {
    setSelectedCaseId(cId);
    if (!cId) {
      setCustomContext('');
      return;
    }
    const c = cases.find(item => item.id === cId);
    if (c) {
      setCustomContext(`Case Title: ${c.case_title}\nCase/CNR No: ${c.case_number}\nCourt: ${c.court_name}\nBench: ${c.judge_bench || 'Bench'}\nCategory: ${c.case_type}\nOpposing Party: ${c.opposing_party || 'N/A'}\nChamber Notes: ${c.notes || 'N/A'}`);
    }
  };

  const handleExecuteCopilot = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const effectivePrompt = customPrompt || promptInput;
    if (!effectivePrompt.trim()) return;

    setLoading(true);
    setIsStreaming(true);
    setStreamingText('');
    setResponseResult(null);

    // Scroll to results area immediately
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    const startTime = Date.now();

    try {
      // 1. Native Instant Mode (0.2ms)
      if (modelMode === 'native-instant') {
        const res = executeCustomLegalAiModel({
          task,
          prompt: effectivePrompt,
          context: customContext || undefined,
          case_id: selectedCaseId || undefined,
        });
        const latencyMs = Date.now() - startTime;
        setResponseResult({
          content: res.content,
          disclaimer: res.disclaimer,
          model: 'Legal-Copilot-Native-v1.0 (Instant 0.2ms)',
          latencyMs,
        });
        setStreamingText(res.content);
        setIsStreaming(false);
        setLoading(false);
        setHistory(prev => [
          { query: effectivePrompt, answer: res.content, task, model: 'Native (0.2ms)' },
          ...prev.slice(0, 5),
        ]);
        return;
      }

      // 2. Qwen Streaming Mode (Fast 1.5B or Deep 7B)
      const targetModel = modelMode === 'qwen-fast' ? 'qwen2.5-coder:1.5b' : 'qwen2.5-coder:7b';
      
      const res = await invokeQwenLegalCopilot({
        task,
        prompt: effectivePrompt,
        context: customContext || undefined,
        case_id: selectedCaseId || undefined,
        model: targetModel,
        onStreamChunk: (_chunk, accumulated) => {
          setStreamingText(accumulated);
          setLoading(false); // First token arrived!
        },
      });

      const finalLatency = Date.now() - startTime;
      setResponseResult({
        content: res.content,
        disclaimer: res.disclaimer,
        model: `${targetModel} • Local Engine`,
        latencyMs: finalLatency,
      });
      setStreamingText(res.content);

      setHistory(prev => [
        { query: effectivePrompt, answer: res.content, task, model: targetModel },
        ...prev.slice(0, 5),
      ]);
    } catch (err: any) {
      console.warn('Qwen execution error, falling back to native engine:', err);
      const fallback = executeCustomLegalAiModel({
        task,
        prompt: effectivePrompt,
        context: customContext || undefined,
      });
      const latencyMs = Date.now() - startTime;
      setResponseResult({
        content: fallback.content,
        disclaimer: fallback.disclaimer,
        model: 'Legal-Copilot-Native-v1.0 (Automatic Fast Fallback)',
        latencyMs,
      });
      setStreamingText(fallback.content);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = responseResult?.content || streamingText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const textToDownload = responseResult?.content || streamingText;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Copilot_${task}_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="p-3.5 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 rounded-2xl flex items-center space-x-3 text-xs text-indigo-200 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="flex-1">
          <span className="font-bold">Statutory & Ethical Notice:</span>{' '}
          AI-generated draft/research — verify independently before relying on it or filing. Powered by <strong>Qwen 2.5 Coder</strong> local engine with Indian legal grounding.
        </div>
      </div>

      {/* Header & Speed Engine Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h1 className="text-2xl font-bold text-white">AI Legal Copilot & Research Studio</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white font-semibold shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3" /> Qwen 2.5 Coder • Local Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instant statutory research, court pleadings drafting, limitation checks, and bench summaries
          </p>
        </div>

        {/* Engine Speed Mode Selector */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setModelMode('qwen-fast')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              modelMode === 'qwen-fast'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>⚡ Fast (1.5B • ~1.5s)</span>
          </button>

          <button
            onClick={() => setModelMode('qwen-deep')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              modelMode === 'qwen-deep'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-300" />
            <span>🧠 Deep (7B)</span>
          </button>

          <button
            onClick={() => setModelMode('native-instant')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              modelMode === 'native-instant'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>⚡ Instant (0.2ms)</span>
          </button>
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { id: 'general-research', label: 'Statutory Research', icon: BookOpen, desc: 'Acts, sections & provisions' },
          { id: 'bns-transition', label: 'BNS 2023 Transition', icon: Scale, desc: 'IPC/CrPC vs Sanhita mapping' },
          { id: 'drafting', label: 'Drafting Studio', icon: FileText, desc: 'Bail, notices, petitions & WS' },
          { id: 'case-brief', label: 'Pre-Hearing Brief', icon: Gavel, desc: 'Talking points for the Bench' },
          { id: 'limitation-check', label: 'Limitation Calculator', icon: Clock, desc: 'Articles & Section 5 delay' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = task === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTask(item.id as AICopilotTask)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer backdrop-blur-md ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg text-indigo-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold truncate text-white">{item.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Preset Fast Queries */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Advocate Presets (Click to Execute with Live Streaming):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SAMPLE_PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTask(preset.task);
                setPromptInput(preset.prompt);
                handleExecuteCopilot(undefined, preset.prompt);
              }}
              className="p-2.5 bg-slate-800/40 hover:bg-slate-800/70 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 rounded-xl text-left text-xs text-slate-300 transition-colors cursor-pointer group flex items-start space-x-2"
            >
              <preset.icon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-white group-hover:text-indigo-300 truncate text-[11px]">{preset.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{preset.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form & Case Context Injection */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Case Link Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-2 text-xs">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-semibold">Inject Context from Case Docket (Optional):</span>
          </div>

          <select
            value={selectedCaseId}
            onChange={(e) => handleSelectCaseChange(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-sm"
          >
            <option value="">-- No specific case selected --</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_title} ({c.case_number})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Context display if attached */}
        {customContext && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Attached Docket Context:</span>
              <button onClick={() => setCustomContext('')} className="text-indigo-400 hover:underline text-[10px]">
                Clear
              </button>
            </div>
            <textarea
              rows={2}
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none"
            />
          </div>
        )}

        {/* Prompt Input Area */}
        <form onSubmit={handleExecuteCopilot} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span>
                {task === 'bns-transition' && 'Enter Old IPC/CrPC Sections or BNS Queries to Cross-Map:'}
                {task === 'drafting' && 'Specify Document Drafting Requirements, Parties & Specific Grounds:'}
                {task === 'limitation-check' && 'Enter Date of Cause of Action, Impugned Order Date & Forum:'}
                {task === 'case-brief' && 'Enter Key Case Facts & Prayers for Bench Prep:'}
                {task === 'general-research' && 'Legal Research Query / Proposition / Statutory Clarification:'}
              </span>
            </label>
            <textarea
              rows={4}
              required
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Compare Section 420 IPC with BNS Section 318(4) / Draft Section 138 NI Act notice / Check limitation for filing SLP..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Engine: {modelMode === 'qwen-fast' ? 'Qwen 2.5 Coder 1.5B (Real-Time Stream)' : modelMode === 'qwen-deep' ? 'Qwen 2.5 Coder 7B (Deep)' : 'Native Pre-compiled Engine'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl text-xs md:text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Local Engine...</span>
                </>
              ) : isStreaming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Stream...</span>
                </>
              ) : (
                <>
                  <span>Run Legal Copilot</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RESULTS DISPLAY CONTAINER (WITH REAL-TIME STREAMING) */}
      <div ref={resultsRef}>
        {(streamingText || responseResult) && (
          <div className="bg-slate-800/50 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Header & Export Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Legal Analysis & Structured Draft</span>
                    {responseResult?.latencyMs !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        ⚡ {responseResult.latencyMs < 1 ? '<1ms' : `${(responseResult.latencyMs / 1000).toFixed(2)}s`}
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Model: {responseResult?.model || (modelMode === 'qwen-fast' ? 'qwen2.5-coder:1.5b' : 'qwen2.5-coder:7b')} • Task: {task.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Draft'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* AI Generated Content Output (Live Streamed) */}
            <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-700/40 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
              {streamingText || responseResult?.content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle rounded-sm" />
              )}
            </div>

            {/* Mandatory bottom disclaimer card */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/40 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Advocate Verification Required:</strong> {responseResult?.disclaimer || 'AI-generated draft/research — verify independently before relying on it or filing.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* History of Recent Research */}
      {history.length > 0 && (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Chamber Research Inquiries</h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setTask(item.task as AICopilotTask);
                  setPromptInput(item.query);
                  setStreamingText(item.answer);
                  setResponseResult({
                    content: item.answer,
                    disclaimer: 'AI-generated draft/research — verify independently before relying on it or filing.',
                    model: item.model,
                  });
                }}
                className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/40 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                    [{item.task}] • {item.model}
                  </span>
                  <p className="text-slate-200 font-medium truncate mt-0.5">{item.query}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
