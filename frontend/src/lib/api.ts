import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401 & token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTkn = localStorage.getItem('refreshToken');
        if (!refreshTkn) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken: refreshTkn }
        );

        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const getMe = () => api.get('/auth/me');

export const refreshTokenApi = () => {
  const refreshTkn = localStorage.getItem('refreshToken');
  return api.post('/auth/refresh', { refreshToken: refreshTkn });
};

export const changePassword = (oldPassword: string, newPassword: string) =>
  api.put('/auth/change-password', { oldPassword, newPassword });

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = (params?: Record<string, string | number | boolean>) =>
  api.get('/products', { params });

export const getProduct = (id: string) => api.get(`/products/${id}`);

// ─── Cart ────────────────────────────────────────────────────────────────────

export const getCart = () => api.get('/cart');

export const addToCart = (productId: string) =>
  api.post('/cart/add', { productId });

export const removeFromCart = (id: string) => api.delete(`/cart/${id}`);

export const clearCart = () => api.delete('/cart/clear');

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = (productId: string, paymentType: string) =>
  api.post('/orders', { productId, paymentType });

export const markAsPaid = (orderId: string, formData: FormData) => {
  return api.post(`/orders/${orderId}/paid`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMyOrders = () => api.get('/orders/my');

export const downloadFile = (orderId: string) =>
  api.get(`/orders/${orderId}/download`, { responseType: 'blob' });

// ─── Payment Methods ─────────────────────────────────────────────────────────

export const getPaymentMethods = () => api.get('/payment-methods');

// ─── Blog ────────────────────────────────────────────────────────────────────

export const getBlogPosts = () => api.get('/blog');

export const getBlogPost = (id: string) => api.get(`/blog/${id}`);

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAdminStats = () => api.get('/admin/stats');

export const getAdminRevenue = () => api.get('/admin/revenue');

export const getAdminProducts = () => api.get('/admin/products');

export const createProduct = (formData: FormData) =>
  api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id: string, formData: FormData) =>
  api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id: string) => api.delete(`/admin/products/${id}`);

export const toggleProduct = (id: string) => api.patch(`/admin/products/${id}/toggle`);

export const uploadProductFile = (id: string, formData: FormData) =>
  api.post(`/admin/products/${id}/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const addLicenseKeys = (productId: string, keys: string[]) =>
  api.post(`/admin/products/${productId}/keys`, { keys });

export const getLicenseKeys = (productId: string) =>
  api.get(`/admin/products/${productId}/keys`);

export const getAdminOrders = (params?: Record<string, string | number | boolean>) =>
  api.get('/admin/orders', { params });

export const confirmOrder = (id: string) => api.patch(`/admin/orders/${id}/confirm`);

export const cancelOrder = (id: string) => api.patch(`/admin/orders/${id}/cancel`);

export const setManualKey = (orderId: string, key: string) =>
  api.patch(`/admin/orders/${orderId}/manual-key`, { key });

export const updatePaymentMethod = (id: string, formData: FormData) =>
  api.put(`/admin/payment-methods/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const createBlogPost = (formData: FormData) =>
  api.post('/admin/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateBlogPost = (id: string, formData: FormData) =>
  api.put(`/admin/blog/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteBlogPost = (id: string) => api.delete(`/admin/blog/${id}`);

export const getAdminUsers = () => api.get('/admin/users');

export const toggleBlockUser = (id: string) => api.patch(`/admin/users/${id}/block`);

export const getAdminUser = (id: string) => api.get(`/admin/users/${id}`);

export default api;
