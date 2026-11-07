import { useEffect, useState } from 'react'
import { ShoppingBag, Clock, TrendingUp, Users, Package, ArrowUpRight, Box, LayoutDashboard } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/api'
import type { DashboardData, Order } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

const MOCK_DASH: DashboardData = {
  totalOrders: 142, pendingOrders: 18, processingOrders: 7,
  todayRevenue: 12580, totalCustomers: 89, newTaobaoOrders: 5,
  dailyOrderStats: [
    { date: 'Mon', count: 12 }, { date: 'Tue', count: 19 }, { date: 'Wed', count: 8 },
    { date: 'Thu', count: 25 }, { date: 'Fri', count: 31 }, { date: 'Sat', count: 22 }, { date: 'Sun', count: 15 },
  ],
  recentOrders: [
    { id: 1, orderCode: 'SH-001', userId: 1, recipientName: 'Nguyễn Minh Anh', items: [], subtotal: 189, shippingFee: 80, total: 269, status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'PENDING', shippingAddress: '', shippingCity: '', shippingProvince: '', recipientPhone: '', createdAt: '2024-01-15T10:30:00', updatedAt: '' },
    { id: 2, orderCode: 'SH-002', userId: 2, recipientName: 'Jasmine Lim', items: [], subtotal: 349, shippingFee: 80, total: 429, status: 'PROCESSING', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', shippingAddress: '', shippingCity: '', shippingProvince: '', recipientPhone: '', createdAt: '2024-01-15T09:15:00', updatedAt: '' },
    { id: 3, orderCode: 'SH-003', userId: 3, recipientName: 'Bea Dela Cruz', items: [], subtotal: 420, shippingFee: 80, total: 500, status: 'SHIPPED', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', shippingAddress: '', shippingCity: '', shippingProvince: '', recipientPhone: '', createdAt: '2024-01-14T16:00:00', updatedAt: '' },
    { id: 4, orderCode: 'SH-004', userId: 4, recipientName: 'Ana Reyes', items: [], subtotal: 280, shippingFee: 80, total: 360, status: 'COMPLETED', paymentMethod: 'COD', paymentStatus: 'PAID', shippingAddress: '', shippingCity: '', shippingProvince: '', recipientPhone: '', createdAt: '2024-01-14T11:00:00', updatedAt: '' },
  ] as Order[],
}

const METRICS = (d: DashboardData) => [
  { label: 'Tổng đơn hàng', value: d.totalOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Chờ xử lý', value: d.pendingOrders, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { label: "Doanh thu hôm nay", value: `${d.todayRevenue.toLocaleString('vi-VN')}đ`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Tổng khách hàng', value: d.totalCustomers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Yêu cầu Taobao mới', value: d.newTaobaoOrders, icon: Package, color: 'text-pink-500', bg: 'bg-pink-50' },
]

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(MOCK_DASH)

  useEffect(() => {
    dashboardService.get().then(r => setData(r.data.data ?? MOCK_DASH)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-800">Tổng quan</h1>
        <p className="text-sm text-gray-400">Tổng quan hoạt động cửa hàng hôm nay. </p>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/admin/orders',   icon: ShoppingBag, label: 'Đơn hàng',       color: 'bg-blue-50 text-blue-500',   count: data.pendingOrders,    note: 'chờ xử lý' },
          { to: '/admin/taobao',   icon: Package,     label: 'Order Taobao',   color: 'bg-pink-50 text-pink-500',   count: data.newTaobaoOrders,  note: 'mới' },
          { to: '/admin/products', icon: Box,         label: 'Sản phẩm',       color: 'bg-purple-50 text-purple-500', count: null, note: 'quản lý' },
          { to: '/admin/customers',icon: Users,       label: 'Khách hàng',     color: 'bg-green-50 text-green-500', count: data.totalCustomers,   note: 'tổng' },
        ].map(({ to, icon: Icon, label, color, count, note }) => (
          <Link key={to} to={to}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md
                       transition-shadow flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-lg leading-none">
                {count != null ? count : '→'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{label} · {note}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {METRICS(data).map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
              <m.icon size={18} className={m.color} />
            </div>
            <p className="text-2xl font-black text-gray-800">{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Đơn hàng trong tuần</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.dailyOrderStats}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6d805e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6d805e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5dc', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#6d805e" strokeWidth={2.5} fill="url(#pinkGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-3">
            {[
              { label: 'Chờ xác nhận', count: data.pendingOrders, color: 'bg-yellow-400' },
              { label: 'Đang xử lý', count: data.processingOrders, color: 'bg-blue-400' },
              { label: 'Taobao mới', count: data.newTaobaoOrders, color: 'bg-pink-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                <span className="font-bold text-gray-800">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Đơn hàng gần đây</h2>
          <a href="/admin/orders" className="text-pink-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-400 font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-pink-500">{o.orderCode}</td>
                  <td className="px-5 py-3 text-gray-700">{o.recipientName}</td>
                  <td className="px-5 py-3 font-semibold">{o.total.toLocaleString('vi-VN')}đ</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}