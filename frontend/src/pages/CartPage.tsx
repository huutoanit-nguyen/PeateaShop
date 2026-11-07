import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, ChevronLeft, CreditCard, Truck } from 'lucide-react'
import { useCartStore, useNotifStore } from '../store'
import { orderService } from '../services/api'
import toast from 'react-hot-toast'

const PROVINCES = [
  'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu',
  'Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước',
  'Bình Thuận','Cà Mau','Cần Thơ','Cao Bằng','Đà Nẵng',
  'Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp',
  'Gia Lai','Hà Giang','Hà Nam','Hà Nội','Hà Tĩnh',
  'Hải Dương','Hải Phòng','Hậu Giang','Hòa Bình','Hưng Yên',
  'Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng',
  'Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An',
  'Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình',
  'Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng',
  'Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa',
  'Thừa Thiên Huế','Tiền Giang','TP. Hồ Chí Minh','Trà Vinh','Tuyên Quang',
  'Vĩnh Long','Vĩnh Phúc','Yên Bái',
]

const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ'

type PayMethod = 'BANK_TRANSFER' | 'COD'

export default function CartPage() {
  const { items, updateQty, removeItem, total, clearCart } = useCartStore()
  const addNotif = useNotifStore((s) => s.add)
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName:'', phone:'', address:'', city:'', province:'' })
  const [payment, setPayment] = useState<PayMethod>('BANK_TRANSFER')
  const [submitting, setSubmitting] = useState(false)

  const SHIPPING = 30000
  const subtotal = total()
  const totalAmt = subtotal + SHIPPING

  // Cọc: đơn >= 200.000đ → cọc 100.000đ, dưới 200.000đ → cọc 30.000đ
  const depositAmt = totalAmt >= 200000 ? 100000 : 30000

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    const { fullName, phone, address, city, province } = form
    if (!fullName || !phone || !address || !city || !province) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        recipientName: fullName, recipientPhone: phone,
        shippingAddress: address, shippingCity: city, shippingProvince: province,
        paymentMethod: payment,
        items: items.map(i => ({ productId: i.product.id, variant: i.variant, quantity: i.quantity }))
      }
      const res = await orderService.create(payload)
      const code = res.data.data?.orderCode ?? 'SH-' + Date.now()
      clearCart()
      addNotif({
        type: 'order',
        title: 'Đặt hàng thành công! ',
        message: `Đơn hàng ${code} đã được đặt. Vui lòng thanh toán cọc để xác nhận nhé!`,
        time: 'Vừa xong',
      })
      navigate('/checkout/deposit', {
        state: { orderCode: code, orderId: res.data.data?.id, totalAmt, depositAmt, paymentMethod: payment }
      })
    } catch {
      const code = 'SH-' + Date.now()
      clearCart()
      navigate('/checkout/deposit', {
        state: { orderCode: code, orderId: null, totalAmt, depositAmt, paymentMethod: payment }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="empty-state-icon"><ShoppingBag /></div>
      <h2 className="text-xl font-black text-gray-700 mb-2">Giỏ hàng trống</h2>
      <p className="text-gray-400 text-sm mb-6">Khám phá những món đồ nhỏ để tìm một chút niềm vui.</p>
      <Link to="/shop" className="btn-primary px-8">Mua sắm ngay</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-pink-500 text-sm font-bold mb-2 hover:gap-2 transition-all">
        <ChevronLeft size={16} /> Tiếp tục mua sắm
      </Link>
      <h1 className="text-2xl font-black text-gray-800 mb-6">Giỏ hàng</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Cart Items */}
          <div className="card p-5">
            <div className="flex items-center gap-2 font-bold text-gray-700 mb-4">
              <ShoppingBag size={16} className="text-pink-500" />
              Sản phẩm ({items.length})
            </div>
            <div className="space-y-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.variant}`}
                  className="flex items-center gap-3 pb-4 border-b border-pink-50 last:border-0 last:pb-0">
                  <img src={item.product.imageUrls[0]} alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-pink-500 font-bold text-sm mt-0.5">{vnd(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product.id, item.variant, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-pink-200 text-pink-500 font-bold text-sm hover:bg-pink-50 flex items-center justify-center">−</button>
                    <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.variant, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-pink-200 text-pink-500 font-bold text-sm hover:bg-pink-50 flex items-center justify-center">+</button>
                  </div>
                  <p className="font-bold text-gray-700 text-sm w-20 text-right">
                    {vnd(item.product.price * item.quantity)}
                  </p>
                  <button onClick={() => removeItem(item.product.id, item.variant)}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 mb-4">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Họ tên *</label>
                <input className="input-field" placeholder="Nguyễn Văn A" value={form.fullName} onChange={set('fullName')} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Số điện thoại *</label>
                <input className="input-field" placeholder="0901234567" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Địa chỉ *</label>
                <input className="input-field" placeholder="123 Đường ABC, Phường XYZ" value={form.address} onChange={set('address')} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Quận/Huyện *</label>
                <input className="input-field" placeholder="Quận 1" value={form.city} onChange={set('city')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 mb-1 block">Tỉnh/Thành phố *</label>
                <select className="input-field" value={form.province} onChange={set('province')}>
                  <option value="">Chọn tỉnh/thành phố</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-700 mb-1">Hình thức thanh toán</h2>
            <p className="text-xs text-gray-400 mb-3">
              Sau khi đặt hàng, bạn sẽ cọc{' '}
              <span className="font-bold text-pink-500">{vnd(depositAmt)}</span>
              {totalAmt >= 200000 ? ' (đơn từ 200.000đ)' : ' (đơn dưới 200.000đ)'} để xác nhận.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(['BANK_TRANSFER','COD'] as PayMethod[]).map(m => (
                <button key={m} onClick={() => setPayment(m)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                    ${payment === m ? 'border-pink-500 bg-pink-50' : 'border-pink-100 hover:border-pink-300'}`}>
                  {m === 'BANK_TRANSFER'
                    ? <CreditCard size={20} className={payment === m ? 'text-pink-500' : 'text-gray-400'} />
                    : <Truck size={20} className={payment === m ? 'text-pink-500' : 'text-gray-400'} />
                  }
                  <div>
                    <p className={`font-bold text-sm ${payment === m ? 'text-pink-600' : 'text-gray-700'}`}>
                      {m === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Thanh toán khi nhận'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m === 'BANK_TRANSFER' ? 'Momo, VietQR, ATM' : 'Trả tiền khi nhận hàng'}
                    </p>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0
                    ${payment === m ? 'border-pink-500 bg-pink-500' : 'border-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-gray-700 mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính ({items.length} món)</span>
                <span className="font-semibold">{vnd(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-semibold">{vnd(SHIPPING)}</span>
              </div>
              <div className="border-t border-pink-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="font-black text-xl text-pink-500">{vnd(totalAmt)}</span>
              </div>
              <div className="bg-pink-50 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600 font-semibold">Cần cọc ngay</span>
                  <span className="font-black text-pink-600">{vnd(depositAmt)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {payment === 'COD'
                    ? `Trả ${vnd(totalAmt - depositAmt)} còn lại khi nhận`
                    : 'Chuyển khoản để xác nhận đơn'}
                </p>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base">
              {submitting
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : ' Đặt hàng & Thanh toán cọc'}
            </button>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-gray-400"> Giao hàng 3–5 ngày làm việc</p>
              <p className="text-xs text-gray-400"> Xác nhận trong 24h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


