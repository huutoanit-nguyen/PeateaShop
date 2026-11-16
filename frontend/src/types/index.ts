// ─── Entities ────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrls: string[]
  variants: string[]
  categoryId: number | null   // backend can return null for un-categorised products
  categoryName: string | null
  active: boolean
  newArrival: boolean
  featured: boolean
  soldCount: number
  createdAt: string
}

export interface Category {
  id: number
  name: string
  description: string
  imageUrl: string
  active: boolean
  productCount: number
}

export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  address?: string
  city?: string
  province?: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productImageUrl: string
  variant?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: number
  orderCode: string
  userId: number
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  note?: string
  subtotal: number
  shippingFee: number
  total: number
  paymentMethod: 'COD' | 'BANK_TRANSFER'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  adminNote?: string
  paymentProofUrl?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface TaobaoOrder {
  id: number
  orderCode: string
  userId?: number
  customerName: string
  customerPhone: string
  taobaoLink: string
  productDescription: string
  quantity: number
  colorSize?: string
  estimatedPriceCny?: number
  note?: string
  status: 'NEW' | 'CONFIRMED' | 'ORDERED_ON_TAOBAO' | 'SHIPPED_FROM_CHINA' | 'DELIVERED' | 'CANCELLED'
  trackingNumber?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardData {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  todayRevenue: number
  totalCustomers: number
  newTaobaoOrders: number
  dailyOrderStats: { date: string; count: number }[]
  recentOrders: Order[]
}

export interface CartItem {
  product: Product
  variant?: string
  quantity: number
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null   // backend can return null data on some responses
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}