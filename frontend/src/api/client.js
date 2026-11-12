// API Client for FastAPI backend communications

const API_BASE = '/api';

export const apiClient = {
  // Helper to attach JWT token
  getHeaders(token) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth endpoints
  async login(email, password, role) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(err.detail || 'Login failed');
      }
      return await res.json();
    } catch (e) {
      throw e;
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }
      return await res.json();
    } catch (e) {
      throw e;
    }
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch user session');
    return await res.json();
  },

  // Services endpoints
  async getServices() {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return await res.json();
  },

  async createService(serviceData, token) {
    const res = await fetch(`${API_BASE}/owner/services`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(serviceData),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return await res.json();
  },

  async updateService(id, serviceData, token) {
    const res = await fetch(`${API_BASE}/owner/services/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(serviceData),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return await res.json();
  },

  async deleteService(id, token) {
    const res = await fetch(`${API_BASE}/owner/services/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return await res.json();
  },

  // Workers endpoints
  async getWorkers() {
    const res = await fetch(`${API_BASE}/workers`);
    if (!res.ok) throw new Error('Failed to fetch workers');
    return await res.json();
  },

  async addWorker(workerData, token) {
    const res = await fetch(`${API_BASE}/owner/workers`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(workerData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add worker' }));
      throw new Error(err.detail || 'Failed to add worker');
    }
    return await res.json();
  },

  async updateWorker(id, workerData, token) {
    const res = await fetch(`${API_BASE}/owner/workers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(workerData),
    });
    if (!res.ok) throw new Error('Failed to update worker');
    return await res.json();
  },

  async toggleWorkerStatus(id, status, token) {
    const res = await fetch(`${API_BASE}/owner/workers/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update worker status');
    return await res.json();
  },

  // Appointments endpoints
  async getAppointments(token, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/appointments?${query}` : `${API_BASE}/appointments`;
    const res = await fetch(url, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return await res.json();
  },

  async createAppointment(appointmentData, token) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(appointmentData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to book appointment' }));
      throw new Error(err.detail || 'Slot not available or error occurred');
    }
    return await res.json();
  },

  async updateAppointmentStatus(id, status, token) {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return await res.json();
  },

  async assignWorker(appointmentId, workerId, token) {
    const res = await fetch(`${API_BASE}/owner/appointments/${appointmentId}/assign`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ workerId }),
    });
    if (!res.ok) throw new Error('Failed to assign worker');
    return await res.json();
  },

  async rescheduleAppointment(id, { date, time }, token) {
    const res = await fetch(`${API_BASE}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ date, time }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reschedule' }));
      throw new Error(err.detail || 'Slot already occupied');
    }
    return await res.json();
  },

  async cancelAppointment(id, token) {
    const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return await res.json();
  },

  // Payments endpoints
  async createRazorpayOrder(amount, appointmentId, token) {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ amount, appointmentId }),
    });
    if (!res.ok) throw new Error('Failed to create Razorpay payment order');
    return await res.json();
  },

  async verifyRazorpayPayment(paymentData, token) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) throw new Error('Payment verification failed');
    return await res.json();
  },

  // Salon Settings
  async getSalonInfo() {
    const res = await fetch(`${API_BASE}/salon-info`);
    if (!res.ok) throw new Error('Failed to fetch salon info');
    return await res.json();
  },

  async updateSalonInfo(salonData, token) {
    const res = await fetch(`${API_BASE}/owner/salon-info`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(salonData),
    });
    if (!res.ok) throw new Error('Failed to update salon settings');
    return await res.json();
  }
};

