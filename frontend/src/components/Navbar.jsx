import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ShieldCheck, 
  Scissors, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  KeyRound
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout, openAuthModal, quickSwitchRole } = useAuth();
  const { openBookingModal } = useSalon();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isCustomerPortal = currentView === 'customer' || currentView === 'customer-dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EBE1D5] transition-all">
      {/* Top Banner: Appears ONLY in Customer Portal (Completely removed from Admin and Worker Dashboards) */}
      {isCustomerPortal && (
        <div className="bg-[#4A2E1B] text-[#FAF7F2] text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-light tracking-wide">
                {user ? (
                  <>Signed in as: <strong className="font-semibold text-[#E5D7C7]">{user.name}</strong> ({user.role})</>
                ) : (
                  <>Welcome to AURA Atelier &bull; Reserve bespoke hair, spa &amp; aesthetics</>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-300 hidden sm:inline">Role Quick-Switch:</span>
              <button
                onClick={() => {
                  quickSwitchRole('customer');
                  setCurrentView('customer');
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  user?.role === 'customer'
                    ? 'bg-[#8B5E3C] text-white shadow-2xs'
                    : 'bg-[#5C3B24] text-stone-200 hover:bg-[#6D472D]'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="px-2.5 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 bg-[#3A2213] text-stone-300 hover:bg-[#5C3B24]"
                title="Enter Staff or Owner Authentication Portal"
              >
                <KeyRound className="w-3 h-3 text-[#D4A373]" />
                Staff &amp; Owner Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('customer')}
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
              Salon &bull; Spa &bull; Sanctuary
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5C4D42]">
          <button 
            onClick={() => setCurrentView('customer')}
            className={`transition hover:text-[#4A2E1B] ${currentView === 'customer' ? 'text-[#4A2E1B] font-semibold border-b-2 border-[#8B5E3C] pb-1' : ''}`}
          >
            Services &amp; Sanctuary
          </button>
          
          <button 
            onClick={() => {
              setCurrentView('customer');
              setTimeout(() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition hover:text-[#4A2E1B]"
          >
            Treatments Menu
          </button>

          <button 
            onClick={() => {
              setCurrentView('customer');
              setTimeout(() => {
                document.getElementById('stylists-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition hover:text-[#4A2E1B]"
          >
            Master Stylists
          </button>

          <button 
            onClick={() => {
              setCurrentView('customer');
              setTimeout(() => {
                document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="transition hover:text-[#4A2E1B]"
          >
            Location &amp; Hours
          </button>

          {/* Customer Bookings / Status Queue */}
          <button
            onClick={() => setCurrentView('customer-dashboard')}
            className={`flex items-center gap-1.5 transition text-[#5C4D42] hover:text-[#4A2E1B] ${
              currentView === 'customer-dashboard' ? 'text-[#4A2E1B] font-semibold border-b-2 border-[#8B5E3C] pb-1' : ''
            }`}
          >
            <Calendar className="w-4 h-4 text-[#8B5E3C]" />
            My Bookings
          </button>

          {/* Dedicated Staff & Owner Login Portal Link */}
          <button 
            onClick={() => setCurrentView('login')}
            className={`transition hover:text-[#4A2E1B] flex items-center gap-1.5 ${
              currentView === 'login' ? 'text-[#4A2E1B] font-semibold border-b-2 border-[#8B5E3C] pb-1' : ''
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#8B5E3C]" />
            Staff &amp; Owner Portal
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => openBookingModal()}
            className="bg-[#4A2E1B] text-[#FAF7F2] hover:bg-[#382112] px-5 py-2.5 rounded-full text-sm font-medium transition shadow-md hover:shadow-lg flex items-center gap-2 transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            Book Appointment
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 bg-white border border-[#E0D4C7] px-3.5 py-1.5 rounded-full hover:border-[#8B5E3C] transition shadow-xs text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#EFE6DC] text-[#4A2E1B] flex items-center justify-center font-semibold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium text-xs text-[#4A2E1B] max-w-[110px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E5D7C7] py-2 z-50 animate-in fade-in-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-semibold text-[#4A2E1B] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[#F4EDE4] text-[#8B5E3C] uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === 'customer' && (
                      <button
                        onClick={() => {
                          setCurrentView('customer-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-[#8B5E3C]" />
                        My Bookings &amp; History
                      </button>
                    )}

                    {user.role === 'worker' && (
                      <button
                        onClick={() => {
                          setCurrentView('worker-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] flex items-center gap-2"
                      >
                        <Scissors className="w-4 h-4 text-[#8B5E3C]" />
                        Worker Dashboard
                      </button>
                    )}

                    {user.role === 'owner' && (
                      <button
                        onClick={() => {
                          setCurrentView('owner-dashboard');
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
                        Owner Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('login');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4 text-[#8B5E3C]" />
                      Switch Portal / Login
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setRoleDropdownOpen(false);
                        setCurrentView('customer');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="text-[#4A2E1B] hover:text-[#8B5E3C] border border-[#D5C2B1] bg-white px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Portal Login
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => openBookingModal()}
            className="bg-[#4A2E1B] text-[#FAF7F2] px-3.5 py-1.5 rounded-full text-xs font-medium shadow"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#4A2E1B] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E5D7C7] px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => {
              setCurrentView('customer');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-[#4A2E1B]"
          >
            Home &amp; Sanctuary
          </button>

          <button
            onClick={() => {
              setCurrentView('customer');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="block w-full text-left py-2 font-medium text-[#4A2E1B]"
          >
            Treatments Menu
          </button>

          <button
            onClick={() => {
              setCurrentView('customer');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('stylists-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="block w-full text-left py-2 font-medium text-[#4A2E1B]"
          >
            Master Stylists
          </button>

          <button
            onClick={() => {
              setCurrentView('customer');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="block w-full text-left py-2 font-medium text-[#4A2E1B]"
          >
            Location &amp; Hours
          </button>

          <button
            onClick={() => {
              setCurrentView('customer-dashboard');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-[#8B5E3C]"
          >
            My Bookings
          </button>

          <button
            onClick={() => {
              setCurrentView('login');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-semibold text-[#8B5E3C] flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Staff &amp; Owner Portal Login
          </button>

          <div className="pt-3 border-t border-stone-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500">Signed in as</p>
                  <p className="text-sm font-semibold text-[#4A2E1B]">{user.name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-[#4A2E1B] text-white py-2 rounded-lg text-sm font-medium"
              >
                Sign In / Portal Access
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
