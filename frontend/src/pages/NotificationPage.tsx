import { useState } from 'react'
import { Bell, Package, ShoppingBag, Tag, X, CheckCheck } from 'lucide-react'
import { useNotifStore } from '../store'

const TYPE_ICON = { order: ShoppingBag, taobao: Package, promo: Tag }
export default function NotificationsPage() {
  const { notifs, markRead, markAllRead, remove } = useNotifStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const unreadCount = notifs.filter(n => !n.read).length
  const displayed = filter === 'unread' ? notifs.filter(n => !n.read) : notifs
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="eyebrow mb-3">YOUR LITTLE UPDATES</p><div className="flex items-center justify-between mb-3 gap-3"><h1>Thông báo</h1>{unreadCount > 0 && <button className="text-link" onClick={markAllRead}><CheckCheck size={15} /> Đọc tất cả</button>}</div><p className="text-sm text-gray-400 mb-8">Những cập nhật dành riêng cho bạn.</p>
      <div className="notification-tabs">{([['all', 'Tất cả'], ['unread', `Chưa đọc (${unreadCount})`]] as const).map(([value, label]) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {displayed.length === 0 ? <div className="catalog-message"><Bell size={32} strokeWidth={1} /><h2>{filter === 'unread' ? 'Bạn đã xem hết thông báo' : 'Mọi thứ vẫn thật yên bình'}</h2><p>Thông tin về đơn hàng và những cập nhật mới sẽ xuất hiện ở đây.</p></div> : <div className="notification-list">{displayed.map(n => { const Icon = TYPE_ICON[n.type]; return <div key={n.id} className={`notification-row ${n.read ? '' : 'unread'}`}><Icon size={21} strokeWidth={1.2} /><button className="notification-content" onClick={() => markRead(n.id)}><strong>{n.title}</strong><p>{n.message}</p><small>{n.time}{!n.read && ' · Chưa đọc'}</small></button><button className="icon-button" aria-label={`Xóa thông báo ${n.title}`} onClick={() => remove(n.id)}><X size={15} /></button></div> })}</div>}
    </div>
  )
}
