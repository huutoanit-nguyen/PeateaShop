import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { HeroUIProvider } from '@heroui/react'
import { LenisProvider, useLenis } from './context/LenisContext'
import { useAuthStore } from './store'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import TaobaoPage from './pages/TaobaoPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AccountPage from './pages/auth/AccountPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTaobaoOrders from './pages/admin/AdminTaobaoOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminLogin from './pages/admin/AdminLogin'
import Wishlist from './pages/WishlistPage'
import NotificationsPage from './pages/NotificationPage'
import QRDepositPage from './pages/QrdepositPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

// Defined outside the component — no need to recreate on every pathname change
const PAGE_TITLES: Record<string, string> = {
  '/': 'Những điều nhỏ. Niềm vui lớn.',
  '/shop': 'Cửa hàng',
  '/cart': 'Giỏ hàng',
  '/taobao': 'Đặt hộ Taobao',
  '/login': 'Đăng nhập',
  '/register': 'Tạo tài khoản',
  '/account': 'Tài khoản',
  '/wishlist': 'Yêu thích',
  '/notifications': 'Thông báo',
  '/privacy': 'Chính sách bảo mật',
  '/terms': 'Điều khoản sử dụng',
}

// Auth editorial image — hosted locally to avoid external dependency on Unsplash
const AUTH_IMAGE = 'https://images.unsplash.com/photo-1648311203209-da34f7d0d800?auto=format&fit=crop&w=1000&q=85'

function PageNavigation() {
  const { pathname } = useLocation()
  const { lenis } = useLenis()
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    document.title = `${PAGE_TITLES[pathname] || (pathname.startsWith('/admin') ? 'Quản trị' : 'Khám phá')} — Peatea`
  }, [pathname, lenis])
  return null
}

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <Navbar />
      <main id="main-content" className="customer-content">{children}</main>
      <Footer />
    </>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()
  return (
    <div className="auth-layout">
      <div className="auth-editorial">
        <Link to="/" className="brand">peatea.</Link>
        <img src={AUTH_IMAGE} alt="Gấu bông nhỏ trong một góc nhà ấm áp" />
        <div>
          <h2>Một góc nhỏ.<br /><em>Dành riêng cho bạn.</em></h2>
          <p>Lưu những món đồ yêu thích, theo dõi đơn hàng<br />và tìm thêm một chút niềm vui mỗi ngày.</p>
        </div>
      </div>
      <div className="auth-content">
        <Link to="/" className="auth-back"><ArrowLeft size={16} /> Về cửa hàng</Link>
        {children}
        <span className="auth-copyright">© {year} Peatea. Made with care.</span>
      </div>
    </div>
  )
}

/** Redirect unauthenticated users away from /admin routes */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore(s => s.isAdmin())
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <HeroUIProvider>
      <LenisProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <PageNavigation />
          <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '8px', background: '#fffefa', color: '#30362e', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '13px', border: '1px solid #e4e4db', boxShadow: '0 8px 30px #242a2010' }, success: { iconTheme: { primary: '#46583f', secondary: '#fff' } } }} />
          <Routes>
            <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
            <Route path="/shop" element={<CustomerLayout><ShopPage /></CustomerLayout>} />
            <Route path="/product/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
            <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
            <Route path="/account" element={<CustomerLayout><AccountPage /></CustomerLayout>} />
            <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
            <Route path="/wishlist" element={<CustomerLayout><Wishlist /></CustomerLayout>} />
            <Route path="/taobao" element={<CustomerLayout><TaobaoPage /></CustomerLayout>} />
            <Route path="/notifications" element={<CustomerLayout><NotificationsPage /></CustomerLayout>} />
            <Route path="/checkout/deposit" element={<CustomerLayout><QRDepositPage /></CustomerLayout>} />
            <Route path="/privacy" element={<CustomerLayout><PrivacyPage /></CustomerLayout>} />
            <Route path="/terms" element={<CustomerLayout><TermsPage /></CustomerLayout>} />
            <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="taobao" element={<AdminTaobaoOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>
            <Route path="*" element={<CustomerLayout><div className="not-found shell"><h1>Góc nhỏ này chưa có ở đây.</h1><p>Quay về Peatea để tìm điều bạn đang cần nhé.</p><Link className="btn-primary" to="/">Về trang chủ <ArrowRight size={16} /></Link></div></CustomerLayout>} />
          </Routes>
        </BrowserRouter>
      </LenisProvider>
    </HeroUIProvider>
  )
}
