import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Play,
  CheckCircle,
  DollarSign,
  Sparkles,
  Filter,
  AlertCircle,
  Coffee,
  Check,
  ChevronRight,
  ShieldAlert,
  Star,
  Award,
  CalendarDays,
  Users,
  Search,
  MapPin
} from 'lucide-react';

export default function WorkerDashboard({
  activeTab: controlledTab = 'dashboard',
  setActiveTab: controlledSetTab
}) {
  const { user } = useAuth();
  const { workers, appointments, updateAppointmentStatus, toggleWorkerStatus, showToast } = useSalon();

  // Selected date filter (default: today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateFilter, setSelectedDateFilter] = useState(todayStr);
  const [customerSearch, setCustomerSearch] = useState('');

  // Find the active worker profile
  const currentWorker = workers.find((w) => w.id === user?.workerId || w.email === user?.email) || workers[0];

  // Appointments assigned to this worker
  const workerAppointments = appointments.filter((apt) => apt.workerId === currentWorker?.id);

  // Today / Selected date queue
  const queueAppointments = workerAppointments.filter(
    (apt) => apt.date === selectedDateFilter && apt.status !== 'cancelled'
  );

  const completedAppointments = workerAppointments.filter((apt) => apt.status === 'completed');
  const inProgressAppointments = workerAppointments.filter((apt) => apt.status === 'in_progress');
  const upcomingAppointments = workerAppointments.filter((apt) => apt.status === 'confirmed');

  // Calculate earnings (50% commission split standard for master stylists)
  const totalEarned = completedAppointments.reduce((sum, apt) => sum + (apt.servicePrice || 0) * 0.5, 0);
  const todayEarned = completedAppointments
    .filter((apt) => apt.date === todayStr)
    .reduce((sum, apt) => sum + (apt.servicePrice || 0) * 0.5, 0);

  // Unique customers for this worker
  const clientMap = {};
  workerAppointments.forEach((apt) => {
    const key = apt.customerEmail || apt.customerPhone || apt.customerName;
    if (!clientMap[key]) {
      clientMap[key] = {
        name: apt.customerName,
        phone: apt.customerPhone,
        email: apt.customerEmail,
        totalSessions: 0,
        lastDate: apt.date,
        services: new Set(),
        notes: apt.notes || 'No special requests recorded'
      };
    }
    clientMap[key].totalSessions += 1;
    clientMap[key].services.add(apt.serviceName);
    if (apt.date > clientMap[key].lastDate) {
      clientMap[key].lastDate = apt.date;
    }
  });
  const clientList = Object.values(clientMap);

  const handleStartAppointment = (aptId) => {
    updateAppointmentStatus(aptId, 'in_progress');
    showToast('Appointment marked in-progress. Enjoy the session!');
  };

  const handleCompleteAppointment = (aptId) => {
    updateAppointmentStatus(aptId, 'completed');
    showToast('Appointment completed! Commission credited to your earnings.');
  };

  const handleToggleDuty = (status) => {
    if (currentWorker) {
      toggleWorkerStatus(currentWorker.id, status);
      const label = status === 'active' ? 'On Duty' : status === 'on_break' ? 'On Break' : 'Off Duty';
      showToast(`Availability status updated to ${label}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* ================= VIEW 1: MY DASHBOARD ================= */}
      {controlledTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Performance & Earnings Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                Today's Clients
              </span>
              <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-1 block">
                {workerAppointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length}
              </span>
              <span className="text-[11px] text-stone-500 mt-2 block">
                Assigned for {todayStr}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                In-Progress Active
              </span>
              <span className="font-serif text-3xl font-bold text-amber-600 mt-1 block">
                {inProgressAppointments.length}
              </span>
              <span className="text-[11px] text-stone-500 mt-2 block">
                Currently seated at station
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                Today's Earnings (50% Cut)
              </span>
              <span className="font-serif text-3xl font-bold text-emerald-700 mt-1 block">
                &#8377;{todayEarned.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500 mt-2 block">
                From completed appointments today
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                Total Career Commission
              </span>
              <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-1 block">
                &#8377;{(totalEarned + 45000).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500 mt-2 block">
                {completedAppointments.length + 18} total appointments completed
              </span>
            </div>
          </div>

          {/* Quick Queue Snapshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold">
                  Today's Queue
                </span>
                <h2 className="font-serif text-2xl font-semibold text-[#4A2E1B] mt-0.5">
                  Immediate Client Appointments
                </h2>
              </div>

              {controlledSetTab && (
                <button
                  onClick={() => controlledSetTab('appointments')}
                  className="text-xs font-semibold text-[#8B5E3C] hover:text-[#4A2E1B] flex items-center gap-1 group"
                >
                  <span>Open Full Queue &amp; Calendar</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </button>
              )}
            </div>

            {queueAppointments.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#FAF7F2] border border-dashed border-[#E0D4C7] space-y-2">
                <Coffee className="w-8 h-8 text-[#8B5E3C] mx-auto opacity-60" />
                <p className="font-serif text-base text-[#4A2E1B] font-medium">
                  Your styling station is clear for today
                </p>
                <p className="text-xs text-stone-500">
                  New client bookings assigned by the salon owner will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {queueAppointments.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D3] flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#8B5E3C] bg-white px-2.5 py-1 rounded-md border border-[#E0D4C7]">
                        {apt.time}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : apt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#4A2E1B]">
                        {apt.serviceName}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Client: <strong className="font-semibold text-stone-800">{apt.customerName}</strong> ({apt.customerPhone})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-mono">Commission: &#8377;{((apt.servicePrice || 0) * 0.5).toLocaleString('en-IN')}</span>
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStartAppointment(apt.id)}
                          className="bg-[#8B5E3C] hover:bg-[#724A2E] text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition"
                        >
                          Start Session
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteAppointment(apt.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition"
                        >
                          Complete Service
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <span className="text-emerald-700 font-semibold text-xs">&#10003; Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: MY APPOINTMENTS QUEUE ================= */}
      {controlledTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
                Appointments Queue
              </span>
              <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#8B5E3C]" />
                Assigned Specialist Schedule
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-stone-600">Filter Date:</span>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
              />
            </div>
          </div>

          {queueAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-[#EAE0D3] text-center space-y-3 shadow-xs">
              <Coffee className="w-12 h-12 text-[#8B5E3C] mx-auto opacity-50" />
              <h3 className="font-serif text-lg text-[#4A2E1B] font-semibold">
                No appointments scheduled for {selectedDateFilter}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No customer bookings are currently scheduled for this date. Check another date or await owner assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {queueAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                        {apt.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : apt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-[#4A2E1B] mt-3">
                      {apt.serviceName}
                    </h3>

                    <div className="mt-4 bg-[#FAF7F2] p-4 rounded-2xl space-y-2 text-xs border border-stone-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Customer:</span>
                        <span className="font-bold text-[#4A2E1B]">{apt.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Phone:</span>
                        <a href={`tel:${apt.customerPhone}`} className="text-[#8B5E3C] font-semibold hover:underline">
                          {apt.customerPhone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Scheduled Time:</span>
                        <span className="font-semibold text-stone-800">{apt.time} ({apt.serviceDuration} mins)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Service Fee:</span>
                        <span className="font-mono font-medium text-stone-700">&#8377;{apt.servicePrice?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                        <span className="text-stone-500 font-semibold">Your Cut (50%):</span>
                        <span className="font-serif font-bold text-emerald-700 text-sm">&#8377;{((apt.servicePrice || 0) * 0.5).toLocaleString('en-IN')}</span>
                      </div>
                      {apt.notes && (
                        <div className="pt-2 border-t border-stone-200 text-stone-600 italic">
                          &ldquo;{apt.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Worker Action Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleStartAppointment(apt.id)}
                        className="flex-1 bg-[#8B5E3C] hover:bg-[#724A2E] text-white py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Appointment
                      </button>
                    )}

                    {apt.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteAppointment(apt.id)}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete Service
                      </button>
                    )}

                    {apt.status === 'completed' && (
                      <div className="w-full text-center text-xs text-emerald-700 font-semibold py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        &#10003; Service Completed &bull; &#8377;{((apt.servicePrice || 0) * 0.5).toLocaleString('en-IN')} Earned
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 3: CUSTOMER DETAILS ================= */}
      {controlledTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
                Client Roster
              </span>
              <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B5E3C]" />
                Customer Profiles &amp; Treatment History
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-stone-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clientList
              .filter((c) => 
                !customerSearch || 
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone?.includes(customerSearch)
              )
              .map((client, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#4A2E1B] border border-[#E0D4C7] flex items-center justify-center font-serif text-lg font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-semibold text-[#4A2E1B] truncate">
                        {client.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-mono">
                        {client.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl text-xs space-y-1.5 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Sessions Completed:</span>
                      <span className="font-bold text-[#4A2E1B]">{client.totalSessions} visit(s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Last Appointment:</span>
                      <span className="font-medium text-stone-700">{client.lastDate}</span>
                    </div>
                    <div className="pt-1.5 border-t border-stone-200">
                      <span className="text-[11px] text-stone-500 block mb-1">Booked Treatments:</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(client.services).map((srv, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white border border-[#E0D4C7] text-[#8B5E3C] text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      Client Note: &ldquo;{client.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= VIEW 4: MY SCHEDULE ================= */}
      {controlledTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
              Weekly Schedule
            </span>
            <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#8B5E3C]" />
              Styling Calendar &amp; Studio Working Hours
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Standard salon operational hours: Weekdays 09:30 AM – 08:30 PM &bull; Weekends 09:00 AM – 09:00 PM
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-semibold text-[#4A2E1B]">
                Operating Shifts &amp; Breaks
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE0D3] flex justify-between">
                  <span className="font-semibold text-stone-700">Morning Shift</span>
                  <span className="text-[#8B5E3C] font-bold">09:30 AM &ndash; 02:00 PM</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex justify-between">
                  <span className="font-semibold text-amber-900">Tea &amp; Sanitization Break</span>
                  <span className="text-amber-700 font-bold">02:00 PM &ndash; 02:45 PM</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE0D3] flex justify-between">
                  <span className="font-semibold text-stone-700">Evening Shift</span>
                  <span className="text-[#8B5E3C] font-bold">02:45 PM &ndash; 08:30 PM</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-semibold text-[#4A2E1B]">
                Upcoming Scheduled Days
              </h3>

              <div className="space-y-2.5">
                {['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18'].map((date) => {
                  const dayApts = workerAppointments.filter((a) => a.date === date);
                  return (
                    <div
                      key={date}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D3] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#4A2E1B]">{date}</span>
                        <p className="text-[11px] text-stone-500">
                          {dayApts.length} booking(s) assigned
                        </p>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          dayApts.length > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {dayApts.length > 0 ? 'Booked' : 'Available'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 5: MY EARNINGS & COMMISSION ================= */}
      {controlledTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
              Commission Ledger
            </span>
            <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#8B5E3C]" />
              Personal Earnings &amp; Commission Breakdown
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Guaranteed 50.0% revenue split on every completed client session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#EAE0D3] shadow-xs">
              <span className="text-xs uppercase text-stone-500 font-semibold block">Commission Cut</span>
              <span className="font-serif text-3xl font-bold text-[#8B5E3C] mt-2 block">50.0%</span>
              <p className="text-[11px] text-stone-500 mt-1">Split evenly on all service fees</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#EAE0D3] shadow-xs">
              <span className="text-xs uppercase text-stone-500 font-semibold block">Today's Payout</span>
              <span className="font-serif text-3xl font-bold text-emerald-700 mt-2 block">&#8377;{todayEarned.toLocaleString('en-IN')}</span>
              <p className="text-[11px] text-stone-500 mt-1">Auto-credited upon completing services</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#EAE0D3] shadow-xs">
              <span className="text-xs uppercase text-stone-500 font-semibold block">Payout Cycle</span>
              <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-2 block">Weekly</span>
              <p className="text-[11px] text-stone-500 mt-1">Direct bank disbursement every Monday</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
              Completed Appointments Commission History
            </h3>

            {completedAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-[#FAF7F2] rounded-2xl">
                No completed service history recorded yet. Complete assigned appointments to generate commission earnings.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-3.5">Date &amp; Time</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Treatment</th>
                      <th className="p-3.5">Ticket Price</th>
                      <th className="p-3.5">Your 50% Cut</th>
                      <th className="p-3.5">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {completedAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-stone-50 transition">
                        <td className="p-3.5 font-medium text-stone-800">
                          {apt.date} &bull; {apt.time}
                        </td>
                        <td className="p-3.5 font-semibold text-[#4A2E1B]">
                          {apt.customerName}
                        </td>
                        <td className="p-3.5 text-stone-700">
                          {apt.serviceName}
                        </td>
                        <td className="p-3.5 font-mono text-stone-600">
                          &#8377;{apt.servicePrice?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-serif font-bold text-emerald-700 text-sm">
                          &#8377;{((apt.servicePrice || 0) * 0.5).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {apt.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 6: SPECIALIST PROFILE ================= */}
      {controlledTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8B5E3C] font-semibold">
              Specialist Credentials
            </span>
            <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-[#8B5E3C]" />
              Stylist Profile &amp; Bio
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#EAE0D3] shadow-xs flex flex-col md:flex-row gap-8 items-start">
            <div className="text-center md:text-left space-y-3">
              <img
                src={currentWorker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={currentWorker?.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-[#E0D4C7] shadow-md mx-auto md:mx-0"
              />
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-600 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{currentWorker?.rating || 4.9} Client Rating</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B5E3C]">
                  {currentWorker?.role}
                </span>
                <h3 className="font-serif text-3xl font-semibold text-[#4A2E1B] mt-0.5">
                  {currentWorker?.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Experience: {currentWorker?.experience || '4 Years Professional Atelier Experience'}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail className="w-4 h-4 text-[#8B5E3C]" />
                  <span>{currentWorker?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-4 h-4 text-[#8B5E3C]" />
                  <span>{currentWorker?.phone || '+91 98765 43210'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-[#4A2E1B] block mb-2">Core Specializations:</span>
                <div className="flex flex-wrap gap-2">
                  {currentWorker?.specialties?.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-[#FAF7F2] border border-[#E0D4C7] text-[#8B5E3C] text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
