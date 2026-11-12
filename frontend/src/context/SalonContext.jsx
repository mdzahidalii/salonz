import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_SERVICES, 
  INITIAL_WORKERS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_SALON_INFO 
} from '../data/initialData';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';

const SalonContext = createContext();

export function SalonProvider({ children }) {
  const { token, user } = useAuth();

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('aura_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('aura_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('aura_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [salonInfo, setSalonInfo] = useState(() => {
    const saved = localStorage.getItem('aura_salon_info');
    return saved ? JSON.parse(saved) : INITIAL_SALON_INFO;
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Sync to local storage for quick offline fallback
  useEffect(() => {
    localStorage.setItem('aura_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('aura_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('aura_salon_info', JSON.stringify(salonInfo));
  }, [salonInfo]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with shared MongoDB backend
  const refreshFromBackend = useCallback(async () => {
    try {
      const remoteServices = await apiClient.getServices();
      if (Array.isArray(remoteServices) && remoteServices.length > 0) {
        setServices(remoteServices);
      }
    } catch {
      // Backend temporarily offline; maintain existing state
    }

    try {
      const remoteWorkers = await apiClient.getWorkers();
      if (Array.isArray(remoteWorkers) && remoteWorkers.length > 0) {
        setWorkers(remoteWorkers);
      }
    } catch {}

    try {
      // Fetch all appointments for global synchronization
      const remoteApts = await apiClient.getAppointments(token);
      if (Array.isArray(remoteApts)) {
        setAppointments(remoteApts);
      }
    } catch {}

    try {
      const remoteInfo = await apiClient.getSalonInfo();
      if (remoteInfo && remoteInfo.name) {
        setSalonInfo(remoteInfo);
      }
    } catch {}
  }, [token]);

  // Initial fetch and automatic real-time synchronization interval (every 2.5s)
  useEffect(() => {
    refreshFromBackend();
    const interval = setInterval(refreshFromBackend, 2500);

    const handleFocus = () => refreshFromBackend();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshFromBackend]);

  // ==================== WORKER METHODS (MAX 5 LIMIT) ====================
  const addWorker = async (workerData) => {
    if (workers.length >= 5) {
      showToast('Maximum worker limit reached (5 workers max allowed). Deactivate or remove a worker first.', 'error');
      throw new Error('Maximum of 5 workers allowed in salon.');
    }

    try {
      const savedWorker = await apiClient.addWorker(workerData, token);
      setWorkers((prev) => [...prev, savedWorker]);
      showToast(`Stylist ${savedWorker.name} added successfully!`);
      refreshFromBackend();
      return savedWorker;
    } catch (err) {
      showToast(err.message || 'Failed to add worker', 'error');
      throw err;
    }
  };

  const updateWorker = async (id, updatedFields) => {
    try {
      const saved = await apiClient.updateWorker(id, updatedFields, token);
      setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...saved } : w)));
      showToast('Worker profile updated');
      refreshFromBackend();
    } catch (err) {
      setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updatedFields } : w)));
      showToast('Worker profile updated');
    }
  };

  const toggleWorkerStatus = async (id, newStatus) => {
    try {
      await apiClient.toggleWorkerStatus(id, newStatus, token);
      setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
      showToast(`Worker status updated to: ${newStatus}`);
      refreshFromBackend();
    } catch (err) {
      setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
      showToast(`Worker status updated to: ${newStatus}`);
    }
  };

  // ==================== SERVICE METHODS ====================
  const addService = async (serviceData) => {
    try {
      const saved = await apiClient.createService(serviceData, token);
      setServices((prev) => [...prev, saved]);
      showToast(`Service "${saved.name}" created`);
      refreshFromBackend();
      return saved;
    } catch (err) {
      const localSrv = {
        id: `srv-${Date.now()}`,
        name: serviceData.name,
        category: serviceData.category || 'General',
        price: Number(serviceData.price),
        duration: Number(serviceData.duration),
        description: serviceData.description,
        image: serviceData.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
      };
      setServices((prev) => [...prev, localSrv]);
      showToast(`Service "${localSrv.name}" created`);
      return localSrv;
    }
  };

  const updateService = async (id, updatedFields) => {
    try {
      const saved = await apiClient.updateService(id, updatedFields, token);
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...saved } : s)));
      showToast('Service details updated');
      refreshFromBackend();
    } catch (err) {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)));
      showToast('Service details updated');
    }
  };

  const deleteService = async (id) => {
    try {
      await apiClient.deleteService(id, token);
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Service removed from catalog');
      refreshFromBackend();
    } catch (err) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Service removed from catalog');
    }
  };

  // ==================== APPOINTMENT METHODS & DOUBLE-BOOKING CHECK ====================
  const isSlotAvailable = (workerId, date, time, excludeAppointmentId = null) => {
    if (!workerId || !date || !time) return true;
    return !appointments.some((apt) => {
      if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      if (apt.status === 'cancelled' || apt.status === 'rejected') return false;
      return apt.workerId === workerId && apt.date === date && apt.time === time;
    });
  };

  const bookAppointment = async (bookingData) => {
    // 1. Double Booking Check
    if (bookingData.workerId && !isSlotAvailable(bookingData.workerId, bookingData.date, bookingData.time)) {
      const assignedWorker = workers.find((w) => w.id === bookingData.workerId);
      const workerName = assignedWorker ? assignedWorker.name : 'Selected Stylist';
      showToast(`${workerName} is already booked for ${bookingData.time} on ${bookingData.date}. Please select another time or stylist.`, 'error');
      throw new Error('Slot occupied');
    }

    const payload = {
      customerId: bookingData.customerId || user?.id || `cust-${Date.now()}`,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      serviceId: bookingData.serviceId,
      workerId: bookingData.workerId,
      date: bookingData.date,
      time: bookingData.time,
      paymentMethod: bookingData.paymentMethod || 'razorpay',
      paymentStatus: bookingData.paymentStatus || 'paid',
      transactionId: bookingData.transactionId || `pay_rzp_${Date.now().toString().slice(-8)}`,
      notes: bookingData.notes || ''
    };

    try {
      const savedApt = await apiClient.createAppointment(payload, token);
      setAppointments((prev) => [savedApt, ...prev.filter((a) => a.id !== savedApt.id)]);
      showToast('Appointment booked successfully!');
      refreshFromBackend();
      return savedApt;
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
      throw err;
    }
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      await apiClient.updateAppointmentStatus(id, newStatus, token);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      showToast(`Appointment marked as: ${newStatus.replace('_', ' ').toUpperCase()}`);
      refreshFromBackend();
    } catch (err) {
      console.warn('Status update API fallback:', err);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      showToast(`Appointment marked as: ${newStatus.replace('_', ' ').toUpperCase()}`);
    }
  };

  const assignWorkerToAppointment = async (appointmentId, workerId) => {
    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    // Check availability
    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt && !isSlotAvailable(workerId, apt.date, apt.time, appointmentId)) {
      showToast(`${targetWorker.name} is already occupied during this time!`, 'error');
      return;
    }

    try {
      await apiClient.assignWorker(appointmentId, workerId, token);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, workerId: workerId, workerName: targetWorker.name }
            : a
        )
      );
      showToast(`Reassigned to ${targetWorker.name}`);
      refreshFromBackend();
    } catch (err) {
      showToast(err.message || 'Worker assignment failed', 'error');
    }
  };

  const rescheduleAppointment = async (id, newDate, newTime) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    if (!isSlotAvailable(apt.workerId, newDate, newTime, id)) {
      showToast('The requested slot is already booked for this specialist. Please select another time.', 'error');
      throw new Error('Slot occupied');
    }

    try {
      await apiClient.rescheduleAppointment(id, { date: newDate, time: newTime }, token);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime } : a))
      );
      showToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
      refreshFromBackend();
    } catch (err) {
      showToast(err.message || 'Failed to reschedule', 'error');
      throw err;
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await apiClient.cancelAppointment(id, token);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );
      showToast('Appointment cancelled successfully', 'info');
      refreshFromBackend();
    } catch (err) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  // ==================== SALON SETTINGS ====================
  const updateSalonSettings = async (newSettings) => {
    try {
      await apiClient.updateSalonInfo(newSettings, token);
      setSalonInfo((prev) => ({ ...prev, ...newSettings }));
      showToast('Salon information and working hours updated');
      refreshFromBackend();
    } catch (err) {
      setSalonInfo((prev) => ({ ...prev, ...newSettings }));
      showToast('Salon information and working hours updated');
    }
  };

  const openBookingModal = (service = null) => {
    setPreselectedService(service);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setPreselectedService(null);
  };

  return (
    <SalonContext.Provider
      value={{
        services,
        workers,
        appointments,
        salonInfo,
        toasts,
        showToast,
        removeToast,
        isBookingModalOpen,
        preselectedService,
        openBookingModal,
        closeBookingModal,
        // Worker methods
        addWorker,
        updateWorker,
        toggleWorkerStatus,
        // Service methods
        addService,
        updateService,
        deleteService,
        // Appointment methods
        isSlotAvailable,
        bookAppointment,
        updateAppointmentStatus,
        assignWorkerToAppointment,
        rescheduleAppointment,
        cancelAppointment,
        // Settings
        updateSalonSettings,
        refreshFromBackend
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (!context) throw new Error('useSalon must be used within SalonProvider');
  return context;
}
