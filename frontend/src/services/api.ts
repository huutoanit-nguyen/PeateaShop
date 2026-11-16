import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message || 'Something went wrong'
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status !== 404) {
      toast.error(msg)
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { fullName: string; email: string; password: string; phone: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: { fullName: string; phone: string; address?: string; city?: string; province?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productService = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getById: (id: number) => api.get(`/products/${id}`),
  search: (params: Record<string, unknown>) => api.get('/products/search', { params }),
  // Admin
  create: (data: unknown) => api.post('/admin/products', data),
  createBulk: (data: unknown[]) => api.post('/admin/products/bulk', data),
  update: (id: number, data: unknown) => api.put(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
  toggleActive: (id: number) => api.patch(`/admin/products/${id}/toggle`),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data: unknown) => api.post('/admin/categories', data),
  update: (id: number, data: unknown) => api.put(`/admin/categories/${id}`, data),
  delete: (id: number) => api.delete(`/admin/categories/${id}`),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderService = {
  create: (data: unknown) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id: number) => api.get(`/orders/${id}`),
  uploadPaymentProof: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.patch(`/orders/${id}/payment-proof`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/admin/orders', { params }),
  updateStatus: (id: number, status: string, adminNote?: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, adminNote }),
  updatePayment: (id: number, paymentStatus: string) =>
    api.patch(`/admin/orders/${id}/payment`, { paymentStatus }),
}

// ─── Taobao Orders ────────────────────────────────────────────────────────────
export const taobaoService = {
  create: (data: unknown) => api.post('/taobao-orders', data),
  getMy: () => api.get('/taobao-orders/my'),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/admin/taobao-orders', { params }),
  updateStatus: (id: number, status: string, trackingNumber?: string, adminNote?: string) =>
    api.patch(`/admin/taobao-orders/${id}/status`, { status, trackingNumber, adminNote }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  get: () => api.get('/admin/dashboard'),
  getCustomers: (params?: Record<string, unknown>) => api.get('/admin/customers', { params }),
}