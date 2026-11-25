import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Heart,
  User,
  Bell,
  MagnifyingGlass,
  List,
  X,
  ArrowRight
} from '@phosphor-icons/react'
import { useCartStore, useWishlistStore, useAuthStore, useNotifStore } from '../../store'
import { ThemeToggle } from '../../context/ThemeContext'

// Defined outside the component so it's not recreated on every render
const NAV_LINKS: [string, string][] = [
  ['/', 'Trang chủ'],
  ['/shop', 'Cửa hàng'],
  ['/taobao', 'Đặt hộ Taobao'],
]

export default function Navbar() {
  const itemCount = useCartStore(s => s.itemCount())
  const wishlistCount = useWishlistStore(s => s.ids.length)
  const unreadCount = useNotifStore(s => s.unreadCount())
  const user = useAuthStore(s => s.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile menu on route change (pathname only — search changes from filters should not close it)
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  return (
    <>
      <div className="announcement">
        <span>Những món đồ nhỏ, niềm vui mỗi ngày.</span>
        <Link to="/shop">Khám phá Peatea <ArrowRight size={12} weight="bold" /></Link>
      </div>

      <header className="site-header">
        <div className="shell nav-inner">
          <Link to="/" className="brand" aria-label="Peatea — Trang chủ">
            peatea<span className="brand-dot">.</span>
            <span className="brand-sub">LITTLE THINGS, BIG JOY</span>
          </Link>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Tìm sản phẩm"
              aria-expanded={searchOpen}
              onClick={() => { setSearchOpen(v => !v); setMenuOpen(false) }}
            >
              {searchOpen ? <X size={20} weight="bold" /> : <MagnifyingGlass size={20} weight="bold" />}
            </button>

            <Link
              className="icon-button optional-nav-icon"
              to="/wishlist"
              aria-label={`Yêu thích, ${wishlistCount} sản phẩm`}
            >
              <Heart size={20} weight={wishlistCount > 0 ? 'fill' : 'bold'} />
              {wishlistCount > 0 && <span className="count-dot">{wishlistCount}</span>}
            </Link>

            <Link
              className="icon-button optional-nav-icon"
              to="/notifications"
              aria-label={`Thông báo, ${unreadCount} chưa đọc`}
            >
              <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'bold'} />
              {unreadCount > 0 && <span className="count-dot">{unreadCount}</span>}
            </Link>

            <Link
              className="icon-button"
              to={
                !user ? '/login'
                : user.role === 'ADMIN' ? '/admin'
                : '/account'
              }
              aria-label={user ? 'Tài khoản của bạn' : 'Đăng nhập'}
            >
              <User size={20} weight="bold" />
            </Link>

            <ThemeToggle />

            <Link
              className="icon-button cart-link"
              to="/cart"
              aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
            >
              <ShoppingBag size={20} weight="bold" />
              <span className="cart-count">{itemCount}</span>
            </Link>

            <button
              type="button"
              className="icon-button mobile-menu-button"
              onClick={() => { setMenuOpen(v => !v); setSearchOpen(false) }}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            className="shell nav-search"
            onSubmit={e => {
              e.preventDefault()
              navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
            }}
          >
            <MagnifyingGlass size={20} weight="bold" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Bạn đang tìm món đồ nào?"
              aria-label="Tên sản phẩm"
            />
            <button type="submit" className="btn-primary" style={{ minHeight: '40px', padding: '6px 18px' }}>
              Tìm kiếm <ArrowRight size={16} weight="bold" />
            </button>
          </form>
        )}

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Điều hướng điện thoại">
            {NAV_LINKS.map(([to, label]) => (
              <Link to={to} key={to}>
                {label}
                <ArrowRight size={16} weight="bold" />
              </Link>
            ))}
            <Link to="/wishlist">
              Sản phẩm yêu thích <Heart size={16} weight="bold" />
            </Link>
            <Link to="/notifications">
              Thông báo <Bell size={16} weight="bold" />
            </Link>
            <div className="mobile-theme-row">
              <span>Chế độ hiển thị</span>
              <ThemeToggle />
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
