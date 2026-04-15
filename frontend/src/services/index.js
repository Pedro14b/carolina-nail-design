import apiClient from './api';

export const authService = {
  register: async (name, phone, password) => {
    const response = await apiClient.post('/auth/register', {
      name,
      phone,
      password
    });
    return response.data;
  },

  login: async (pin) => {
    const response = await apiClient.post('/auth/login-pin', {
      pin
    });
    return response.data;
  },

  changePin: async (currentPin, newPin, confirmPin) => {
    const response = await apiClient.post('/auth/change-pin', {
      currentPin,
      newPin,
      confirmPin
    });
    return response.data;
  },

  biometricLogin: async (phone) => {
    const response = await apiClient.post('/auth/biometric', {
      phone
    });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken
    });
    return response.data;
  },

  requestPinRecovery: async ({ channel = 'email', email, phone }) => {
    const response = await apiClient.post('/auth/recovery/request', {
      channel,
      email,
      phone
    });
    return response.data;
  },

  verifyPinRecoveryCode: async ({ channel = 'email', email, phone, code }) => {
    const response = await apiClient.post('/auth/recovery/verify', {
      channel,
      email,
      phone,
      code
    });
    return response.data;
  },

  resetPinWithRecoveryToken: async (resetToken, newPin, confirmPin) => {
    const response = await apiClient.post('/auth/recovery/reset-pin', {
      resetToken,
      newPin,
      confirmPin
    });
    return response.data;
  }
};

export const clientService = {
  listClients: async (page = 1, limit = 10, search = '') => {
    const response = await apiClient.get('/clients', {
      params: { page, limit, search }
    });
    return response.data;
  },

  getClient: async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  }
};

export const appointmentService = {
  listAppointments: async (filters = {}) => {
    const response = await apiClient.get('/appointments', { params: filters });
    return response.data;
  },

  getAppointment: async (id) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (appointmentData) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  requestConfirmation: async (id, channel = 'internal') => {
    const response = await apiClient.post(`/appointments/${id}/confirmation/request`, {
      channel
    });
    return response.data;
  },

  respondConfirmation: async (id, responseStatus) => {
    const response = await apiClient.post(`/appointments/${id}/confirmation/respond`, {
      response: responseStatus
    });
    return response.data;
  },

  getConfirmationSummary: async (date) => {
    const response = await apiClient.get('/appointments/confirmations/summary', {
      params: { date }
    });
    return response.data;
  },

  requestBatchConfirmation: async (date, channel = 'internal', filters = {}, dryRun = false) => {
    const response = await apiClient.post('/appointments/confirmations/request-batch', {
      date,
      channel,
      ...filters,
      dryRun
    });
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  }
};

export const serviceService = {
  listServices: async () => {
    const response = await apiClient.get('/services');
    return response.data;
  },

  getService: async (id) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  }
};

export const notificationService = {
  listNotifications: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await apiClient.post('/notifications/settings', settings);
    return response.data;
  },

  getNotification: async (id) => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  }
};

export const reportService = {
  getFinancialReport: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/financial', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getAppointmentReport: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/appointments', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getClientReport: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/clients', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getRetentionReport: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/retention', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
