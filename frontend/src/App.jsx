import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalonProvider, useSalon } from './context/SalonContext';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import WorkerLayout from './layouts/WorkerLayout';
import CustomerHome from './components/CustomerHome';
import CustomerDashboard from './components/CustomerDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import LoginPage from './components/LoginPage';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

function resolveInitialView() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  
  // 1. Direct URL Hash Routing
  if (hash === 'admin' || hash === 'owner' || hash === 'owner-dashboard') {
    return 'owner-dashboard';
  }
  if (hash === 'worker' || hash === 'staff' || hash === 'worker-dashboard') {
    return 'worker-dashboard';
  }
  if (hash === 'my-bookings' || hash === 'bookings') {
    return 'customer-dashboard';
  }
  if (hash === 'login') {
    return 'login';
  }

  // 2. Persistent LocalStorage fallback
  try {
    const saved = localStorage.getItem('aura_current_view');
    const savedUser = JSON.parse(localStorage.getItem('aura_user') || 'null');

    if (saved === 'owner-dashboard' && savedUser?.role === 'owner') {
      return 'owner-dashboard';
    }
    if (saved === 'worker-dashboard' && savedUser?.role === 'worker') {
      return 'worker-dashboard';
    }
    if (saved === 'customer-dashboard') {
      return 'customer-dashboard';
    }
    if (saved === 'login') {
      return 'login';
    }
  } catch {
    // ignore
  }

  return 'customer';
}

function AppContent() {
  const { user } = useAuth();
  const { isBookingModalOpen, closeBookingModal, openBookingModal } = useSalon();

  // Active view routing: 'customer', 'customer-dashboard', 'login', 'owner-dashboard', 'worker-dashboard'
  const [currentView, setCurrentView] = useState(resolveInitialView);

  // Active tab within Admin and Worker layouts
  const [adminActiveTab, setAdminActiveTab] = useState('overview');
  const [workerActiveTab, setWorkerActiveTab] = useState('dashboard');

  // Trigger modals from Admin Topbar
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // Keep view synchronized with URL hash & localStorage
  useEffect(() => {
    localStorage.setItem('aura_current_view', currentView);

    const targetHash = 
      currentView === 'owner-dashboard' ? '#/admin' :
      currentView === 'worker-dashboard' ? '#/worker' :
      currentView === 'customer-dashboard' ? '#/my-bookings' :
      currentView === 'login' ? '#/login' : '#/';

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [currentView]);

  // Listen to browser forward/back buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash === 'admin' || hash === 'owner') {
        setCurrentView('owner-dashboard');
      } else if (hash === 'worker' || hash === 'staff') {
        setCurrentView('worker-dashboard');
      } else if (hash === 'my-bookings' || hash === 'bookings') {
        setCurrentView('customer-dashboard');
      } else if (hash === 'login') {
        setCurrentView('login');
      } else if (hash === '' || hash === '/') {
        setCurrentView('customer');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Strict Role-Based Access Guard
  useEffect(() => {
    if (currentView === 'owner-dashboard' && user && user.role !== 'owner') {
      // Non-owner trying to view admin -> redirect to login
      setCurrentView('login');
    }
    if (currentView === 'worker-dashboard' && user && user.role !== 'worker') {
      // Non-worker trying to view worker -> redirect to login
      setCurrentView('login');
    }
  }, [currentView, user]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D241E] font-sans antialiased">
      {/* Toast Notification Container */}
      <Toast />

      {/* ================= 1. CUSTOMER PORTAL ================= */}
      {currentView === 'customer' && (
        <CustomerLayout currentView={currentView} setCurrentView={setCurrentView}>
          <CustomerHome />
        </CustomerLayout>
      )}

      {currentView === 'customer-dashboard' && (
        <CustomerLayout currentView={currentView} setCurrentView={setCurrentView}>
          <CustomerDashboard onOpenBookModal={() => openBookingModal()} />
        </CustomerLayout>
      )}

      {/* ================= 2. AUTHENTICATION PORTAL ================= */}
      {currentView === 'login' && (
        <LoginPage onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* ================= 3. ADMIN PORTAL ================= */}
      {currentView === 'owner-dashboard' && (
        <AdminLayout
          activeTab={adminActiveTab}
          onSelectTab={setAdminActiveTab}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAddWorker={() => setIsAddWorkerModalOpen(true)}
          onOpenAddService={() => setIsAddServiceModalOpen(true)}
        >
          <OwnerDashboard
            activeTab={adminActiveTab}
            setActiveTab={setAdminActiveTab}
            isAddWorkerModalOpen={isAddWorkerModalOpen}
            setIsAddWorkerModalOpen={setIsAddWorkerModalOpen}
            isAddServiceModalOpen={isAddServiceModalOpen}
            setIsAddServiceModalOpen={setIsAddServiceModalOpen}
          />
        </AdminLayout>
      )}

      {/* ================= 4. WORKER PORTAL ================= */}
      {currentView === 'worker-dashboard' && (
        <WorkerLayout
          activeTab={workerActiveTab}
          onSelectTab={setWorkerActiveTab}
          onNavigate={(view) => setCurrentView(view)}
        >
          <WorkerDashboard
            activeTab={workerActiveTab}
            setActiveTab={setWorkerActiveTab}
          />
        </WorkerLayout>
      )}

      {/* Booking Wizard Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        onBookingSuccess={() => {
          if (user?.role === 'customer') {
            setCurrentView('customer-dashboard');
          }
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser.role === 'owner') {
            setCurrentView('owner-dashboard');
          } else if (loggedInUser.role === 'worker') {
            setCurrentView('worker-dashboard');
          } else {
            setCurrentView('customer-dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SalonProvider>
        <AppContent />
      </SalonProvider>
    </AuthProvider>
  );
}
