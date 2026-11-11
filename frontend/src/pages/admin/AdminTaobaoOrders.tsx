import { useEffect, useState } from 'react'
import { Search, X, ChevronDown, ExternalLink } from 'lucide-react'
import { taobaoService } from '../../services/api'
import type { TaobaoOrder } from '../../types'
import toast from 'react-hot-toast'
import { isSafeHttpUrl } from '../../utils/url'

const STATUS_COLORS: Record<string, string> = {
  NEW:               'bg-pink-100 text-pink-700',
  CONFIRMED:         'bg-blue-100 text-blue-700',
  ORDERED_ON_TAOBAO: 'bg-indigo-100 text-indigo-700',
  SHIPPED_FROM_CHINA:'bg-purple-100 text-purple-700',
  DELIVERED:         'bg-green-100 text-green-700',
  CANCELLED:         'bg-red-100 text-red-700',
}
const STATUSES = ['NEW','CONFIRMED','ORDERED_ON_TAOBAO','SHIPPED_FROM_CHINA','DELIVERED','CANCELLED']

const MOCK: TaobaoOrder[] = [
  { id:1, orderCode:'TB-001', customerName:'Nguyễn Minh Anh', customerPhone:'09171234567', taobaoLink:'https://item.taobao.com/item.htm?id=123', productDescription:'Pink squishy cat toy', quantity:2, colorSize:'Pink', estimatedPriceCny:25.00, status:'NEW', createdAt:'2024-01-15T10:00:00', updatedAt:'' },
  { id:2, orderCode:'TB-002', customerName:'Jasmine Lim', customerPhone:'09181234567', taobaoLink:'https://item.taobao.com/item.htm?id=456', productDescription:'Bunny plush keychain', quantity:1, colorSize:'White', estimatedPriceCny:15.50, status:'CONFIRMED', createdAt:'2024-01-14T14:00:00', updatedAt:'' },
  { id:3, orderCode:'TB-003', customerName:'Bea Cruz', customerPhone:'09191234567', taobaoLink:'https://item.taobao.com/item.htm?id=789', productDescription:'Rainbow cat figurine set of 6', quantity:1, colorSize:undefined, estimatedPriceCny:68.00, status:'SHIPPED_FROM_CHINA', trackingNumber:'YT2024011500001', createdAt:'2024-01-12T09:00:00', updatedAt:'' },
]

export default function AdminTaobaoOrders() {
  const [orders, setOrders] = useState<TaobaoOrder[]>([])
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<TaobaoOrder | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    taobaoService.getAll({ keyword, status: statusFilter || undefined })
      .then(r => setOrders(r.data.data?.content ?? MOCK))
      .catch(() => setOrders(MOCK))
  }, [keyword, statusFilter])

  const filtered = orders.filter(o =>
    (!keyword || o.orderCode.includes(keyword) || o.customerName.toLowerCase().includes(keyword.toLowerCase())) &&
    (!statusFilter || o.status === statusFilter)
  )

  const handleUpdate = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    try {
      await taobaoService.updateStatus(selected.id, newStatus, tracking, adminNote)
      setOrders(os => os.map(o => o.id === selected.id
        ? { ...o, status: newStatus as TaobaoOrder['status'], trackingNumber: tracking, adminNote }
        : o))
      toast.success('Taobao order updated!')
      setSelected(null)
    } catch {
      toast.error('Failed to update')
    } finally { setUpdating(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-gray-800">Đặt hộ Taobao</h1>

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
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 font-semibold uppercase tracking-wide text-left">
                {['Order','Customer','Product','Qty','Giá tham khảo (CNY)','Status','Date',''].map((h,i) => (
                  <th key={i} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-pink-500">{o.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-700">{o.customerName}</p>
                    <p className="text-xs text-gray-400">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-gray-700 truncate">{o.productDescription}</p>
                    {o.colorSize && <p className="text-xs text-gray-400">{o.colorSize}</p>}
                    {isSafeHttpUrl(o.taobaoLink) ? (
                      <a href={o.taobaoLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 flex items-center gap-0.5 hover:underline">
                        <ExternalLink size={10} /> Xem sản phẩm
                      </a>
                    ) : <span className="text-xs text-gray-400">Link sản phẩm không hợp lệ</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold">{o.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {o.estimatedPriceCny ? `¥${o.estimatedPriceCny}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[o.status]}`}>
                      {o.status.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(o); setNewStatus(o.status); setTracking(o.trackingNumber ?? ''); setAdminNote(o.adminNote ?? '') }}
                      className="text-xs bg-pink-50 text-pink-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors whitespace-nowrap">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có đơn hàng phù hợp</div>}
        </div>
      </div>

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-800">{selected.orderCode}</h2>
                <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2 text-sm">
                <p><span className="text-gray-400">Customer:</span> <span className="font-semibold">{selected.customerName}</span></p>
                <p><span className="text-gray-400">Phone:</span> <span className="font-semibold">{selected.customerPhone}</span></p>
                <p><span className="text-gray-400">Product:</span> <span className="font-semibold">{selected.productDescription}</span></p>
                <p><span className="text-gray-400">Qty:</span> <span className="font-semibold">{selected.quantity}</span></p>
                {selected.colorSize && <p><span className="text-gray-400">Variant:</span> <span className="font-semibold">{selected.colorSize}</span></p>}
                <p><span className="text-gray-400">Est. CNY:</span> <span className="font-semibold">{selected.estimatedPriceCny ? `¥${selected.estimatedPriceCny}` : '—'}</span></p>
                {isSafeHttpUrl(selected.taobaoLink) ? (
                  <a href={selected.taobaoLink} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 flex items-center gap-1 text-xs hover:underline">
                    <ExternalLink size={12} /> Mở đường link Taobao
                  </a>
                ) : <span className="text-xs text-gray-400">Link sản phẩm không hợp lệ</span>}
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Cập nhật trạng thái</label>
                  <div className="relative">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-pink-300 bg-white">
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Mã vận đơn</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                    placeholder="e.g. YT2024011500001" value={tracking} onChange={e => setTracking(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ghi chú nội bộ</label>
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-pink-300 h-20"
                    placeholder="Ghi chú nội bộ..." />
                </div>
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
