import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import { 
  ShieldCheck, 
  Scissors, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Star, 
  User, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, loginAsWorker, openAuthModal } = useAuth();
  const { workers, showToast } = useSalon();

  // Mode: 'selection', 'owner-login', 'worker-select', 'forgot-password'
  const [mode, setMode] = useState('selection');

  // Owner Form States
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ownerError, setOwnerError] = useState('');
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false);

  // Forgot Password States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Auto-fill owner demo credentials
  const handleFillDemoOwner = () => {
    setOwnerEmail(DEMO_CREDENTIALS.owner.email);
    setOwnerPassword(DEMO_CREDENTIALS.owner.password);
    setOwnerError('');
  };

  // Submit Owner Login
  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    setOwnerError('');
    setIsSubmittingOwner(true);

    try {
      const user = await login(ownerEmail, ownerPassword, 'owner');
      if (user.role !== 'owner') {
        throw new Error('Access denied. Only the authorized salon owner can access the Owner Dashboard.');
      }
      showToast(`Welcome back, ${user.name}!`);
      onNavigate('owner-dashboard');
    } catch (err) {
      setOwnerError(err.message || 'Invalid owner credentials. Please check your email and password.');
    } finally {
      setIsSubmittingOwner(false);
    }
  };

  // Select Worker (ONE-CLICK LOGIN)
  const handleSelectWorker = (worker) => {
    loginAsWorker(worker);
    showToast(`Stylist workspace active: ${worker.name}`);
    onNavigate('worker-dashboard');
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setTimeout(() => {
      setRecoveryLoading(false);
      setRecoverySuccess(true);
      showToast('Password reset link sent to registered owner email.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE8] to-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      
      {/* Top Header & Back to Website */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-8 border-b border-[#E8DEC8]">
        <div 
          onClick={() => onNavigate('customer')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center font-serif text-xl font-bold shadow-sm transition group-hover:bg-[#8B5E3C]">
            A
          </div>
          <div>
            <span className="font-serif text-2xl tracking-widest text-[#4A2E1B] font-semibold block leading-none">
              A U R A
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-medium">
              Atelier &bull; Portal Authentication
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('customer')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B5E3C] hover:text-[#4A2E1B] bg-white border border-[#E5D7C7] px-4 py-2 rounded-full transition shadow-xs hover:border-[#8B5E3C]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Salon Website
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full my-auto py-10">

        {/* ========================================================
            VIEW 1: PRIMARY LOGIN SELECTION (TWO LARGE OPTIONS)
           ======================================================== */}
        {mode === 'selection' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Headline */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold bg-[#EFE6DC] px-3.5 py-1 rounded-full border border-[#DFCFC1]">
                Salon Management &amp; Staff Gateway
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#4A2E1B] font-semibold leading-tight">
                Select Your Access Portal
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Welcome to the AURA Atelier management system. Please select your authorized portal below to proceed.
              </p>
            </div>

            {/* The Two Large Login Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* CARD 1: OWNER LOGIN */}
              <div className="bg-white rounded-3xl p-8 border-2 border-[#E8DEC8] hover:border-[#8B5E3C] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A2E1B]/5 rounded-bl-full pointer-events-none"></div>

                <div className="space-y-6">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                      <ShieldCheck className="w-8 h-8 text-[#D4A373]" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-[#FAF3EC] text-[#8B5E3C] border border-[#E5D7C7]">
                      Executive Admin
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#4A2E1B] group-hover:text-[#8B5E3C] transition">
                      Owner Login
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Secured portal for salon ownership and management. Access financial analytics, worker roster, service catalog, and system settings.
                    </p>
                  </div>

                  {/* Highlights list */}
                  <ul className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-5">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                      <span>Revenue, earnings &amp; performance reports</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                      <span>Manage team roster (Maximum 5 master stylists)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                      <span>Configure services, pricing, durations &amp; location</span>
                    </li>
                  </ul>
                </div>

                {/* Primary Button */}
                <div className="pt-8">
                  <button
                    onClick={() => {
                      setMode('owner-login');
                      setOwnerError('');
                    }}
                    className="w-full bg-[#4A2E1B] hover:bg-[#341F11] text-[#FAF7F2] py-4 px-6 rounded-2xl font-semibold text-xs uppercase tracking-wider transition shadow-md hover:shadow-xl flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Owner Login</span>
                    <ArrowRight className="w-4 h-4 transition group-hover/btn:translate-x-1 text-[#D4A373]" />
                  </button>
                  <p className="text-[11px] text-center text-stone-400 mt-2.5">
                    Requires registered owner email &amp; master password
                  </p>
                </div>
              </div>

              {/* CARD 2: WORKERS LOGIN (ONE-CLICK SELECTION) */}
              <div className="bg-white rounded-3xl p-8 border-2 border-[#E8DEC8] hover:border-[#8B5E3C] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A373]/10 rounded-bl-full pointer-events-none"></div>

                <div className="space-y-6">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-[#F4EDE4] text-[#8B5E3C] border border-[#E0D4C7] flex items-center justify-center shadow-md group-hover:scale-105 transition">
                      <Scissors className="w-8 h-8 text-[#8B5E3C]" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      1-Click Access
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#4A2E1B] group-hover:text-[#8B5E3C] transition">
                      Workers Login
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Instant one-click portal for all 4–5 salon specialists. Pick your profile card to view your assigned appointments, customer notes, and earnings.
                    </p>
                  </div>

                  {/* Highlights list */}
                  <ul className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-5">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-stone-800">No passwords or individual emails required</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dedicated personal daily client queue</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Start &amp; complete appointments with commission tally</span>
                    </li>
                  </ul>
                </div>

                {/* Primary Button */}
                <div className="pt-8">
                  <button
                    onClick={() => setMode('worker-select')}
                    className="w-full bg-[#8B5E3C] hover:bg-[#724A2E] text-white py-4 px-6 rounded-2xl font-semibold text-xs uppercase tracking-wider transition shadow-md hover:shadow-xl flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Workers Login</span>
                    <ArrowRight className="w-4 h-4 transition group-hover/btn:translate-x-1" />
                  </button>
                  <p className="text-[11px] text-center text-stone-400 mt-2.5">
                    Select your name from the staff roster to enter
                  </p>
                </div>
              </div>

            </div>

            {/* Discreet Customer Portal Footer Option */}
            <div className="text-center pt-6">
              <div className="inline-flex items-center gap-2 bg-[#F3ECE2] border border-[#E5D7C7] px-5 py-2.5 rounded-full text-xs text-stone-700">
                <User className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>Visiting as a customer?</span>
                <button
                  onClick={() => openAuthModal('customer')}
                  className="font-semibold text-[#8B5E3C] hover:text-[#4A2E1B] underline ml-1"
                >
                  Customer Sign In / Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: WORKER SELECTION SCREEN (1-CLICK ACCESS)
           ======================================================== */}
        {mode === 'worker-select' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header with Back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode('selection')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-[#E5D7C7] px-4 py-2 rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login Options
              </button>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5E3C] bg-[#FAF3EC] px-3 py-1 rounded-full border border-[#E5D7C7]">
                Staff Atelier Selection
              </span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#4A2E1B] font-semibold">
                Select Your Specialist Profile
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Click on your profile card below to open your personal worker dashboard. No password needed.
              </p>
            </div>

            {/* Workers Grid (All 4-5 Workers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => handleSelectWorker(worker)}
                  className="bg-white rounded-2xl p-6 border-2 border-[#E8DEC8] hover:border-[#8B5E3C] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-4 group text-left"
                >
                  {/* Avatar with Status badge */}
                  <div className="relative shrink-0">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E5D7C7] group-hover:border-[#8B5E3C] transition"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        worker.status === 'active'
                          ? 'bg-emerald-500'
                          : worker.status === 'on_break'
                          ? 'bg-amber-400'
                          : 'bg-stone-400'
                      }`}
                      title={worker.status}
                    ></span>
                  </div>

                  {/* Worker Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] group-hover:text-[#8B5E3C] transition truncate">
                      {worker.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium truncate">
                      {worker.role}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-500">
                      <span className="flex items-center text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-current inline mr-0.5" />
                        {worker.rating || 4.9}
                      </span>
                      <span>&bull;</span>
                      <span>{worker.experience}</span>
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] group-hover:bg-[#4A2E1B] group-hover:text-white text-[#8B5E3C] flex items-center justify-center shrink-0 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF3EC] border border-[#E5D7C7] p-4 rounded-2xl text-center text-xs text-stone-600">
              <span className="font-semibold text-[#4A2E1B]">Privacy Notice:</span> Entering your workspace gives you exclusive access to your assigned customer bookings, service appointments, and personal earnings split.
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: OWNER LOGIN CREDENTIALS FORM
           ======================================================== */}
        {mode === 'owner-login' && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header with Back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode('selection')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-[#E5D7C7] px-4 py-2 rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login Options
              </button>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5E3C] bg-[#FAF3EC] px-3 py-1 rounded-full border border-[#E5D7C7]">
                Owner Portal
              </span>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-[#E8DEC8] shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-8 h-8 text-[#D4A373]" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#4A2E1B]">
                  Owner Administration Login
                </h2>
                <p className="text-xs text-stone-500">
                  Enter your registered salon administrator credentials.
                </p>
              </div>

              {/* 1-Click Demo Fill for Testing Convenience */}
              <div className="bg-[#FAF7F2] border border-[#E5D7C7] p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#4A2E1B]">Testing / Demo Account</p>
                  <p className="text-[10px] text-stone-500">owner@aurasalon.com</p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoOwner}
                  className="bg-white hover:bg-[#F3ECE2] border border-[#D5C2B1] text-[#8B5E3C] text-[11px] font-semibold px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#D4A373]" />
                  Auto-Fill
                </button>
              </div>

              {ownerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{ownerError}</span>
                </div>
              )}

              {/* Owner Credentials Form */}
              <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Owner Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@aurasalon.com"
                      className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl pl-10 pr-3.5 py-2.5 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold uppercase text-stone-600">
                      Master Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setRecoverySuccess(false);
                      }}
                      className="text-[11px] text-[#8B5E3C] hover:text-[#4A2E1B] font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl pl-10 pr-10 py-2.5 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOwner}
                  className="w-full mt-2 bg-[#4A2E1B] hover:bg-[#341F11] text-[#FAF7F2] py-3.5 rounded-xl font-semibold uppercase tracking-wider text-xs transition shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingOwner ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Authenticating Owner...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
                      Sign In to Owner Console
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 4: FORGOT PASSWORD RECOVERY
           ======================================================== */}
        {mode === 'forgot-password' && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode('owner-login')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-[#E5D7C7] px-4 py-2 rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Owner Login
              </button>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5E3C] bg-[#FAF3EC] px-3 py-1 rounded-full border border-[#E5D7C7]">
                Recovery
              </span>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-[#E8DEC8] shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#F4EDE4] text-[#8B5E3C] flex items-center justify-center mx-auto shadow-sm">
                  <KeyRound className="w-8 h-8 text-[#8B5E3C]" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#4A2E1B]">
                  Reset Owner Password
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Enter your registered administrator email to receive secure password recovery instructions.
                </p>
              </div>

              {recoverySuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                      Instructions Dispatched
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      We have sent password reset instructions to <strong>{recoveryEmail || 'owner@aurasalon.com'}</strong>.
                    </p>
                    <p className="text-[11px] text-stone-500 mt-2">
                      (For local demonstration testing, the master password is: <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono font-bold text-[#8B5E3C]">ownerpassword123</code>)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOwnerEmail(recoveryEmail || 'owner@aurasalon.com');
                      setOwnerPassword('ownerpassword123');
                      setMode('owner-login');
                    }}
                    className="w-full bg-[#4A2E1B] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#341F11] transition"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                      Registered Owner Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="owner@aurasalon.com"
                        className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl pl-10 pr-3.5 py-2.5 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-[#4A2E1B] hover:bg-[#341F11] text-[#FAF7F2] py-3.5 rounded-xl font-semibold uppercase tracking-wider text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Processing Request...' : 'Send Recovery Instructions'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer Notice */}
      <div className="max-w-5xl mx-auto w-full text-center pt-8 border-t border-[#E8DEC8] text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} AURA Salon &amp; Aesthetic Sanctuary &bull; Staff &amp; Executive Security Governance</p>
      </div>

    </div>
  );
}

