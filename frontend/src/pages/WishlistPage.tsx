import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import { useWishlistStore } from '../store'
import { productService } from '../services/api'
import type { Product } from '../types'

export default function WishlistPage() {
  const { ids } = useWishlistStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return }
    setLoading(true)
    // Lấy tất cả sản phẩm rồi filter theo wishlist ids
    // (Nếu backend hỗ trợ batch-get-by-ids thì thay bằng API riêng cho tối ưu hơn)
    productService.getAll({ size: 100 })
      .then(r => {
        const all: Product[] = r.data.data?.content ?? []
        setProducts(all.filter(p => ids.includes(p.id)))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [ids])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-1">
        <Heart size={18} className="fill-pink-500 text-pink-500" />
        <p className="text-pink-500 text-sm font-bold">Sản phẩm yêu thích</p>
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-1">Những món đồ bạn yêu</h1>
      <p className="text-gray-400 text-sm mb-8">{ids.length} sản phẩm đã lưu</p>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="empty-state-icon"><Heart /></div>
          <p className="font-bold text-gray-600 mb-2">Chưa có sản phẩm yêu thích nào</p>
          <p className="text-sm text-gray-400 mb-5">Chạm vào biểu tượng trái tim để lưu món đồ bạn thích.</p>
          <Link to="/shop" className="btn-primary inline-block px-8">Khám phá ngay</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
