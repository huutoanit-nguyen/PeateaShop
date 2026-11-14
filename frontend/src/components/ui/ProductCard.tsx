import { Heart, Plus, ArrowUpRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore, useWishlistStore } from '../../store'
import toast from 'react-hot-toast'

export default function ProductCard({ product, revealDelay }: { product: Product; revealDelay?: number }) {
  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlistStore()
  const navigate = useNavigate()
  const outOfStock = product.stock <= 0
  return (
    <article
      className={`product-card${revealDelay !== undefined ? ' product-card-animate' : ''}`}
      style={revealDelay !== undefined ? { animationDelay: `${revealDelay}ms` } : undefined}
    >
      <div className="product-image">
        <Link to={`/product/${product.id}`} aria-label={`Xem ${product.name}`}><img src={product.imageUrls[0] || '/product-placeholder.svg'} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} alt={product.name} loading="lazy" /></Link>
        {(outOfStock || product.newArrival) && <span className="product-label">{outOfStock ? 'Hết hàng' : 'Mới về'}</span>}
        <button className={`product-wish ${has(product.id) ? 'is-saved' : ''}`} aria-label={has(product.id) ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`} aria-pressed={has(product.id)} onClick={() => toggle(product.id)}><Heart size={17} /></button>
        <Link to={`/product/${product.id}`} className="product-quickview">Xem sản phẩm <ArrowUpRight size={16} /></Link>
      </div>
      <div className="product-meta"><div><p>{product.categoryName}</p><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><span className="product-price">{product.price.toLocaleString('vi-VN')} ₫</span></div>
        <button className="product-add" disabled={outOfStock} aria-label={`Thêm ${product.name} vào giỏ hàng`} onClick={() => {
          if (product.variants.length) { navigate(`/product/${product.id}`); return }
          addItem(product); toast.success('Đã thêm vào giỏ hàng')
        }}><Plus size={19} /></button>
      </div>
    </article>
  )
}
