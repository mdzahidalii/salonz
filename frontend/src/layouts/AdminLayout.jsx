import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import {
  TrendingUp,
  Calendar,
  Users,
  UserCheck,
  Scissors,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Plus,
  UserPlus,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ 
  children, 
  activeTab = 'overview', 
  onSelectTab, 
  onNavigate,
  onOpenAddWorker,
  onOpenAddService
}) {
  const { user, logout } = useAuth();
  const { workers, services, appointments, salonInfo, showToast } = useSalon();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: TrendingUp, badge: null },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: null },
    { id: 'workers', label: 'Workers Management', icon: UserCheck, badge: `${workers.length}/5` },
    { id: 'services', label: 'Services Management', icon: Scissors, badge: services.length },
    { id: 'payments', label: 'Payments', icon: DollarSign, badge: null },
    { id: 'reports', label: 'Reports', icon: BarChart3, badge: 'Live' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleLogout = () => {
    logout();
    showToast('Signed out of Administrator Console.');
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const getTabTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Administrator Console';
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

      {/* ================= ADMIN SIDEBAR ================= */}
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
                  <ShieldCheck className="w-3 h-3 text-[#D4A373]" />
                  Executive Admin
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

          {/* Quick Salon Overview Pill */}
          <div className="px-5 pt-4 pb-2">
            <div className="bg-[#FAF7F2] border border-[#EAE0D3] p-3 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
                Active Establishment
              </p>
              <h2 className="text-xs font-serif font-bold text-[#4A2E1B] truncate">
                {salonInfo?.name || 'AURA Salon & Atelier'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Salon Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="p-4 space-y-1.5 flex-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Navigation Menu
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

        {/* Sidebar Footer: Profile & Logout */}
        <div className="p-4 border-t border-[#EBE1D5] bg-[#FAF7F2]/60">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center font-serif text-xs font-bold shadow-2xs">
                {user?.name ? user.name.charAt(0) : 'E'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#4A2E1B] truncate">
                  {user?.name || 'Eleanor Vance'}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {user?.email || 'owner@aurasalon.com'}
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EAE0D3] text-[#4A2E1B]">
              Owner
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 hover:text-red-800 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Sign Out Administrator</span>
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
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold hidden sm:block">
                AURA Administration
              </span>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4A2E1B] leading-tight">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAddWorker && (
              <button
                onClick={onOpenAddWorker}
                className="bg-white hover:bg-[#F3ECE2] text-[#4A2E1B] border border-[#D5C2B1] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span className="hidden sm:inline">Add Stylist</span> ({workers.length}/5)
              </button>
            )}

            {onOpenAddService && (
              <button
                onClick={onOpenAddService}
                className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                <span className="hidden sm:inline">New Service</span>
              </button>
            )}

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

