import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  owner: {
    email: 'owner@aurasalon.com',
    password: 'ownerpassword123',
    role: 'owner',
    name: 'Eleanor Vance (Salon Owner)'
  },
  worker: {
    email: 'aria@aurasalon.com',
    password: 'workerpassword123',
    role: 'worker',
    workerId: 'w-1',
    name: 'Aria Montgomery'
  },
  customer: {
    email: 'sophia.w@example.com',
    password: 'customerpassword123',
    role: 'customer',
    name: 'Sophia Williams',
    phone: '+91 99887 76655'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('aura_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('customer'); // customer, worker, owner

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aura_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('aura_token', token);
    } else {
      localStorage.removeItem('aura_token');
    }
  }, [token]);

  // Standard authentication
  const login = async (email, password, role = 'owner') => {
    try {
      // Attempt backend API login first
      const data = await apiClient.login(email, password, role);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } catch (err) {
      console.warn("Backend login fallback:", err.message);
      // Fallback for demo testing
      const demoAccount = Object.values(DEMO_CREDENTIALS).find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase() && (acc.role === role || !role)
      );
      if (demoAccount && password === demoAccount.password) {
        const fakeUser = {
          id: demoAccount.workerId || 'demo-user-id',
          name: demoAccount.name,
          email: demoAccount.email,
          role: demoAccount.role,
          workerId: demoAccount.workerId,
          phone: demoAccount.phone
        };
        setUser(fakeUser);
        setToken('demo-jwt-token-' + demoAccount.role);
        return fakeUser;
      }
      throw new Error(err.message || 'Invalid email or password. Please verify credentials.');
    }
  };

  // ONE-CLICK Worker Login: Instantly authenticates a chosen worker without email/password
  const loginAsWorker = (worker) => {
    const workerUser = {
      id: worker.id,
      workerId: worker.id,
      name: worker.name,
      email: worker.email,
      role: 'worker',
      avatar: worker.avatar,
      phone: worker.phone || '+91 98765 43210',
      experience: worker.experience || '4 Years',
      rating: worker.rating || 4.9,
      specialties: worker.specialties || ['Styling']
    };
    setUser(workerUser);
    setToken('worker-jwt-token-' + worker.id);
    return workerUser;
  };

  const register = async (userData) => {
    try {
      const data = await apiClient.register(userData);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } catch (err) {
      console.warn("Backend register fallback:", err.message);
      const newUser = {
        id: 'cust-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'customer'
      };
      setUser(newUser);
      setToken('demo-jwt-token-customer');
      return newUser;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Quick switch for customer portal
  const quickSwitchRole = (roleKey) => {
    if (roleKey === 'customer') {
      const target = DEMO_CREDENTIALS.customer;
      const switchUser = {
        id: 'cust-1',
        name: target.name,
        email: target.email,
        role: 'customer',
        phone: target.phone
      };
      setUser(switchUser);
      setToken('demo-jwt-token-customer');
    }
  };

  const openAuthModal = (tab = 'customer') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginAsWorker,
        register,
        logout,
        quickSwitchRole,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
