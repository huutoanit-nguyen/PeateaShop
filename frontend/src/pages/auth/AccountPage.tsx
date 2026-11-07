import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Pencil, X, Check, ShoppingBag, Package } from 'lucide-react'
import { useAuthStore } from '../../store'
import { orderService, taobaoService, authService } from '../../services/api'
import type { Order, TaobaoOrder } from '../../types'
import toast from 'react-hot-toast'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận', PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao', COMPLETED: 'Đã giao', CANCELLED: 'Đã huỷ',
  NEW: 'Mới', CONFIRMED: 'Đã xác nhận',
  ORDERED_ON_TAOBAO: 'Đã đặt TB', SHIPPED_FROM_CHINA: 'Đang ship', DELIVERED: 'Đã nhận',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700', NEW: 'bg-pink-100 text-pink-700',
  CONFIRMED: 'bg-blue-100 text-blue-700', ORDERED_ON_TAOBAO: 'bg-indigo-100 text-indigo-700',
  SHIPPED_FROM_CHINA: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700',
}

export default function AccountPage() {
  const { user, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [taobao, setTaobao] = useState<TaobaoOrder[]>([])
  const [tab, setTab] = useState<'orders' | 'taobao' | 'profile'>('orders')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', province: '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [editPw, setEditPw] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role === 'ADMIN') { navigate('/admin'); return }
    setForm({ fullName: user.fullName, phone: user.phone, address: user.address ?? '', city: user.city ?? '', province: user.province ?? '' })
    orderService.getMyOrders().then(r => setOrders(r.data.data ?? [])).catch(() => {})
    taobaoService.getMy().then(r => setTaobao(r.data.data ?? [])).catch(() => {})
  }, [user])

  const handleSaveProfile = async () => {
    if (!form.fullName || !form.phone) { toast.error('Họ tên và SĐT không được để trống'); return }
    setSaving(true)
    try {
      const res = await authService.updateProfile(form)
      const updated = res.data.data
      const token = localStorage.getItem('token') ?? ''
      setAuth(updated, token)
      toast.success('Cập nhật thông tin thành công! ')
      setEditing(false)
    } catch {
      toast.error('Cập nhật thất bại, thử lại nhé!')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) { toast.error('Vui lòng điền đầy đủ'); return }
    if (pwForm.next.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Mật khẩu xác nhận không khớp'); return }
    setSaving(true)
    try {
      await authService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next })
      toast.success('Đổi mật khẩu thành công!')
      setEditPw(false)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mật khẩu hiện tại không đúng')
    } finally { setSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="card p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-pink-200 rounded-full flex items-center justify-center
                        font-extrabold text-pink-600 text-xl flex-shrink-0">
          {user.fullName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-800">{user.fullName}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-400">{user.phone}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={15} /> Đăng xuất
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([['orders',' Đơn hàng'], ['taobao',' Taobao'], ['profile',' Thông tin']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors
              ${tab === t ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 border border-pink-200 hover:border-pink-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700">Thông tin cá nhân</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-pink-500 font-bold hover:text-pink-600">
                  <Pencil size={13} /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setEditing(false); setForm({ fullName: user.fullName, phone: user.phone, address: user.address ?? '', city: user.city ?? '', province: user.province ?? '' }) }}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                    <X size={13} /> Huỷ
                  </button>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex items-center gap-1 text-sm text-pink-500 font-bold hover:text-pink-600">
                    {saving
                      ? <span className="w-3 h-3 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
                      : <><Check size={13} /> Lưu</>}
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Email (không thể thay đổi)</label>
                <div className="input-field bg-gray-50 text-gray-400 cursor-not-allowed">{user.email}</div>
              </div>
              {([
                ['fullName', 'Họ tên *', 'Nguyễn Minh Anh'],
                ['phone',    'Số điện thoại *', '09171234567'],
                ['address',  'Địa chỉ', '123 Đường ABC'],
                ['city',     'Thành phố', 'Hà Nội'],
                ['province', 'Tỉnh/Thành', 'Hà Nội'],
              ] as const).map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
                  <input
                    className={`input-field ${!editing ? 'bg-gray-50 text-gray-600 cursor-default' : ''}`}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    readOnly={!editing}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700">Mật khẩu</h2>
              {!editPw ? (
                <button onClick={() => setEditPw(true)}
                  className="flex items-center gap-1.5 text-sm text-pink-500 font-bold hover:text-pink-600">
                  <Pencil size={13} /> Đổi mật khẩu
                </button>
              ) : (
                <button onClick={() => { setEditPw(false); setPwForm({ current: '', next: '', confirm: '' }) }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                  <X size={13} /> Huỷ
                </button>
              )}
            </div>
            {!editPw ? (
              <p className="text-sm text-gray-400">••••••••</p>
            ) : (
              <div className="space-y-3">
                {([
                  ['current', 'Mật khẩu hiện tại', '••••••••'],
                  ['next',    'Mật khẩu mới', 'Tối thiểu 6 ký tự'],
                  ['confirm', 'Xác nhận mật khẩu mới', '••••••••'],
                ] as const).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
                    <input type="password" className="input-field" placeholder={placeholder}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <button onClick={handleChangePassword} disabled={saving}
                  className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 mt-2">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : 'Đổi mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="empty-state-icon"><ShoppingBag /></div>
              <p className="font-bold text-gray-500">Chưa có đơn hàng nào</p>
              <Link to="/shop" className="btn-primary inline-block mt-4 px-6 text-sm py-2">Mua sắm ngay</Link>
            </div>
          ) : orders.map(o => (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-pink-500 text-sm">{o.orderCode}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="border-t border-pink-50 pt-2 mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-500">{o.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                <p className="font-extrabold text-pink-500">{o.total?.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Taobao tab ── */}
      {tab === 'taobao' && (
        <div className="space-y-3">
          {taobao.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="empty-state-icon"><Package /></div>
              <p className="font-bold text-gray-500">Chưa có order Taobao nào</p>
              <Link to="/taobao" className="btn-primary inline-block mt-4 px-6 text-sm py-2">Đặt hàng Taobao</Link>
            </div>
          ) : taobao.map(o => (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-pink-500 text-sm">{o.orderCode}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{o.productDescription}</p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-pink-50">
                <p className="text-xs text-gray-400">SL: {o.quantity}{o.colorSize ? ` · ${o.colorSize}` : ''}</p>
                {o.trackingNumber && <p className="text-xs font-semibold text-purple-600">Tracking: {o.trackingNumber}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
