import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search, ArrowRight, PackageOpen } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import { productService, categoryService } from '../services/api'
import type { Product, Category } from '../types'

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [retry, setRetry] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const keyword = params.get('q') || ''
  const categoryId = params.get('category') || ''
  const newOnly = params.get('new') === '1'
  const sort = params.get('sort') || 'newest'
  const [search, setSearch] = useState(keyword)

  useEffect(() => { setSearch(keyword) }, [keyword])
  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data.data ?? [])).catch(() => {}) }, [])
  useEffect(() => { setPage(0) }, [keyword, categoryId, newOnly, sort, maxPrice])
  useEffect(() => {
    let active = true
    setLoading(true); setError(false)
    const timer = setTimeout(() => {
      productService.search({ keyword: keyword || undefined, categoryId: categoryId || undefined, maxPrice, newArrival: newOnly || undefined, sort, page, size: 12 })
        .then(r => { if (active) { const data = r.data.data; setProducts(data?.content ?? []); setTotal(data?.totalElements ?? data?.content?.length ?? 0); setTotalPages(data?.totalPages ?? 1) } })
        .catch(() => { if (active) { setProducts([]); setError(true) } })
        .finally(() => { if (active) setLoading(false) })
    }, 250)
    return () => { active = false; clearTimeout(timer) }
  }, [keyword, categoryId, newOnly, sort, maxPrice, page, retry])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setPage(0); setParams(next)
  }
  const clear = () => { setParams({}); setMaxPrice(1000000); setSearch(''); setPage(0) }
  const filters = <>
    <div className="filter-title">Bộ lọc <SlidersHorizontal size={16} /></div>
    <fieldset><legend>Danh mục</legend><button className={`category-filter ${!categoryId ? 'selected' : ''}`} onClick={() => update('category', '')}>Tất cả sản phẩm <ArrowRight size={13} /></button>{categories.map(c => <button key={c.id} className={`category-filter ${categoryId === String(c.id) ? 'selected' : ''}`} onClick={() => update('category', String(c.id))}>{c.name}<span>{c.productCount}</span></button>)}</fieldset>
    <fieldset><legend>Khoảng giá</legend><label htmlFor={showFilter ? 'mobile-price' : 'price'} className="price-label">Tối đa {maxPrice.toLocaleString('vi-VN')} ₫</label><input id={showFilter ? 'mobile-price' : 'price'} type="range" min={50000} max={1000000} step={50000} value={maxPrice} onChange={e => { setPage(0); setMaxPrice(Number(e.target.value)) }} /><div className="range-labels"><span>50.000 ₫</span><span>1.000.000 ₫</span></div></fieldset>
    <label className="new-filter"><input type="checkbox" checked={newOnly} onChange={e => update('new', e.target.checked ? '1' : '')} /> Chỉ sản phẩm mới</label>
    <button className="clear-filters" onClick={clear}>Xóa bộ lọc <X size={13} /></button>
  </>
  return (
    <div className="shell shop-page">
      <div className="shop-heading"><p className="eyebrow">THE PEATEA EDIT</p><h1>{newOnly ? 'Một chút mới mẻ.' : 'Một góc nhỏ, thật xinh.'}</h1><p>Chọn món đồ khiến ngày của bạn dễ thương hơn.</p></div>
      <div className="shop-toolbar"><form onSubmit={e => { e.preventDefault(); update('q', search.trim()) }} className="shop-search"><Search size={17} /><input aria-label="Tìm sản phẩm" placeholder="Tìm món đồ bạn thích..." value={search} onChange={e => setSearch(e.target.value)} /><button type="submit" aria-label="Tìm kiếm"><ArrowRight size={18} /></button></form><div className="shop-sort"><span>{loading ? 'Đang tải...' : error ? 'Chưa thể tải sản phẩm' : `${total} sản phẩm`}</span><select aria-label="Sắp xếp sản phẩm" value={sort} onChange={e => update('sort', e.target.value)}><option value="newest">Mới nhất</option><option value="price_asc">Giá: thấp đến cao</option><option value="price_desc">Giá: cao đến thấp</option><option value="popular">Bán chạy</option></select><button className="mobile-filter-toggle" onClick={() => setShowFilter(true)} aria-label="Mở bộ lọc"><SlidersHorizontal size={18} /></button></div></div>
      <div className="shop-body"><aside className="shop-sidebar">{!showFilter && filters}</aside><section className="shop-results" aria-label="Danh sách sản phẩm" aria-live="polite">
        {(keyword || categoryId || newOnly || maxPrice < 1000000) && <div className="active-filters"><span>{keyword ? `Tìm kiếm: “${keyword}”` : 'Đang áp dụng bộ lọc'}</span><button onClick={clear}>Xóa tất cả <X size={12} /></button></div>}
        {loading ? <PageLoader /> : error || !products.length ? <div className="catalog-message"><PackageOpen size={36} strokeWidth={1} /><h2>{error ? 'Chưa thể tải bộ sưu tập' : 'Chưa tìm thấy món đồ phù hợp'}</h2><p>{error ? 'Vui lòng kiểm tra kết nối hoặc thử lại sau.' : 'Thử từ khóa khác hoặc điều chỉnh bộ lọc của bạn.'}</p><button className="btn-outline" onClick={error ? () => setRetry(v => v + 1) : clear}>{error ? 'Thử lại' : 'Xóa bộ lọc'}<ArrowRight size={16} /></button></div> : <><div className="shop-product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>{totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Trang trước</button><span>{page + 1} / {totalPages}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button></div>}</>}
      </section></div>
      {showFilter && <div className="filter-modal"><button className="modal-backdrop" aria-label="Đóng bộ lọc" onClick={() => setShowFilter(false)} /><div role="dialog" aria-modal="true" aria-label="Bộ lọc sản phẩm" className="filter-drawer"><button className="filter-close icon-button" aria-label="Đóng bộ lọc" onClick={() => setShowFilter(false)}><X size={20} /></button>{filters}<button className="btn-primary" onClick={() => setShowFilter(false)}>Xem kết quả <ArrowRight size={16} /></button></div></div>}
    </div>
  )
}
