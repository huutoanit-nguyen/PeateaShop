import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, LoaderCircle } from 'lucide-react'
import { authService } from '../../services/api'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      const { accessToken, user } = res.data.data
      setAuth(user, accessToken)
      toast.success(`Chào mừng trở lại, ${user.fullName}!`)
      navigate(from.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true })
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Email hoặc mật khẩu không đúng') }
    finally { setLoading(false) }
  }
  return <section className="auth-panel"><p className="eyebrow">WELCOME BACK TO PEATEA</p><h1>Rất vui gặp lại bạn.</h1><p>Đăng nhập để tiếp tục hành trình tìm những điều nhỏ xinh.</p><form onSubmit={handleLogin}>
    <div><label htmlFor="login-email">Địa chỉ email</label><input id="login-email" className="input-field" type="email" autoComplete="email" placeholder="ban@email.com" required value={email} onChange={e => setEmail(e.target.value)} /></div>
    <div><label htmlFor="login-password">Mật khẩu</label><div className="auth-field-password"><input id="login-password" className="input-field pr-12" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Nhập mật khẩu của bạn" required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
    <button className="btn-primary" disabled={loading} type="submit">{loading ? <><LoaderCircle size={17} className="animate-spin" /> Đang đăng nhập...</> : <>Đăng nhập <ArrowRight size={16} /></>}</button>
  </form><p className="auth-switch">Lần đầu ghé Peatea? <Link to="/register">Tạo tài khoản</Link></p></section>
}
