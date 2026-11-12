import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import {
  TrendingUp,
  Calendar,
  Users,
  Clock,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  Scissors,
  Star,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function WorkerLayout({
  children,
  activeTab = 'dashboard',
  onSelectTab,
  onNavigate
}) {
  const { user, logout } = useAuth();
  const { workers, appointments, toggleWorkerStatus, showToast } = useSalon();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Find the active logged-in worker profile
  const currentWorker = workers.find((w) => w.id === user?.workerId || w.email === user?.email) || workers[0];

  // Assigned appointments count
  const workerAppointments = appointments.filter((apt) => apt.workerId === currentWorker?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = workerAppointments.filter(
    (apt) => apt.date === todayStr && apt.status !== 'cancelled'
  );

  const navItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: TrendingUp, badge: null },
    { id: 'appointments', label: 'My Appointments', icon: Calendar, badge: todayAppointments.length },
    { id: 'customers', label: 'Customer Details', icon: Users, badge: null },
    { id: 'schedule', label: 'My Schedule', icon: Clock, badge: null },
    { id: 'earnings', label: 'My Earnings', icon: DollarSign, badge: '50% Cut' },
    { id: 'profile', label: 'Profile', icon: User, badge: null },
  ];

  const handleLogout = () => {
    logout();
    showToast('Signed out of Staff Operations Portal.');
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleToggleDuty = (status) => {
    if (currentWorker) {
      toggleWorkerStatus(currentWorker.id, status);
      const label = status === 'active' ? 'On Duty' : status === 'on_break' ? 'On Break' : 'Off Duty';
      showToast(`Duty status updated to: ${label}`);
    }
  };

  const getTabTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Staff Workspace';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row font-sans text-[#2D241E]">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ================= WORKER SIDEBAR ================= */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-white border-r border-[#E8DEC8] flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-[#EBE1D5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                A
              </div>
              <div>
                <span className="font-serif text-xl tracking-widest text-[#4A2E1B] font-bold block leading-none">
                  A U R A
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold flex items-center gap-1 mt-0.5">
                  <Scissors className="w-3 h-3 text-[#D4A373]" />
                  Staff Operations Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-stone-500 hover:text-stone-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Worker Profile Card */}
          <div className="p-4 m-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D3]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentWorker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={currentWorker?.name || 'Stylist'}
                  className="w-12 h-12 rounded-xl object-cover border border-[#8B5E3C]"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    currentWorker?.status === 'active'
                      ? 'bg-emerald-500'
                      : currentWorker?.status === 'on_break'
                      ? 'bg-amber-400'
                      : 'bg-stone-400'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-serif font-bold text-[#4A2E1B] truncate">
                  {currentWorker?.name || 'Stylist Specialist'}
                </h2>
                <p className="text-[10px] text-stone-500 truncate">
                  {currentWorker?.role || 'Senior Stylist'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{currentWorker?.rating || 4.9}</span>
                  <span className="text-stone-400 font-normal">&bull; {currentWorker?.experience || '4 Yrs'}</span>
                </div>
              </div>
            </div>

            {/* Interactive Availability Toggle */}
            <div className="mt-3 pt-3 border-t border-[#EAE0D3]">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
                Duty Status
              </span>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-[#E0D4C7]">
                <button
                  onClick={() => handleToggleDuty('active')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    currentWorker?.status === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  On Duty
                </button>
                <button
                  onClick={() => handleToggleDuty('on_break')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    currentWorker?.status === 'on_break'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Break
                </button>
                <button
                  onClick={() => handleToggleDuty('off_duty')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    currentWorker?.status === 'off_duty'
                      ? 'bg-stone-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="p-4 space-y-1.5 flex-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Stylist Queue &amp; Operations
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#4A2E1B] text-white shadow-sm'
                      : 'text-[#5C4D42] hover:bg-[#FAF7F2] hover:text-[#4A2E1B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-[#8B5E3C]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#6D472D] text-[#FAF7F2]'
                          : 'bg-[#F4ECE3] text-[#8B5E3C]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Logout */}
        <div className="p-4 border-t border-[#EBE1D5] bg-[#FAF7F2]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 hover:text-red-800 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Sign Out Staff Portal</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-white border border-[#E0D4C7] text-[#4A2E1B] hover:bg-[#F5EFE8]"
              aria-label="Open Staff Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold hidden sm:block">
                Staff Operations &bull; {currentWorker?.name}
              </span>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4A2E1B] leading-tight">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Duty status pill */}
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                currentWorker?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : currentWorker?.status === 'on_break'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentWorker?.status === 'active'
                    ? 'bg-emerald-500 animate-pulse'
                    : currentWorker?.status === 'on_break'
                    ? 'bg-amber-500'
                    : 'bg-stone-400'
                }`}
              />
              {currentWorker?.status === 'active'
                ? 'On Duty'
                : currentWorker?.status === 'on_break'
                ? 'On Break'
                : 'Off Duty'}
            </span>

            <button
              onClick={() => onNavigate && onNavigate('customer')}
              title="Preview Customer Facing Sanctuary"
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#8B5E3C] hover:text-[#4A2E1B] bg-white border border-[#E5D7C7] px-3 py-1.5 rounded-xl font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

