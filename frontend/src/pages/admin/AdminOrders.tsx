import { useEffect, useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { orderService } from '../../services/api'
import type { Order } from '../../types'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  COMPLETED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}
const STATUSES = ['PENDING','PROCESSING','SHIPPED','COMPLETED','CANCELLED']

const MOCK: Order[] = [
  { id:1, userId:1, orderCode:'SH-001', recipientName:'Nguyễn Văn A', recipientPhone:'0901234567', shippingAddress:'123 Đường ABC', shippingCity:'Quận 1', shippingProvince:'TP. Hồ Chí Minh', subtotal:189000, shippingFee:30000, total:219000, status:'PENDING', paymentMethod:'COD', paymentStatus:'PENDING', items:[], createdAt:'2024-01-15T10:30:00', updatedAt:'' },
  { id:2, userId:2, orderCode:'SH-002', recipientName:'Trần Thị B', recipientPhone:'0912345678', shippingAddress:'456 Đường XYZ', shippingCity:'Hoàn Kiếm', shippingProvince:'Hà Nội', subtotal:349000, shippingFee:30000, total:379000, status:'PROCESSING', paymentMethod:'BANK_TRANSFER', paymentStatus:'PAID', items:[], createdAt:'2024-01-15T09:15:00', updatedAt:'' },
  { id:3, userId:3, orderCode:'SH-003', recipientName:'Lê Văn C', recipientPhone:'0923456789', shippingAddress:'789 Đường DEF', shippingCity:'Hải Châu', shippingProvince:'Đà Nẵng', subtotal:420000, shippingFee:30000, total:450000, status:'SHIPPED', paymentMethod:'BANK_TRANSFER', paymentStatus:'PAID', items:[], createdAt:'2024-01-14T16:00:00', updatedAt:'' },
  { id:4, userId:4, orderCode:'SH-004', recipientName:'Phạm Thị D', recipientPhone:'0934567890', shippingAddress:'321 Đường GHI', shippingCity:'Ninh Kiều', shippingProvince:'Cần Thơ', subtotal:280000, shippingFee:30000, total:310000, status:'COMPLETED', paymentMethod:'COD', paymentStatus:'PAID', items:[], createdAt:'2024-01-14T11:00:00', updatedAt:'' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    orderService.getAll({ keyword, status: statusFilter || undefined })
      .then(r => setOrders(r.data.data?.content ?? MOCK))
      .catch(() => setOrders(MOCK))
  }, [keyword, statusFilter])

  const filtered = orders.filter(o =>
    (!keyword || o.orderCode.includes(keyword) || o.recipientName.toLowerCase().includes(keyword.toLowerCase())) &&
    (!statusFilter || o.status === statusFilter)
  )

  const handleUpdate = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    try {
      await orderService.updateStatus(selected.id, newStatus, adminNote)
      setOrders(os => os.map(o => o.id === selected.id ? { ...o, status: newStatus as Order['status'], adminNote } : o))
      toast.success('Order status updated!')
      setSelected(null)
    } catch {
      toast.error('Failed to update')
    } finally { setUpdating(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-gray-800">Đơn hàng</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm
                            focus:outline-none focus:border-pink-300"
            placeholder="Tìm mã đơn hoặc khách hàng..." value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-300"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 font-semibold uppercase tracking-wide text-left">
                {['Order','Customer','Phone','Total','Payment','Status','Date','Action'].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-pink-500">{o.orderCode}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{o.recipientName}</td>
                  <td className="px-4 py-3 text-gray-500">{o.recipientPhone}</td>
                  <td className="px-4 py-3 font-bold">{o.total.toLocaleString("vi-VN") + "đ"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {o.paymentStatus}
                    </span>
                    {o.paymentProofUrl && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">

                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(o); setNewStatus(o.status); setAdminNote(o.adminNote ?? '') }}
                      className="text-xs bg-pink-50 text-pink-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Chưa có đơn hàng phù hợp</div>
          )}
        </div>
      </div>

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-gray-800">Order {selected.orderCode}</h2>
                <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2 text-sm">
                <p><span className="text-gray-400">Customer:</span> <span className="font-semibold">{selected.recipientName}</span></p>
                <p><span className="text-gray-400">Phone:</span> <span className="font-semibold">{selected.recipientPhone}</span></p>
                <p><span className="text-gray-400">Address:</span> <span className="font-semibold">{selected.shippingAddress}, {selected.shippingCity}, {selected.shippingProvince}</span></p>
                <p><span className="text-gray-400">Payment:</span> <span className="font-semibold">{selected.paymentMethod} • {selected.paymentStatus}</span></p>
                <p><span className="text-gray-400">Total:</span> <span className="font-bold text-pink-500">{selected.total.toLocaleString('vi-VN')}đ</span></p>
              </div>

              {/* Payment proof image */}
              {selected.paymentProofUrl && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 mb-2"> Ảnh minh chứng chuyển khoản</p>
                  <a href={selected.paymentProofUrl} target="_blank" rel="noreferrer">
                    <img src={selected.paymentProofUrl} alt="Minh chứng"
                      className="w-full rounded-2xl object-cover max-h-52 hover:opacity-90 transition-opacity cursor-zoom-in border border-pink-100" />
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Nhấn để xem ảnh đầy đủ</p>
                </div>
              )}

              {/* Update status */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Cập nhật trạng thái</label>
                <div className="relative">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none
                               focus:outline-none focus:border-pink-300 bg-white">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ghi chú nội bộ</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                             focus:outline-none focus:border-pink-300 h-24"
                  placeholder="Ghi chú về đơn hàng..." />
              </div>
              <button onClick={handleUpdate} disabled={updating}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {updating ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}