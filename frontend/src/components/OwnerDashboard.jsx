import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  MapPin, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';

export default function OwnerDashboard({
  activeTab: controlledTab,
  setActiveTab: controlledSetTab,
  isAddWorkerModalOpen: controlledAddWorker,
  setIsAddWorkerModalOpen: controlledSetAddWorker,
  isAddServiceModalOpen: controlledAddService,
  setIsAddServiceModalOpen: controlledSetAddService
}) {
  const { user } = useAuth();
  const { 
    workers, 
    addWorker, 
    updateWorker, 
    toggleWorkerStatus,
    services, 
    addService, 
    updateService, 
    deleteService,
    appointments, 
    assignWorkerToAppointment,
    updateAppointmentStatus,
    salonInfo,
    updateSalonSettings,
    showToast
  } = useSalon();

  // Active Tab
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const activeTab = controlledTab !== undefined ? controlledTab : internalActiveTab;
  const setActiveTab = controlledSetTab || setInternalActiveTab;

  // Modal States
  const [internalAddWorker, setInternalAddWorker] = useState(false);
  const isAddWorkerModalOpen = controlledAddWorker !== undefined ? controlledAddWorker : internalAddWorker;
  const setIsAddWorkerModalOpen = controlledSetAddWorker || setInternalAddWorker;

  const [internalAddService, setInternalAddService] = useState(false);
  const isAddServiceModalOpen = controlledAddService !== undefined ? controlledAddService : internalAddService;
  const setIsAddServiceModalOpen = controlledSetAddService || setInternalAddService;

  const [editingWorker, setEditingWorker] = useState(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Senior Stylist',
    experience: '4 Years',
    specialties: 'Hair Styling, Color'
  });

  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Hair Styling',
    price: 1500,
    duration: 60,
    description: '',
    image: ''
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: salonInfo.name,
    address: salonInfo.address,
    phone: salonInfo.phone,
    email: salonInfo.email,
    lat: salonInfo.coordinates?.lat || 17.4319,
    lng: salonInfo.coordinates?.lng || 78.4073,
    weekdays: salonInfo.workingHours?.weekdays || '09:30 AM - 08:30 PM',
    weekends: salonInfo.workingHours?.weekends || '09:00 AM - 09:00 PM'
  });

  // Search & Filter
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Access Control: Owner only!
  if (user?.role !== 'owner') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF7F2]">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-[#E8DEC8] shadow-md space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold">Access Denied</h2>
          <p className="text-xs text-stone-600">
            This dashboard is restricted strictly to the Salon Owner / Administrator.
          </p>
        </div>
      </div>
    );
  }

  // Analytics Calculations
  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgressCount = appointments.filter((a) => a.status === 'in_progress').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentFilter !== 'all' && apt.status !== appointmentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        apt.customerName?.toLowerCase().includes(q) ||
        apt.serviceName?.toLowerCase().includes(q) ||
        apt.workerName?.toLowerCase().includes(q) ||
        apt.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique Customers Derived from Appointments
  const customerMap = {};
  appointments.forEach((apt) => {
    const key = apt.customerEmail || apt.customerPhone || apt.customerName;
    if (!customerMap[key]) {
      customerMap[key] = {
        name: apt.customerName,
        email: apt.customerEmail,
        phone: apt.customerPhone,
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: apt.date
      };
    }
    customerMap[key].totalVisits += 1;
    if (apt.paymentStatus === 'paid') {
      customerMap[key].totalSpent += apt.servicePrice || 0;
    }
  });
  const customerList = Object.values(customerMap);

  // Worker Form Handlers
  const handleSaveWorker = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        updateWorker(editingWorker.id, {
          name: workerFormData.name,
          email: workerFormData.email,
          phone: workerFormData.phone,
          role: workerFormData.role,
          experience: workerFormData.experience,
          specialties: typeof workerFormData.specialties === 'string'
            ? workerFormData.specialties.split(',').map((s) => s.trim())
            : workerFormData.specialties
        });
      } else {
        await addWorker({
          name: workerFormData.name,
          email: workerFormData.email,
          phone: workerFormData.phone,
          role: workerFormData.role,
          experience: workerFormData.experience,
          specialties: workerFormData.specialties.split(',').map((s) => s.trim())
        });
      }
      setIsAddWorkerModalOpen(false);
      setEditingWorker(null);
    } catch {
      // toast shown in context
    }
  };

  const openEditWorker = (worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone || '',
      role: worker.role,
      experience: worker.experience || '3 Years',
      specialties: Array.isArray(worker.specialties) ? worker.specialties.join(', ') : ''
    });
    setIsAddWorkerModalOpen(true);
  };

  // Service Form Handlers
  const handleSaveService = (e) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, serviceFormData);
    } else {
      addService(serviceFormData);
    }
    setIsAddServiceModalOpen(false);
    setEditingService(null);
  };

  const openEditService = (srv) => {
    setEditingService(srv);
    setServiceFormData({
      name: srv.name,
      category: srv.category,
      price: srv.price,
      duration: srv.duration,
      description: srv.description,
      image: srv.image
    });
    setIsAddServiceModalOpen(true);
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSalonSettings({
      name: settingsForm.name,
      address: settingsForm.address,
      phone: settingsForm.phone,
      email: settingsForm.email,
      coordinates: {
        lat: parseFloat(settingsForm.lat),
        lng: parseFloat(settingsForm.lng)
      },
      googleMapsUrl: `https://maps.google.com/?q=${settingsForm.lat},${settingsForm.lng}`,
      workingHours: {
        weekdays: settingsForm.weekdays,
        weekends: settingsForm.weekends
      }
    });
  };

  return (
    <div className={controlledTab ? "space-y-8" : "min-h-screen bg-[#FAF7F2] py-8"}>
      <div className={controlledTab ? "space-y-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"}>
        
        {/* Render fallback internal header and tabs ONLY if not rendered inside AdminLayout */}
        {!controlledTab && (
          <>
            {/* Owner Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#4A2E1B] text-[#FAF7F2] flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                  <ShieldCheck className="w-8 h-8 text-[#D4A373]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#8B5E3C] font-semibold">
                    Executive Owner Administration Console
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#4A2E1B] font-semibold mt-0.5">
                    {salonInfo.name}
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Full authority over staff, service catalog, revenue, payments &amp; booking assignments.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingWorker(null);
                    setWorkerFormData({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'Senior Stylist',
                      experience: '3 Years',
                      specialties: 'Balayage, Styling'
                    });
                    setIsAddWorkerModalOpen(true);
                  }}
                  className="bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#4A2E1B] border border-[#E0D4C7] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  Add Stylist ({workers.length}/5)
                </button>

                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceFormData({
                      name: '',
                      category: 'Hair Styling',
                      price: 2000,
                      duration: 60,
                      description: '',
                      image: ''
                    });
                    setIsAddServiceModalOpen(true);
                  }}
                  className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                  New Service
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-[#E5D7C7] gap-1 sm:gap-2">
              {[
                { id: 'overview', label: 'Overview & Reports', icon: TrendingUp },
                { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
                { id: 'workers', label: `Staff (${workers.length}/5)`, icon: Users },
                { id: 'services', label: `Services (${services.length})`, icon: Scissors },
                { id: 'customers', label: `Clients (${customerList.length})`, icon: UserPlus },
                { id: 'payments', label: 'Payments & Razorpay', icon: DollarSign },
                { id: 'settings', label: 'Salon Settings & Maps', icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition rounded-t-xl ${
                      isActive
                        ? 'bg-white border-t border-x border-[#E5D7C7] text-[#4A2E1B] font-bold shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B5E3C]' : 'text-stone-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ================= TAB 1: OVERVIEW & REPORTS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Total Gross Revenue
                </span>
                <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">
                  &#8377;{totalRevenue.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4% from last month
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Total Bookings
                </span>
                <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">
                  {appointments.length}
                </span>
                <span className="text-[11px] text-stone-500 mt-2 block">
                  {confirmedCount} confirmed &bull; {completedCount} completed
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Active Specialists
                </span>
                <span className="font-serif text-3xl font-bold text-[#8B5E3C] mt-2 block">
                  {workers.filter((w) => w.status === 'active').length} / 5
                </span>
                <span className="text-[11px] text-stone-500 mt-2 block">
                  Capped at 5 maximum master workers
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Average Ticket Value
                </span>
                <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">
                  &#8377;{appointments.length ? Math.round(totalRevenue / (appointments.length || 1)).toLocaleString('en-IN') : 0}
                </span>
                <span className="text-[11px] text-stone-500 mt-2 block">
                  Across all service categories
                </span>
              </div>
            </div>

            {/* Performance Reports by Worker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-[#EAE0D3] shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] flex items-center justify-between">
                  <span>Specialist Workload &amp; Revenue Share</span>
                  <span className="text-xs text-stone-400 font-sans font-normal">Current Month</span>
                </h3>

                <div className="space-y-4">
                  {workers.map((worker) => {
                    const workerApts = appointments.filter((a) => a.workerId === worker.id);
                    const workerRev = workerApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0);
                    const percent = totalRevenue > 0 ? Math.round((workerRev / totalRevenue) * 100) : 0;

                    return (
                      <div key={worker.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-800">{worker.name}</span>
                          <span className="font-medium text-stone-600">
                            &#8377;{workerRev.toLocaleString('en-IN')} ({workerApts.length} bookings)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#8B5E3C] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Treatments Revenue Report */}
              <div className="bg-white rounded-2xl p-6 border border-[#EAE0D3] shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] flex items-center justify-between">
                  <span>Most Popular Treatment Rituals</span>
                  <span className="text-xs text-stone-400 font-sans font-normal">By bookings</span>
                </h3>

                <div className="space-y-3">
                  {services.slice(0, 5).map((srv) => {
                    const count = appointments.filter((a) => a.serviceId === srv.id).length;
                    return (
                      <div key={srv.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                        <div>
                          <p className="text-xs font-semibold text-[#4A2E1B]">{srv.name}</p>
                          <p className="text-[10px] text-stone-500">{srv.category} &bull; {srv.duration} mins</p>
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-[#4A2E1B] block">
                            &#8377;{srv.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {count} bookings
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= REPORTS TAB ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Reports Summary Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
                  Executive Intelligence
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#4A2E1B] mt-0.5">
                  Financial &amp; Operational Reports
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Live synchronized metrics on revenue, stylist productivity, and booking conversions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600 bg-[#FAF7F2] border border-[#E0D4C7] px-3 py-1.5 rounded-xl font-medium">
                  Reporting Period: <strong>Current Financial Month</strong>
                </span>
              </div>
            </div>

            {/* KPI Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Total Gross Revenue
                </span>
                <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">
                  &#8377;{totalRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  &bull; 100% verified collections
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Booking Fulfillment Rate
                </span>
                <span className="font-serif text-3xl font-bold text-emerald-700 mt-2 block">
                  {appointments.length > 0 ? Math.round((completedCount / appointments.length) * 100) : 0}%
                </span>
                <span className="text-[11px] text-stone-500 font-medium block mt-1">
                  {completedCount} of {appointments.length} appointments served
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Specialist Commission Payout
                </span>
                <span className="font-serif text-3xl font-bold text-[#8B5E3C] mt-2 block">
                  &#8377;{Math.round(totalRevenue * 0.5).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-stone-500 font-medium block mt-1">
                  Standard 50% split disbursed
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                  Net Salon Operating Profit
                </span>
                <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">
                  &#8377;{Math.round(totalRevenue * 0.5).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  After stylist commission allocations
                </span>
              </div>
            </div>

            {/* In-Depth Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stylist Leaderboard */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] flex items-center justify-between">
                  <span>Specialist Productivity Leaderboard</span>
                  <span className="text-xs text-stone-400 font-sans font-normal">Active Staff ({workers.length})</span>
                </h3>

                <div className="space-y-3">
                  {workers.map((worker) => {
                    const workerApts = appointments.filter((a) => a.workerId === worker.id);
                    const workerRev = workerApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0);
                    return (
                      <div key={worker.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D3] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#8B5E3C]"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#4A2E1B]">{worker.name}</p>
                            <p className="text-[10px] text-stone-500">{worker.role} &bull; {workerApts.length} bookings</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-[#4A2E1B] block">
                            &#8377;{workerRev.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            Cut: &#8377;{(workerRev * 0.5).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status & Channel Breakdown */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-xs space-y-5">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  Appointment Lifecycle &amp; Conversion Breakdown
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex justify-between items-center">
                    <span className="font-semibold text-emerald-900">Completed Sessions</span>
                    <span className="font-serif font-bold text-emerald-800 text-sm">{completedCount} ({appointments.length > 0 ? Math.round((completedCount/appointments.length)*100) : 0}%)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex justify-between items-center">
                    <span className="font-semibold text-amber-900">In-Progress Right Now</span>
                    <span className="font-serif font-bold text-amber-800 text-sm">{inProgressCount}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Upcoming Confirmed</span>
                    <span className="font-serif font-bold text-blue-800 text-sm">{confirmedCount}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200 flex justify-between items-center">
                    <span className="font-semibold text-red-900">Cancelled / Rejected</span>
                    <span className="font-serif font-bold text-red-800 text-sm">{cancelledCount}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-stone-500 italic">
                  Data reflects real-time MongoDB queries across all customer appointments.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: APPOINTMENTS MASTER & REASSIGNMENT ================= */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by client, stylist, or ID..."
                    className="pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <select
                  value={appointmentFilter}
                  onChange={(e) => setAppointmentFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-700 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <span className="text-xs text-stone-500">
                Showing {filteredAppointments.length} appointments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Date &amp; Time</th>
                    <th className="p-3.5">Client Info</th>
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5">Assigned Specialist</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5 font-mono text-[11px] text-stone-400">
                        {apt.id}
                      </td>
                      <td className="p-3.5 font-medium text-stone-800">
                        {apt.date}
                        <span className="block text-[11px] text-stone-500">{apt.time}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#4A2E1B] block">{apt.customerName}</span>
                        <span className="text-[11px] text-stone-500">{apt.customerPhone}</span>
                      </td>
                      <td className="p-3.5 font-medium text-stone-700">
                        {apt.serviceName}
                      </td>
                      <td className="p-3.5">
                        {/* Worker Reassignment Dropdown */}
                        <select
                          value={apt.workerId}
                          onChange={(e) => assignWorkerToAppointment(apt.id, e.target.value)}
                          className="bg-[#FAF7F2] border border-[#D5C2B1] rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none"
                        >
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5 font-serif font-bold text-stone-800">
                        &#8377;{apt.servicePrice?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={apt.status}
                          onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none ${
                            apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : apt.status === 'cancelled'
                              ? 'bg-stone-200 text-stone-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this appointment entry permanently?')) {
                              updateAppointmentStatus(apt.id, 'cancelled');
                            }
                          }}
                          className="text-stone-400 hover:text-red-600 p-1 rounded transition"
                          title="Cancel appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: WORKER MANAGEMENT (MAX 5) ================= */}
        {activeTab === 'workers' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header with 5-Worker Limit Notice */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE0D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  Specialist Team Roster ({workers.length} of 5 Active Slots)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  The salon operates with an exclusive cohort of up to 5 master stylists to maintain boutique quality.
                </p>
              </div>

              <button
                disabled={workers.length >= 5}
                onClick={() => {
                  setEditingWorker(null);
                  setWorkerFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'Senior Stylist',
                    experience: '3 Years',
                    specialties: 'Hair, Skin'
                  });
                  setIsAddWorkerModalOpen(true);
                }}
                className="bg-[#4A2E1B] hover:bg-[#341F11] disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D4A373]" />
                {workers.length >= 5 ? 'Max Limit (5/5) Reached' : 'Add New Specialist'}
              </button>
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl p-6 border border-[#EAE0D3] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#E5D7C7]"
                      />
                      <div>
                        <h4 className="font-serif font-semibold text-[#4A2E1B] text-base">
                          {worker.name}
                        </h4>
                        <p className="text-xs text-[#8B5E3C] font-medium">{worker.role}</p>
                        <p className="text-[11px] text-stone-400">{worker.email}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        worker.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : worker.status === 'on_break'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <span className="font-medium text-stone-800">{worker.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Experience:</span>
                      <span className="font-medium text-stone-800">{worker.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Rating:</span>
                      <span className="font-bold text-amber-600">&#9733; {worker.rating || 4.9}</span>
                    </div>
                  </div>

                  {/* Worker Controls */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditWorker(worker)}
                      className="flex-1 bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#4A2E1B] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      Edit Details
                    </button>

                    <button
                      onClick={() =>
                        toggleWorkerStatus(
                          worker.id,
                          worker.status === 'deactivated' ? 'active' : 'deactivated'
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        worker.status === 'deactivated'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {worker.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SERVICES MANAGEMENT ================= */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  Treatment Menu Catalog ({services.length} items)
                </h3>
                <p className="text-xs text-stone-500">
                  Update service fees, allocated durations, and customer-facing descriptions.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceFormData({
                    name: '',
                    category: 'Hair Styling',
                    price: 2000,
                    duration: 60,
                    description: '',
                    image: ''
                  });
                  setIsAddServiceModalOpen(true);
                }}
                className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                Add New Service
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Service Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={srv.image}
                            alt={srv.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="font-semibold text-[#4A2E1B]">{srv.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[10px] font-medium text-stone-700">
                          {srv.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-serif font-bold text-stone-900 text-sm">
                        &#8377;{srv.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-medium text-stone-600">
                        {srv.duration} mins
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-stone-500">
                        {srv.description}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditService(srv)}
                          className="text-[#8B5E3C] hover:text-[#4A2E1B] p-1.5 rounded-lg hover:bg-[#FAF7F2] transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete service "${srv.name}"?`)) {
                              deleteService(srv.id);
                            }
                          }}
                          className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CUSTOMER DIRECTORY ================= */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs p-6 space-y-6 animate-in fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
              Registered Salon Clientele ({customerList.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Total Visits</th>
                    <th className="p-3.5">Total Spend</th>
                    <th className="p-3.5">Last Appointment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customerList.map((cust, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition">
                      <td className="p-3.5 font-semibold text-[#4A2E1B]">
                        {cust.name}
                      </td>
                      <td className="p-3.5">
                        <span className="block text-stone-800">{cust.email}</span>
                        <span className="block text-stone-500 text-[11px]">{cust.phone}</span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-800">
                        {cust.totalVisits} sessions
                      </td>
                      <td className="p-3.5 font-serif font-bold text-emerald-800">
                        &#8377;{cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {cust.lastVisit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: PAYMENTS & RAZORPAY TRANSACTIONS ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  Payment Ledger &amp; Razorpay Transactions
                </h3>
                <p className="text-xs text-stone-500">
                  Verified payment orders, HMAC signature audits, and cash receipts.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Razorpay Test Mode Active
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Treatment</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Gross Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5 text-stone-600">{apt.date}</td>
                      <td className="p-3.5 font-mono text-[11px] text-stone-700">
                        {apt.transactionId || 'pay_test_' + apt.id.slice(-6)}
                      </td>
                      <td className="p-3.5 font-semibold text-[#4A2E1B]">{apt.customerName}</td>
                      <td className="p-3.5 text-stone-700">{apt.serviceName}</td>
                      <td className="p-3.5 uppercase font-medium text-stone-600">
                        {apt.paymentMethod}
                      </td>
                      <td className="p-3.5 font-serif font-bold text-stone-900">
                        &#8377;{apt.servicePrice?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {apt.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: SALON SETTINGS & GOOGLE MAPS ================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs p-8 space-y-6 animate-in fade-in max-w-3xl">
            <h3 className="font-serif text-xl font-semibold text-[#4A2E1B]">
              Salon Location &amp; Operating Hours Configuration
            </h3>
            <p className="text-xs text-stone-500">
              Changes reflect immediately on the customer portal and Google Maps interactive locator.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Salon Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Concierge Phone
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                Full Physical Address (Google Maps Target)
              </label>
              <textarea
                rows="2"
                required
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Latitude Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={settingsForm.lat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, lat: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Longitude Coordinate
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={settingsForm.lng}
                  onChange={(e) => setSettingsForm({ ...settingsForm, lng: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Weekday Hours (Mon - Fri)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.weekdays}
                  onChange={(e) => setSettingsForm({ ...settingsForm, weekdays: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Weekend Hours (Sat - Sun)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.weekends}
                  onChange={(e) => setSettingsForm({ ...settingsForm, weekends: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              Save Salon Settings
            </button>
          </form>
        )}

        {/* ================= MODAL: ADD / EDIT WORKER ================= */}
        {isAddWorkerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#E8DEC8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  {editingWorker ? 'Edit Specialist Profile' : 'Add New Specialist (Max 5)'}
                </h3>
                <button
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWorker} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Specialist Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Staff Email (Used for Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={workerFormData.role}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value })}
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                      Years Experience
                    </label>
                    <input
                      type="text"
                      value={workerFormData.experience}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, experience: e.target.value })}
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Specialties (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={workerFormData.specialties}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, specialties: e.target.value })}
                    placeholder="Balayage, Scalp Treatment, Blowout"
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddWorkerModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#4A2E1B] hover:bg-[#341F11] text-white py-2.5 rounded-xl font-semibold uppercase tracking-wider"
                  >
                    {editingWorker ? 'Update Stylist' : 'Add Stylist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT SERVICE ================= */}
        {isAddServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#E8DEC8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  {editingService ? 'Edit Treatment Details' : 'Add New Treatment Service'}
                </h3>
                <button
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Treatment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                      Category
                    </label>
                    <select
                      value={serviceFormData.category}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none"
                    >
                      <option value="Hair Styling">Hair Styling</option>
                      <option value="Coloring">Coloring</option>
                      <option value="Spa & Facials">Spa &amp; Facials</option>
                      <option value="Nail Care">Nail Care</option>
                      <option value="Men's Grooming">Men&apos;s Grooming</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                      Price (&#8377; INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                      className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    step="15"
                    min="15"
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Description &amp; Ritual Details
                  </label>
                  <textarea
                    rows="2"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={serviceFormData.image}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddServiceModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#4A2E1B] hover:bg-[#341F11] text-white py-2.5 rounded-xl font-semibold uppercase tracking-wider"
                  >
                    {editingService ? 'Update Service' : 'Save Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

