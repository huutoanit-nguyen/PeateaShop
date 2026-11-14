import { Heart, Plus, ArrowUpRight } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '../../types'
import { useCartStore, useWishlistStore } from '../../store'
import toast from 'react-hot-toast'

export default function ProductCard({ product, revealDelay }: { product: Product; revealDelay?: number }) {
  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlistStore()
  const navigate = useNavigate()
  const outOfStock = product.stock <= 0
  const isSaved = has(product.id)

  return (
    <motion.article
      className={`product-card${revealDelay !== undefined ? ' product-card-animate' : ''}`}
      style={revealDelay !== undefined ? { animationDelay: `${revealDelay}ms` } : undefined}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
    >
      <div className="product-image">
        <Link to={`/product/${product.id}`} aria-label={`Xem ${product.name}`}>
          <img
            src={product.imageUrls[0] || '/product-placeholder.svg'}
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        {(outOfStock || product.newArrival) && (
          <span className={`product-label ${outOfStock ? 'is-out' : 'is-new'}`}>
            {outOfStock ? 'Hết hàng' : 'Mới về'}
          </span>
        )}
        <motion.button
          type="button"
          className={`product-wish ${isSaved ? 'is-saved' : ''}`}
          aria-label={isSaved ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`}
          aria-pressed={isSaved}
          onClick={() => toggle(product.id)}
          whileHover={{ scale: 1.15, y: -2 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 450, damping: 15 }}
        >
          <Heart size={18} weight={isSaved ? 'fill' : 'bold'} />
        </motion.button>
        <Link to={`/product/${product.id}`} className="product-quickview">
          <span>Xem chi tiết</span>
          <ArrowUpRight size={16} weight="bold" />
        </Link>
      </div>
      <div className="product-meta">
        <div>
          <p>{product.categoryName}</p>
          <Link to={`/product/${product.id}`}>
            <h3>{product.name}</h3>
          </Link>
          <span className="product-price">{product.price.toLocaleString('vi-VN')} ₫</span>
        </div>
        <motion.button
          type="button"
          className="product-add"
          disabled={outOfStock}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
          onClick={() => {
            if (product.variants.length) {
              navigate(`/product/${product.id}`)
              return
            }
            addItem(product)
            toast.success('Đã thêm vào giỏ hàng ✨')
          }}
          whileHover={{ scale: 1.12, y: -2.5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 450, damping: 15 }}
        >
          <Plus size={18} weight="bold" />
        </motion.button>
      </div>
    </motion.article>
  )
}
