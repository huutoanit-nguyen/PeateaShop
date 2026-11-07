import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, LoaderCircle } from 'lucide-react'
import { authService } from '../../services/api'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      const { confirm, ...payload } = form
      const res = await authService.register(payload)
      const { accessToken, user } = res.data.data
      setAuth(user, accessToken); toast.success(`Chào mừng ${user.fullName} đến với Peatea!`); navigate('/')
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Chưa thể tạo tài khoản. Vui lòng thử lại.') }
    finally { setLoading(false) }
  }
  const set = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }))
  return <section className="auth-panel"><p className="eyebrow">A LITTLE CORNER, JUST FOR YOU</p><h1>Chào bạn, người bạn mới.</h1><p>Tạo tài khoản để lưu những điều bạn yêu thích.</p><form onSubmit={handleRegister}>
    <div><label htmlFor="register-name">Họ và tên</label><input id="register-name" className="input-field" autoComplete="name" placeholder="Tên của bạn" required value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
    <div><label htmlFor="register-email">Địa chỉ email</label><input id="register-email" type="email" className="input-field" autoComplete="email" placeholder="ban@email.com" required value={form.email} onChange={e => set('email', e.target.value)} /></div>
    <div><label htmlFor="register-phone">Số điện thoại</label><input id="register-phone" type="tel" className="input-field" autoComplete="tel" placeholder="09xx xxx xxx" required value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
    <div><label htmlFor="register-password">Mật khẩu</label><div className="auth-field-password"><input id="register-password" type={showPw ? 'text' : 'password'} className="input-field pr-12" autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} /><button type="button" aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
    <div><label htmlFor="register-confirm">Xác nhận mật khẩu</label><input id="register-confirm" type="password" className="input-field" autoComplete="new-password" placeholder="Nhập lại mật khẩu" required value={form.confirm} onChange={e => set('confirm', e.target.value)} /></div>
    <button className="btn-primary" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={17} className="animate-spin" /> Đang tạo tài khoản...</> : <>Tạo tài khoản <ArrowRight size={16} /></>}</button>
  </form><p className="auth-switch">Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></section>
}
