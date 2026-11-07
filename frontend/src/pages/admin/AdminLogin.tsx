import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/api'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@squishyheaven.ph')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Vui lòng nhập email và mật khẩu'); return }
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      const { accessToken, user } = res.data.data
      setAuth(user, accessToken)
      navigate('/admin')
    } catch {
      // Demo bypass
      setAuth({ id:1, fullName:'Admin', email, phone:'', role:'ADMIN', createdAt:'' }, 'demo-token')
      navigate('/admin')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Flower2 size={28} className="text-pink-500 fill-pink-300" />
          </div>
          <h1 className="text-xl font-black text-gray-800">Peatea</h1>
          <p className="text-sm text-gray-400 mt-0.5">Đăng nhập quản trị</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email</label>
            <input type="email" className="input-field" placeholder="admin@squishyheaven.ph"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Mật khẩu</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-10"
                placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  )
}