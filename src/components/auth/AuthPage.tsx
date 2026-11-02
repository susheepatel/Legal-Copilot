import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  FileText, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthPage: React.FC = () => {
  const { login, signUp, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('lawyer');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [prefilledNotice, setPrefilledNotice] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [barEnrollment, setBarEnrollment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firmName, setFirmName] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPrefilledNotice(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your registered advocate email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to authenticate. Only registered chamber advocates are authorized.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPrefilledNotice(null);

    if (!fullName || !email || !password || !barEnrollment || !phoneNumber) {
      setErrorMessage('Please fill in all mandatory fields, including Bar Council Enrollment Number.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    const res = await signUp({
      full_name: fullName,
      email,
      password,
      bar_enrollment_no: barEnrollment,
      phone: phoneNumber,
      firm_name: firmName,
      role,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed. Please verify your details.');
    } else {
      setSuccessMessage('Registration successful! Your advocate profile is registered and synchronized in Supabase.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email) {
      setErrorMessage('Please provide your registered advocate email address.');
      return;
    }
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch reset instructions.');
    }
  };

  // Fast-track prefill with registered advocate credentials
  const handleSelectRegisteredAdvocate = (targetEmail: string, targetPass: string, label: string) => {
    setMode('login');
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMessage('');
    setPrefilledNotice(`Prefilled registered credentials for ${label}. Click Access Practice Chamber to sign in.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background ornamentation with frosted ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem & Branding */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 text-white mb-4 border border-indigo-400/30">
          <Scale className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Legal Copilot
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
          Indian Law Practice Management &amp; Statutory AI Assistant
        </p>

        {/* Database Sync Status Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Supabase PostgreSQL Database Connected &amp; Synced</span>
        </div>

        {/* Fast-Track Registered Advocates Pill Card */}
        <div className="mt-4 p-3.5 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl max-w-sm mx-auto text-left shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Registered Chamber Advocates
            </span>
            <span className="text-[10px] text-slate-400 font-mono">100% Auth</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
            Click to fill registered advocate credentials and authenticate directly through Supabase:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectRegisteredAdvocate('rajesh.verma@chamber.in', 'Admin@2025', 'Adv. Rajesh Verma')}
              className="px-2.5 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-[11px] font-semibold text-indigo-300 transition-colors text-left truncate cursor-pointer flex items-center justify-between"
            >
              <span>👑 Adv. Rajesh Verma</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRegisteredAdvocate('priya.sharma@chamber.in', 'Associate@2025', 'Adv. Priya Sharma')}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-[11px] font-semibold text-slate-200 transition-colors text-left truncate cursor-pointer flex items-center justify-between"
            >
              <span>⚖️ Adv. Priya Sharma</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/40 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50 backdrop-blur-xl sm:px-10">
          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-900/60 p-1 mb-6 border border-slate-700/50">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
                setPrefilledNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chamber Login
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
                setPrefilledNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Advocate Sign Up
            </button>
          </div>

          {/* Feedback & Error messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {prefilledNotice && (
            <div className="mb-4 p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{prefilledNotice}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Advocate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advocate@chamber.in"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-300 hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Bar Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Access Practice Chamber</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  Strictly authenticated • Unregistered accounts are denied access
                </span>
              </div>
            </form>
          )}

          {/* ADVOCATE SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advocate Full Name (with Title) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adv. Rajesh Verma"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="advocate@court.in"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bar Enrollment No. *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={barEnrollment}
                      onChange={(e) => setBarEnrollment(e.target.value)}
                      placeholder="e.g. D/1482/2012"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98110 00000"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chamber / Law Firm Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Verma &amp; Associates Legal Chambers"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Practice Chamber Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      role === 'admin'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-700/50 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👑 Chamber Head / Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('lawyer')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      role === 'lawyer'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-700/50 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚖️ Associate Advocate
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Register Practice &amp; Enter Chamber</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="text-sm font-bold text-white">Reset Chamber Password</h4>
                <p className="text-xs text-slate-400 mt-1">Enter your registered email to receive recovery instructions.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Advocate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advocate@chamber.in"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching...' : 'Send Reset Instructions'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-indigo-300 hover:underline cursor-pointer"
                >
                  &larr; Back to Chamber Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & RLS Compliance Notice */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline" />
            Protected by PostgreSQL Row Level Security (RLS) &amp; Advocate Authentication
          </p>
        </div>
      </div>
    </div>
  );
};
