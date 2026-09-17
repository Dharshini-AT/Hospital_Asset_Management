import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const dashboardService = {
  admin: async () => unwrap(await api.get('/dashboard/admin')),
  staff: async () => unwrap(await api.get('/dashboard/staff')),
  technician: async () => unwrap(await api.get('/dashboard/technician')),
};

export const assetService = {
  list: async (params = {}) => unwrap(await api.get('/assets', { params })),
  get: async (id) => unwrap(await api.get(`/assets/${id}`)),
  history: async (id) => unwrap(await api.get(`/assets/${id}/history`)),
  create: async (payload) => unwrap(await api.post('/assets', payload)),
  update: async (id, payload) => unwrap(await api.put(`/assets/${id}`, payload)),
  remove: async (id) => unwrap(await api.delete(`/assets/${id}`)),
};

export const maintenanceService = {
  list: async (params = {}) => unwrap(await api.get('/maintenance', { params })),
  get: async (id) => unwrap(await api.get(`/maintenance/${id}`)),
  create: async (payload) => unwrap(await api.post('/maintenance', payload)),
  assign: async (id, technicianId) => unwrap(await api.patch(`/maintenance/${id}/assign`, { technicianId })),
  start: async (id) => unwrap(await api.patch(`/maintenance/${id}/start`)),
  complete: async (id, payload) => unwrap(await api.patch(`/maintenance/${id}/complete`, payload)),
};

export const historyService = {
  list: async (params = {}) => unwrap(await api.get('/history', { params })),
  get: async (id) => unwrap(await api.get(`/history/${id}`)),
  asset: async (id) => unwrap(await api.get(`/history/asset/${id}`)),
};

export const userService = {
  list: async (params = {}) => unwrap(await api.get('/users', { params })),
  get: async (id) => unwrap(await api.get(`/users/${id}`)),
  create: async (payload) => unwrap(await api.post('/users', payload)),
  update: async (id, payload) => unwrap(await api.put(`/users/${id}`, payload)),
  remove: async (id) => unwrap(await api.delete(`/users/${id}`)),
  technicians: async (available = false) => unwrap(await api.get(`/users/technicians${available ? '/available' : ''}`)),
};

export const notificationService = {
  list: async () => {
    const response = await api.get('/notifications');
    return { items: response.data?.data || [], unreadCount: response.data?.unreadCount || 0 };
  },
  read: async (id) => unwrap(await api.patch(`/notifications/${id}/read`)),
  readAll: async () => unwrap(await api.patch('/notifications/read-all')),
};

export const reportService = {
  operational: async () => unwrap(await api.get('/reports/operational')),
};
