import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Scissors, 
  ArrowRight, 
  Star,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    loginAsWorker,
    register 
  } = useAuth();
  const { workers, showToast } = useSalon();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode && authModalTab === 'customer') {
        const newUser = await register({ name, email, phone, password });
        if (onLoginSuccess) onLoginSuccess(newUser);
        closeAuthModal();
      } else {
        const loggedUser = await login(email, password, authModalTab);
        if (onLoginSuccess) onLoginSuccess(loggedUser);
        closeAuthModal();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (worker) => {
    const workerUser = loginAsWorker(worker);
    showToast(`Stylist workspace active: ${worker.name}`);
    if (onLoginSuccess) onLoginSuccess(workerUser);
    closeAuthModal();
  };

  const handleQuickDemoFill = (roleKey) => {
    const cred = DEMO_CREDENTIALS[roleKey];
    if (cred) {
      setAuthModalTab(cred.role);
      setEmail(cred.email);
      setPassword(cred.password);
      setName(cred.name);
      if (cred.phone) setPhone(cred.phone);
      setIsRegisterMode(false);
      setIsForgotPassword(false);
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E8DEC8] shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#E5D7C7] flex items-center justify-center text-stone-500 hover:text-stone-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center font-serif text-xl font-bold mx-auto mb-2 shadow-sm">
            A
          </div>
          <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold">
            {authModalTab === 'owner' ? 'Owner Administration' : authModalTab === 'worker' ? 'Workers Atelier Access' : (isRegisterMode ? 'Create Guest Account' : 'Welcome to AURA')}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {authModalTab === 'worker' 
              ? 'Click your profile below to enter your workspace with 1 click.'
              : authModalTab === 'owner'
              ? 'Authorized owner access with master credentials.'
              : 'Access your appointments, ritual history, and sanctuary profile.'}
          </p>
        </div>

        {/* Role Tabs */}
        {!isRegisterMode && (
          <div className="grid grid-cols-3 gap-1 bg-[#EFE6DC] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setAuthModalTab('customer');
                setError('');
                setIsForgotPassword(false);
              }}
              className={`py-2 rounded-lg transition ${
                authModalTab === 'customer'
                  ? 'bg-white text-[#4A2E1B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setAuthModalTab('worker');
                setError('');
                setIsForgotPassword(false);
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                authModalTab === 'worker'
                  ? 'bg-white text-[#4A2E1B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Workers (1-Click)
            </button>
            <button
              onClick={() => {
                setAuthModalTab('owner');
                setError('');
                setIsForgotPassword(false);
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                authModalTab === 'owner'
                  ? 'bg-white text-[#4A2E1B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner
            </button>
          </div>
        )}

        {/* WORKER TAB: 1-CLICK WORKER SELECTION SCREEN */}
        {authModalTab === 'worker' ? (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5D7C7] text-xs text-stone-600 flex items-center justify-between">
              <span>Select your profile to enter your queue directly:</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">No Password</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => handleSelectWorker(worker)}
                  className="bg-white rounded-2xl p-4 border border-[#EAE0D3] hover:border-[#8B5E3C] hover:shadow-md transition cursor-pointer flex items-center gap-3 group text-left"
                >
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E5D7C7] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-sm text-[#4A2E1B] group-hover:text-[#8B5E3C] truncate">
                      {worker.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">{worker.role}</p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5 font-bold">
                      <Star className="w-3 h-3 fill-current inline" />
                      {worker.rating || 4.9}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8B5E3C] group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : isForgotPassword && authModalTab === 'owner' ? (
          /* FORGOT PASSWORD FORM FOR OWNER */
          <div className="bg-white p-6 rounded-2xl border border-[#E5D7C7] space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
              Reset Owner Password
            </h3>
            {forgotSuccess ? (
              <div className="text-center space-y-3 py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-stone-600">
                  Password recovery instructions have been dispatched to registered owner email.
                </p>
                <p className="text-[11px] text-stone-500">
                  Demo password: <code className="font-bold text-[#8B5E3C]">ownerpassword123</code>
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full bg-[#4A2E1B] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
                >
                  Back to Owner Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSuccess(true);
                  showToast('Password reset link sent to owner email.');
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-xs text-stone-500">
                  Enter your owner email address to receive reset instructions:
                </p>
                <input
                  type="email"
                  required
                  placeholder="owner@aurasalon.com"
                  defaultValue="owner@aurasalon.com"
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="flex-1 border border-stone-300 py-2.5 rounded-xl text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#4A2E1B] text-white py-2.5 rounded-xl font-semibold uppercase tracking-wider"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* STANDARD LOGIN / REGISTER FORM (FOR OWNER OR CUSTOMER) */
          <>
            {/* 1-Click Demo Fill Assistant */}
            <div className="bg-white p-3 rounded-2xl border border-[#E5D7C7] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C]">
                  Quick Demo Credentials
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('customer')}
                  className="flex-1 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E5D7C7] text-[11px] py-1.5 rounded-lg font-medium text-stone-700"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('owner')}
                  className="flex-1 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E5D7C7] text-[11px] py-1.5 rounded-lg font-medium text-stone-700"
                >
                  Owner (Admin)
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {isRegisterMode && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sophia Williams"
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl pl-9 pr-3.5 py-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                </div>
              )}

              {isRegisterMode && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99887 76655"
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl pl-9 pr-3.5 py-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authModalTab === 'owner' ? 'owner@aurasalon.com' : 'you@example.com'}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl pl-9 pr-3.5 py-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold uppercase text-stone-600">
                    Password
                  </label>
                  {authModalTab === 'owner' && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] text-[#8B5E3C] hover:text-[#4A2E1B] font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl pl-9 pr-10 py-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
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
                disabled={loading}
                className="w-full mt-2 bg-[#4A2E1B] hover:bg-[#341F11] text-white py-3 rounded-xl font-semibold uppercase tracking-wider text-xs transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isRegisterMode ? 'Register Account' : `Sign In as ${authModalTab.toUpperCase()}`}
              </button>
            </form>

            {/* Toggle Register/Login for Customer */}
            {authModalTab === 'customer' && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError('');
                  }}
                  className="text-xs text-[#8B5E3C] hover:text-[#4A2E1B] font-medium transition"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in here'
                    : "Don't have an account? Create one now"}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
