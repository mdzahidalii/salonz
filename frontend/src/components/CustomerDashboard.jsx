import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  XCircle, 
  CreditCard, 
  Receipt,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CustomerDashboard({ onOpenBookModal }) {
  const { user } = useAuth();
  const { appointments, cancelAppointment, rescheduleAppointment, isSlotAvailable, showToast } = useSalon();

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Filter appointments for the current customer (by email, customerId, or name)
  const customerEmail = user?.email?.toLowerCase();
  const customerId = user?.id;
  const myAppointments = appointments.filter(
    (apt) =>
      (customerEmail && apt.customerEmail?.toLowerCase() === customerEmail) ||
      (customerId && apt.customerId === customerId) ||
      (!customerEmail && apt.customerName?.toLowerCase() === user?.name?.toLowerCase())
  );

  const upcoming = myAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'in_progress' || apt.status === 'pending'
  );
  const past = myAppointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'rejected'
  );

  const TIME_SLOTS = [
    "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", 
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", 
    "06:00 PM", "07:00 PM"
  ];

  const handleOpenReschedule = (apt) => {
    setRescheduleTarget(apt);
    setNewDate(apt.date);
    setNewTime(apt.time);
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate || !newTime) return;

    try {
      rescheduleAppointment(rescheduleTarget.id, newDate, newTime);
      setRescheduleTarget(null);
    } catch {
      // toast shown in context
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile / Welcome Header */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8DEC8] shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF3EC] text-[#8B5E3C] border-2 border-[#E5D7C7] flex items-center justify-center font-serif text-2xl font-bold">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#8B5E3C] font-semibold">
                Customer Sanctuary Portal
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#4A2E1B] font-semibold mt-0.5">
                Welcome back, {user?.name || 'Guest'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {user?.email} &bull; {user?.phone || '+91 99887 76655'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenBookModal()}
            className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-6 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            Book New Ritual
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
              Active Bookings
            </span>
            <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-1 block">
              {upcoming.length}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
              Completed Rituals
            </span>
            <span className="font-serif text-3xl font-bold text-[#4A2E1B] mt-1 block">
              {past.filter((p) => p.status === 'completed').length}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAE0D3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
              Loyalty Tier
            </span>
            <span className="font-serif text-2xl font-bold text-[#8B5E3C] mt-1 block">
              Gold Privilege
            </span>
          </div>
        </div>

        {/* Upcoming Appointments Section */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#4A2E1B] font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8B5E3C]" />
              Upcoming Scheduled Appointments
            </h2>
            <span className="text-xs text-stone-500">
              {upcoming.length} scheduled
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#EAE0D3] text-center space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-base text-stone-700 font-medium">No upcoming appointments</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You currently have no scheduled appointments. Treat yourself to a relaxing hair or spa session.
              </p>
              <button
                onClick={() => onOpenBookModal()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5E3C] hover:text-[#4A2E1B]"
              >
                Schedule an appointment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-6 border border-[#EAE0D3] shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#8B5E3C]"></div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        {apt.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        apt.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : apt.status === 'cancelled'
                          ? 'bg-stone-200 text-stone-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] mt-2">
                      {apt.serviceName}
                    </h3>

                    <div className="space-y-1.5 mt-3 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span className="font-medium text-stone-800">{apt.date}</span> at <span className="font-medium text-stone-800">{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span>Stylist: <strong className="text-stone-800">{apt.workerName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-[#8B5E3C]" />
                        <span>Payment: <strong className="uppercase text-emerald-700">{apt.paymentStatus}</strong> via {apt.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reschedule & Cancel */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="flex-1 bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#4A2E1B] border border-[#E5D7C7] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      Reschedule
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you wish to cancel this appointment?')) {
                          cancelAppointment(apt.id);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking History & Past Appointments */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-[#4A2E1B] font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#8B5E3C]" />
            Past Appointments &amp; Invoices
          </h2>

          <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-xs overflow-hidden">
            {past.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No past appointment history yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Treatment</th>
                      <th className="p-4">Specialist</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {past.map((apt) => (
                      <tr key={apt.id} className="hover:bg-stone-50 transition">
                        <td className="p-4 font-medium text-stone-800">
                          {apt.date} &bull; {apt.time}
                        </td>
                        <td className="p-4 font-semibold text-[#4A2E1B]">
                          {apt.serviceName}
                        </td>
                        <td className="p-4 text-stone-600">
                          {apt.workerName}
                        </td>
                        <td className="p-4 font-bold font-serif text-stone-800">
                          &#8377;{apt.servicePrice?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[11px] text-stone-600 block">
                            {apt.transactionId || 'CASH'}
                          </span>
                          <span className="text-[10px] uppercase text-emerald-700 font-semibold">
                            {apt.paymentStatus} ({apt.paymentMethod})
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {apt.status}
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

        {/* Reschedule Modal */}
        {rescheduleTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#E8DEC8] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <h3 className="font-serif text-lg font-semibold text-[#4A2E1B]">
                  Reschedule Appointment
                </h3>
                <button
                  onClick={() => setRescheduleTarget(null)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Service: <strong>{rescheduleTarget.serviceName}</strong> with <strong>{rescheduleTarget.workerName}</strong>
              </p>

              <form onSubmit={handleConfirmReschedule} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-2">
                    Available Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {TIME_SLOTS.map((slot) => {
                      const available = isSlotAvailable(rescheduleTarget.workerId, newDate, slot, rescheduleTarget.id);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!available}
                          onClick={() => setNewTime(slot)}
                          className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                            !available
                              ? 'bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed'
                              : newTime === slot
                              ? 'bg-[#4A2E1B] text-white border-[#4A2E1B]'
                              : 'bg-white border-stone-200 hover:border-[#8B5E3C]'
                          }`}
                        >
                          {slot} {!available && '(Occupied)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRescheduleTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#4A2E1B] hover:bg-[#341F11] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition"
                  >
                    Confirm Date
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

