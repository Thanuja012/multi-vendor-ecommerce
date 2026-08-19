import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const productApi = {
  getAll: (params) => api.get('/products/public', { params }),
  getVendorProducts: () => api.get('/vendor/products'),
  create: (data) => api.post('/vendor/products', data),
  update: (id, data) => api.put(`/vendor/products/${id}`, data),
  delete: (id) => api.delete(`/vendor/products/${id}`),
};

export const orderApi = {
  place: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getVendorOrders: () => api.get('/orders/vendor'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } }),
};

export const adminApi = {
  getVendors: () => api.get('/admin/vendors'),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  suspendVendor: (id) => api.put(`/admin/vendors/${id}/suspend`),
  getUsers: () => api.get('/admin/users'),
};

export default api;
