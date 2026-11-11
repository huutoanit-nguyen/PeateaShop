import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { taobaoService } from '../services/api'
import toast from 'react-hot-toast'
import { useNotifStore } from '../store'
import { Link } from 'react-router-dom'
import { isSafeHttpUrl } from '../utils/url'

export default function TaobaoPage() {
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', taobaoLink: '',
    productDescription: '', quantity: 1, colorSize: '',
    estimatedPriceCny: '', note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const addNotif = useNotifStore((s) => s.add)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.taobaoLink || !form.productDescription) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    if (!isSafeHttpUrl(form.taobaoLink)) {
      toast.error('Link sản phẩm phải bắt đầu bằng http:// hoặc https://')
      return
    }
    setSubmitting(true)
    try {
      const res = await taobaoService.create({
        ...form, quantity: Number(form.quantity),
        estimatedPriceCny: form.estimatedPriceCny ? Number(form.estimatedPriceCny) : undefined,
      })
      const code = res.data.data?.orderCode ?? 'TB-' + Date.now()
      addNotif({
        type: 'taobao',
        title: 'Order Taobao đã gửi! ',
        message: `${code} đã được ghi nhận. Chúng mình sẽ liên hệ xác nhận giá và chi tiết sớm nhé!`,
        time: 'Vừa xong',
      })
      setDone(code)
    } catch {
      setDone('TB-' + Date.now())
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Đã gửi yêu cầu đặt hộ </h1>
      <p className="text-gray-500 mb-1">Mã yêu cầu của bạn</p>
      <p className="text-xl font-black text-pink-500 mb-4">{done}</p>
      <p className="text-sm text-gray-500 mb-6">Peatea sẽ liên hệ để xác nhận giá và tình trạng sản phẩm. </p>
      <Link to="/" className="btn-primary px-8">Về trang chủ</Link>
    </div>
  )

  return (
    <div className="taobao-page max-w-3xl mx-auto px-4 py-10">
      <p className="eyebrow mb-3">DỊCH VỤ ĐẶT HỘ TAOBAO</p>
      <h1 className="text-2xl font-black text-gray-800 mb-1">Bạn tìm thấy. Peatea mang về.</h1>
      <p className="text-gray-500 text-sm mb-8">Gửi đường link món đồ bạn thích. Phần còn lại, để chúng mình lo.</p>

      <div className="card p-6 space-y-5">
        {/* Customer info */}
        <div>
          <h2 className="font-bold text-gray-700 mb-4 pb-2 border-b border-pink-100">Thông tin liên hệ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Họ và tên *</label>
              <input className="input-field" placeholder="Nguyễn Minh Anh" value={form.customerName} onChange={set('customerName')} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Số điện thoại *</label>
              <input className="input-field" placeholder="09171234567" value={form.customerPhone} onChange={set('customerPhone')} />
            </div>
          </div>
        </div>

        {/* Product info */}
        <div>
          <h2 className="font-bold text-gray-700 mb-4 pb-2 border-b border-pink-100">Món đồ bạn muốn đặt</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Đường link sản phẩm Taobao *</label>
              <input className="input-field" placeholder="https://item.taobao.com/item.htm?id=..." value={form.taobaoLink} onChange={set('taobaoLink')} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Mô tả sản phẩm *</label>
              <textarea className="input-field min-h-[80px] resize-none" placeholder="Tên sản phẩm, mẫu mã và những thông tin bạn muốn Peatea lưu ý..."
                value={form.productDescription}
                onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Số lượng *</label>
                <input type="number" min={1} className="input-field" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Màu sắc / Kích thước</label>
                <input className="input-field" placeholder="Ví dụ: Trắng, size M" value={form.colorSize} onChange={set('colorSize')} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Giá tham khảo (CNY)</label>
                <input type="number" className="input-field" placeholder="Ví dụ: 25" value={form.estimatedPriceCny} onChange={set('estimatedPriceCny')} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Ghi chú thêm</label>
              <textarea className="input-field min-h-[80px] resize-none" placeholder="Lời nhắn dành cho Peatea..."
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-pink-50 rounded-2xl p-4 text-sm text-gray-600">
          <p className="font-bold text-pink-600 mb-1"> Peatea giúp bạn như thế nào?</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Gửi yêu cầu kèm đường link sản phẩm bạn thích.</li>
            <li>Peatea kiểm tra hàng và báo giá kèm phí vận chuyển.</li>
            <li>Thanh toán sau khi bạn xác nhận báo giá.</li>
            <li>Chúng mình đặt hàng và giao đến tận tay bạn. </li>
          </ol>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="btn-primary w-full text-base flex items-center justify-center gap-2">
          {submitting
            ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : ' Gửi yêu cầu đặt hộ'}
        </button>
      </div>
    </div>
  )
}
