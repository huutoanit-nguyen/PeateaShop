import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package, Box, Users, LogOut, ArrowUpRight, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store'

const NAV = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/taobao', label: 'Đặt hộ Taobao', icon: Package },
  { to: '/admin/products', label: 'Sản phẩm', icon: Box },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false) }, [pathname])
  return (
    <div className="admin-shell">
      {open && <button className="modal-backdrop fixed z-40" aria-label="Đóng menu quản trị" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-logo"><Link to="/" className="brand">peatea.</Link><p>QUẢN LÝ CỬA HÀNG</p></div>
        <nav className="admin-nav" aria-label="Quản trị">{NAV.map(({ to, label, icon: Icon, end }) => <NavLink to={to} key={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={17} strokeWidth={1.5} />{label}</NavLink>)}</nav>
        <div className="admin-user"><strong>{user?.fullName ?? 'Quản trị viên'}</strong><span>{user?.email}</span><button onClick={() => { logout(); navigate('/admin/login') }}><LogOut size={14} /> Đăng xuất</button></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><button className="icon-button admin-menu-toggle" aria-label={open ? 'Đóng menu' : 'Mở menu quản trị'} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? <X size={20} /> : <Menu size={20} />}</button><p>Không gian quản trị <span className="hidden sm:inline">/ {NAV.find(n => n.to === pathname)?.label || 'Peatea'}</span></p><Link to="/">Xem cửa hàng <ArrowUpRight size={15} /></Link></header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
