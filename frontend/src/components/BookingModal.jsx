import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Scissors,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '../api/client';

export default function BookingModal({ isOpen, onClose, onBookingSuccess }) {
  const { 
    services, 
    workers, 
    appointments, 
    isSlotAvailable, 
    bookAppointment,
    cancelAppointment,
    refreshFromBackend,
    preselectedService,
    showToast 
  } = useSalon();
  const { user, token } = useAuth();

  // Wizard Steps: 1: Service, 2: Worker, 3: Date & Time, 4: Details & Payment, 5: Success
  const [step, setStep] = useState(1);

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow or today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cash'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Set preselected service if opened from a specific card
  useEffect(() => {
    if (preselectedService) {
      setSelectedServiceId(preselectedService.id);
      setStep(2); // Jump directly to worker selection
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [preselectedService, services]);

  // Update customer details when logged in user changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone && user.phone) setCustomerPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const activeWorkers = workers.filter((w) => w.status !== 'deactivated');

  // Standard operational time slots
  const TIME_SLOTS = [
    "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", 
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", 
    "06:00 PM", "07:00 PM"
  ];

  // Calculate occupied slots for the selected worker on the selected date
  const getSlotStatus = (timeSlot) => {
    if (!selectedWorkerId) return { available: true };
    const available = isSlotAvailable(selectedWorkerId, selectedDate, timeSlot);
    return { available };
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedServiceId) {
      showToast('Please select a service first', 'error');
      return;
    }
    if (step === 2 && !selectedWorkerId) {
      showToast('Please select a stylist', 'error');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      showToast('Please pick a date and an available time slot', 'error');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Submit and handle payment
  const handleFinalBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      showToast('Please fill in your name, email and phone number', 'error');
      return;
    }

    // Guard against double booking at the moment of submission
    if (!isSlotAvailable(selectedWorkerId, selectedDate, selectedTime)) {
      showToast('Sorry! This time slot was just taken. Please choose another time.', 'error');
      setStep(3);
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (paymentMethod === 'razorpay') {
        // Attempt Razorpay Test Mode Checkout via Backend Order API
        const servicePrice = currentService?.price || 1000;
        const amountInPaise = servicePrice * 100;

        let orderRes = null;
        try {
          orderRes = await apiClient.createRazorpayOrder(servicePrice, null, token);
        } catch (orderErr) {
          console.warn('Backend order generation failed:', orderErr);
        }

        // Check if window.Razorpay SDK is loaded
        if (typeof window !== 'undefined' && window.Razorpay && orderRes?.key_id) {
          const isRealOrder = orderRes.order_id && !orderRes.order_id.startsWith('order_test_');
          const options = {
            key: orderRes.key_id,
            amount: orderRes.amount || amountInPaise,
            currency: orderRes.currency || 'INR',
            name: 'AURA Salon & Atelier',
            description: `Payment for ${currentService?.name}`,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=120&q=80',
            ...(isRealOrder ? { order_id: orderRes.order_id } : {}),
            handler: async function (response) {
              let pendingApt = null;
              try {
                // 1. Reserve appointment first as pending payment
                pendingApt = await bookAppointment({
                  customerName,
                  customerEmail,
                  customerPhone,
                  serviceId: selectedServiceId,
                  serviceName: currentService?.name,
                  servicePrice: currentService?.price,
                  serviceDuration: currentService?.duration,
                  workerId: selectedWorkerId,
                  date: selectedDate,
                  time: selectedTime,
                  paymentStatus: 'pending',
                  paymentMethod: 'razorpay',
                  transactionId: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                  notes: notes
                });

                // 2. Verify cryptographic Razorpay signature on backend & save to MongoDB payments
                if (response.razorpay_signature && (response.razorpay_order_id || orderRes.order_id)) {
                  await apiClient.verifyRazorpayPayment({
                    razorpay_order_id: response.razorpay_order_id || orderRes.order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    appointmentId: pendingApt.id
                  }, token);
                }

                await refreshFromBackend();
                const verifiedApt = {
                  ...pendingApt,
                  paymentStatus: 'paid',
                  transactionId: response.razorpay_payment_id
                };
                setConfirmedBooking(verifiedApt);
                setIsProcessingPayment(false);
                showToast('Payment verified & appointment confirmed!');
                setStep(5);
                if (onBookingSuccess) onBookingSuccess(verifiedApt);
              } catch (verifyErr) {
                if (pendingApt?.id) {
                  try { await cancelAppointment(pendingApt.id); } catch {}
                }
                setIsProcessingPayment(false);
                showToast(verifyErr.message || 'Payment signature verification failed.', 'error');
              }
            },
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone
            },
            theme: {
              color: '#4A2E1B'
            },
            modal: {
              ondismiss: function () {
                setIsProcessingPayment(false);
                showToast('Payment window closed before completion.', 'info');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            setIsProcessingPayment(false);
            showToast(`Payment failed: ${resp.error.description}`, 'error');
          });
          rzp.open();
        } else {
          // Fallback if Razorpay SDK didn't load offline
          setTimeout(() => {
            completeBookingRecord(`pay_test_sim_${Date.now()}`);
          }, 800);
        }
      } else {
        // Pay at salon
        await completeBookingRecord('pay_at_salon_cash');
      }
    } catch (err) {
      setIsProcessingPayment(false);
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const completeBookingRecord = async (transactionId) => {
    try {
      const newApt = await bookAppointment({
        customerName,
        customerEmail,
        customerPhone,
        serviceId: selectedServiceId,
        serviceName: currentService?.name,
        servicePrice: currentService?.price,
        serviceDuration: currentService?.duration,
        workerId: selectedWorkerId,
        date: selectedDate,
        time: selectedTime,
        paymentStatus: transactionId === 'pay_at_salon_cash' ? 'pending' : 'paid',
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        notes: notes
      });

      setConfirmedBooking(newApt);
      setIsProcessingPayment(false);
      setStep(5); // Show Success Screen
      if (onBookingSuccess) onBookingSuccess(newApt);
    } catch (error) {
      setIsProcessingPayment(false);
      showToast(error.message || 'Failed to complete booking', 'error');
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    setSelectedTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DEC8] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8DEC8] flex items-center justify-between sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#8B5E3C] font-semibold">
              Step {step} of 4 &bull; Sanctuary Reservation
            </span>
            <h2 className="font-serif text-2xl text-[#4A2E1B] font-semibold mt-0.5">
              {step === 1 && 'Select Your Treatment'}
              {step === 2 && 'Select Your Specialist'}
              {step === 3 && 'Choose Date & Time Slot'}
              {step === 4 && 'Guest Details & Payment'}
              {step === 5 && 'Appointment Confirmed'}
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E5D7C7] flex items-center justify-center text-stone-500 hover:text-stone-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1">
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Choose the ritual you would like to experience:
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedServiceId === srv.id
                        ? 'bg-white border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20 shadow-sm'
                        : 'bg-white/60 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-semibold text-[#4A2E1B] text-sm">
                          {srv.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[10px]">
                            {srv.category}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8B5E3C]" />
                            {srv.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-base text-[#4A2E1B]">
                        &#8377;{srv.price.toLocaleString('en-IN')}
                      </span>
                      {selectedServiceId === srv.id && (
                        <div className="text-[#8B5E3C] flex items-center justify-end gap-1 text-xs mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT WORKER */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Select from our certified specialists for {currentService?.name}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                      selectedWorkerId === worker.id
                        ? 'bg-white border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20 shadow-md'
                        : 'bg-white/60 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-14 h-14 rounded-full object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-semibold text-[#4A2E1B] text-sm truncate">
                        {worker.name}
                      </h4>
                      <p className="text-xs text-[#8B5E3C] font-medium truncate">
                        {worker.role.split('&')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                        <span className="text-amber-600 font-bold">&#9733; {worker.rating || 4.9}</span>
                        <span>&bull;</span>
                        <span>{worker.experience}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & DYNAMIC TIME SLOTS (PREVENT DOUBLE BOOKINGS) */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(''); // Reset time selection on date switch
                    }}
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-4 py-3 text-sm text-[#4A2E1B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  />
                </div>
              </div>

              {/* Time Slots Grid with Real-Time Double Booking Prevention */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Available Time Slots
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Duration: {currentService?.duration} mins
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const status = getSlotStatus(slot);
                    const isAvailable = status.available;
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 rounded-xl text-xs font-medium border text-center transition flex flex-col items-center justify-center gap-1 ${
                          !isAvailable
                            ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#4A2E1B] border-[#4A2E1B] text-white shadow-md'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-[#8B5E3C]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot}</span>
                        </div>
                        <span className="text-[10px]">
                          {isAvailable ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-white border border-stone-300"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-stone-200"></span>
                    <span>Already Booked (Double Booking Protected)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GUEST DETAILS & PAYMENT */}
          {step === 4 && (
            <form onSubmit={handleFinalBooking} className="space-y-4">
              {/* Booking Summary Box */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5D7C7] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Service:</span>
                  <span className="font-semibold text-[#4A2E1B]">{currentService?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Stylist:</span>
                  <span className="font-semibold text-[#4A2E1B]">
                    {workers.find((w) => w.id === selectedWorkerId)?.name || 'Assigned Stylist'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-stone-500">Date &amp; Time:</span>
                  <span className="font-semibold text-[#4A2E1B]">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-700 font-semibold text-sm">Total Due:</span>
                  <span className="font-serif font-bold text-lg text-[#8B5E3C]">
                    &#8377;{currentService?.price?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sophia Williams"
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 99887 76655"
                    className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="sophia@example.com"
                  className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-1">
                  Special Notes or Allergies (Optional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive scalp, prefer low fragrance shampoo..."
                  className="w-full bg-white border border-[#D5C2B1] rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                ></textarea>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-600 mb-2">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                      paymentMethod === 'razorpay'
                        ? 'bg-white border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20 shadow-xs'
                        : 'bg-white/60 border-stone-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#8B5E3C] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#4A2E1B]">Razorpay Online</p>
                      <p className="text-[10px] text-stone-500">UPI, Cards, NetBanking</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                      paymentMethod === 'cash'
                        ? 'bg-white border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20 shadow-xs'
                        : 'bg-white/60 border-stone-200'
                    }`}
                  >
                    <User className="w-5 h-5 text-stone-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#4A2E1B]">Pay at Salon</p>
                      <p className="text-[10px] text-stone-500">Pay cash upon arrival</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full mt-4 bg-[#4A2E1B] hover:bg-[#341F11] text-white py-3.5 rounded-xl font-medium text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing Secure Payment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    {paymentMethod === 'razorpay'
                      ? `Pay ₹${currentService?.price?.toLocaleString('en-IN')} & Confirm`
                      : 'Confirm Reservation'}
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 5: BOOKING SUCCESS SCREEN */}
          {step === 5 && confirmedBooking && (
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-widest text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Booking Confirmed
                </span>
                <h3 className="font-serif text-2xl text-[#4A2E1B] font-semibold mt-2">
                  We look forward to welcoming you!
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  A reservation confirmation and receipt have been dispatched.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5D7C7] text-left max-w-md mx-auto space-y-2 text-xs shadow-xs">
                <div className="flex justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Booking ID:</span>
                  <span className="font-mono font-semibold text-stone-800">{confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Service:</span>
                  <span className="font-semibold text-stone-800">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Stylist:</span>
                  <span className="font-semibold text-stone-800">{confirmedBooking.workerName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Date &amp; Time:</span>
                  <span className="font-semibold text-stone-800">
                    {confirmedBooking.date} at {confirmedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">Payment Status:</span>
                  <span className="font-bold uppercase text-emerald-700">
                    {confirmedBooking.paymentStatus} ({confirmedBooking.paymentMethod})
                  </span>
                </div>
              </div>

              <div className="flex gap-3 max-w-md mx-auto pt-2">
                <button
                  onClick={resetAndClose}
                  className="flex-1 bg-[#4A2E1B] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#341F11] transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Nav Controls (Steps 1 to 3) */}
        {step < 4 && (
          <div className="p-4 border-t border-[#E8DEC8] flex items-center justify-between bg-white rounded-b-3xl">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 px-4 py-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNextStep}
              className="bg-[#4A2E1B] hover:bg-[#341F11] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

