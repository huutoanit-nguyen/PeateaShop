import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, ArrowLeft, ArrowRight, Package, Truck, Minus, Plus } from 'lucide-react'
import { productService } from '../services/api'
import { useCartStore, useWishlistStore } from '../store'
import ProductCard from '../components/ui/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import toast from 'react-hot-toast'
import type { Product } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const [activeImg, setActiveImg] = useState(0)
  const [variant, setVariant] = useState<string | undefined>()
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlistStore()
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    setLoading(true); setFailed(false); setProduct(null); setRelated([])
    setActiveImg(0); setQty(1); setVariant(undefined)
    productService.getById(Number(id)).then(r => {
      if (!active) return
      const p = r.data.data as Product | null
      setProduct(p)
      if (p) productService.search({ categoryId: p.categoryId, size: 4 })
        .then(res => { if (active) setRelated((res.data.data?.content ?? []).filter((item: Product) => item.id !== p.id).slice(0, 3)) }).catch(() => {})
    }).catch(() => { if (active) setFailed(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, retry])
  if (loading) return <PageLoader className="page-loader detail-loading" />
  if (!product) return <div className="shell not-found"><p className="eyebrow">PEATEA COLLECTION</p><h1>{failed ? 'Chưa thể tải sản phẩm.' : 'Món đồ này chưa có ở đây.'}</h1><p>Vui lòng thử lại hoặc khám phá những món đồ khác tại Peatea.</p><div className="flex justify-center gap-4 flex-wrap"><Link to="/shop" className="btn-outline">Về cửa hàng</Link>{failed && <button className="btn-primary" onClick={() => setRetry(v => v + 1)}>Thử lại</button>}</div></div>
  const outOfStock = product.stock <= 0
  const add = (checkout: boolean) => {
    if (outOfStock) return
    if (product.variants.length && !variant) { toast.error('Vui lòng chọn phân loại sản phẩm'); return }
    addItem(product, variant, qty)
    if (checkout) navigate('/cart')
    else toast.success('Đã thêm sản phẩm vào giỏ hàng')
  }
  return (
    <div className="shell detail-page">
      <Link to="/shop" className="text-link detail-back"><ArrowLeft size={15} /> Cửa hàng <span>/</span> {product.categoryName}</Link>
      <div className="detail-grid">
        <div className="detail-gallery"><div className="detail-main-image"><img src={product.imageUrls[activeImg] || '/product-placeholder.svg'} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} alt={product.name} />{product.newArrival && <span className="product-label">Mới về</span>}</div>{product.imageUrls.length > 1 && <div className="detail-thumbnails">{product.imageUrls.map((url, i) => <button key={url + i} className={activeImg === i ? 'selected' : ''} onClick={() => setActiveImg(i)} aria-label={`Xem ảnh ${i + 1}`} aria-pressed={activeImg === i}><img src={url} alt="" /></button>)}</div>}</div>
        <div className="detail-info"><p className="eyebrow">{product.categoryName} / PEATEA SELECTION</p><h1>{product.name}</h1><p className="detail-price">{product.price.toLocaleString('vi-VN')} ₫</p><p className="detail-stock"><span className={outOfStock ? 'unavailable' : ''} />{outOfStock ? 'Tạm hết hàng' : `Còn ${product.stock} sản phẩm`}</p><div className="detail-description">{product.description || 'Một món đồ nhỏ được Peatea chọn lựa dành cho bạn. Liên hệ với chúng mình nếu bạn cần thêm thông tin về sản phẩm.'}</div>
          {product.variants.length > 0 && <fieldset className="detail-variants"><legend>Phân loại <span>{variant ? `— ${variant}` : '— Chọn một loại'}</span></legend><div>{product.variants.map(v => <button className={variant === v ? 'selected' : ''} onClick={() => setVariant(v)} key={v} aria-pressed={variant === v}>{v}</button>)}</div></fieldset>}
          <div className="detail-quantity"><span>Số lượng</span><div><button aria-label="Giảm số lượng" disabled={qty <= 1} onClick={() => setQty(v => Math.max(1, v - 1))}><Minus size={15} /></button><span>{qty}</span><button aria-label="Tăng số lượng" disabled={outOfStock || qty >= product.stock} onClick={() => setQty(v => Math.min(product.stock, v + 1))}><Plus size={15} /></button></div></div>
          <div className="detail-buttons"><button className="btn-primary" disabled={outOfStock} onClick={() => add(false)}><ShoppingBag size={17} /> Thêm vào giỏ</button><button className={`detail-save ${has(product.id) ? 'selected' : ''}`} aria-label="Lưu sản phẩm yêu thích" aria-pressed={has(product.id)} onClick={() => toggle(product.id)}><Heart size={19} /></button></div><button className="btn-outline detail-buy" disabled={outOfStock} onClick={() => add(true)}>Mua ngay <ArrowRight size={17} /></button>
          <div className="detail-services"><p><Truck size={17} strokeWidth={1.4} /> Giao hàng toàn quốc</p><p><Package size={17} strokeWidth={1.4} /> Đóng gói cẩn thận, gửi đi bằng sự quan tâm</p></div>
        </div>
      </div>
      {related.length > 0 && <section className="detail-related"><div className="section-heading"><div><p className="eyebrow">A LITTLE MORE JOY</p><h2>Có thể bạn <em>cũng thích.</em></h2></div><Link className="text-link" to="/shop">Khám phá thêm <ArrowRight size={16} /></Link></div><div className="shop-product-grid">{related.map(p => <ProductCard key={p.id} product={p} />)}</div></section>}
    </div>
  )
}
