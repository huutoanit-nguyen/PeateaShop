import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, UserRound, Bell, Search, Menu, X, ArrowRight } from 'lucide-react'
import { useCartStore, useWishlistStore, useAuthStore, useNotifStore } from '../../store'

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
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location.pathname, location.search])

  const links = [['/', 'Trang chủ'], ['/shop', 'Cửa hàng'], ['/taobao', 'Đặt hộ Taobao']]
  return (
    <>
      <div className="announcement"><span>Những món đồ nhỏ, niềm vui mỗi ngày.</span><Link to="/shop">Khám phá Peatea <ArrowRight size={12} /></Link></div>
      <header className="site-header">
        <div className="shell nav-inner">
          <Link to="/" className="brand" aria-label="Peatea — Trang chủ">peatea<span className="brand-dot">.</span><span className="brand-sub">LITTLE THINGS, BIG JOY</span></Link>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
          </nav>
          <div className="nav-actions">
            <button className="icon-button" aria-label="Tìm sản phẩm" aria-expanded={searchOpen} onClick={() => { setSearchOpen(v => !v); setMenuOpen(false) }}>{searchOpen ? <X size={19} /> : <Search size={19} />}</button>
            <Link className="icon-button optional-nav-icon" to="/wishlist" aria-label={`Yêu thích, ${wishlistCount} sản phẩm`}><Heart size={19} />{wishlistCount > 0 && <span className="count-dot">{wishlistCount}</span>}</Link>
            <Link className="icon-button optional-nav-icon" to="/notifications" aria-label={`Thông báo, ${unreadCount} chưa đọc`}><Bell size={18} />{unreadCount > 0 && <span className="count-dot">{unreadCount}</span>}</Link>
            <Link className="icon-button" to={user ? user.role === 'ADMIN' ? '/admin' : '/account' : '/login'} aria-label={user ? 'Tài khoản của bạn' : 'Đăng nhập'}><UserRound size={19} /></Link>
            <Link className="icon-button cart-link" to="/cart" aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}><ShoppingBag size={19} /><span className="cart-count">{itemCount}</span></Link>
            <button className="icon-button mobile-menu-button" onClick={() => { setMenuOpen(v => !v); setSearchOpen(false) }} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        {searchOpen && <form className="shell nav-search" onSubmit={e => { e.preventDefault(); navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`) }}>
          <Search size={20} /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Bạn đang tìm món đồ nào?" aria-label="Tên sản phẩm" /><button type="submit">Tìm kiếm <ArrowRight size={16} /></button>
        </form>}
        {menuOpen && <nav className="mobile-nav" aria-label="Điều hướng điện thoại">
          {links.map(([to, label]) => <Link to={to} key={to}>{label}<ArrowRight size={16} /></Link>)}
          <Link to="/wishlist">Sản phẩm yêu thích <Heart size={16} /></Link><Link to="/notifications">Thông báo <Bell size={16} /></Link>
        </nav>}      </header>
    </>
  )
}
