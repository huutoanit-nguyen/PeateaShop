import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, PackageCheck, HeartHandshake, Truck, MoveUpRight, Leaf } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import { productService } from '../services/api'
import type { Product } from '../types'

const BEAR = 'https://images.unsplash.com/photo-1602734846297-9299fc2d4703?auto=format&fit=crop&w=1200&q=85'
const JOURNAL = 'https://images.unsplash.com/photo-1523634540939-0be5fba32c8f?auto=format&fit=crop&w=900&q=85'
const SOFT = 'https://images.unsplash.com/photo-1562040506-a9b32cb51b94?auto=format&fit=crop&w=900&q=85'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError(false)
    productService.getFeatured().then(r => { if (active) setFeatured(r.data.data ?? []) })
      .catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  return (
    <div className="home-page">
      <section className="hero-section shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="tiny-line" /> A LITTLE JOY, EVERY DAY</p>
          <h1>Những điều nhỏ.<br /><em>Niềm vui lớn.</em></h1>
          <p className="hero-description">Một người bạn mềm mại, một món đồ thật xinh.<br className="desktop-break" /> Peatea chọn những điều dễ thương để ngày của bạn<br className="desktop-break" /> nhẹ nhàng hơn một chút.</p>
          <div className="hero-actions"><Link to="/shop" className="btn-primary">Khám phá cửa hàng <ArrowUpRight size={17} /></Link><Link to="/shop?new=1" className="text-link">Có gì mới? <ArrowRight size={16} /></Link></div>
          <div className="hero-footnote"><Leaf size={16} strokeWidth={1.4} /><span>Được chọn bằng sự quan tâm, dành cho bạn.</span></div>
        </div>
        <div className="hero-visual">
          <img className="hero-photo" src={BEAR} alt="Chú gấu bông nâu mềm mại với chiếc nơ nhỏ, trên nền tối giản" {...{ fetchpriority: 'high' }} />
          <span className="hero-photo-note">SOFT THINGS. SLOW MOMENTS.</span>
          <div className="hero-photo-bottom"><div><span>THE SOFT SIDE OF LIFE</span><p>Mềm mại theo cách của bạn.</p></div><Link to="/shop" aria-label="Khám phá bộ sưu tập"><MoveUpRight size={23} strokeWidth={1.2} /></Link></div>
          <div className="hero-stamp"><Leaf size={19} strokeWidth={1} /><span>small things<br /><i>with love</i></span></div>
        </div>
      </section>

      <div className="service-strip shell">
        {[{ icon: PackageCheck, title: 'Chọn lựa có tâm', text: 'Chăm chút từng món đồ' }, { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Niềm vui đến tận cửa' }, { icon: HeartHandshake, title: 'Luôn ở đây vì bạn', text: 'Tư vấn trước & sau mua' }].map(({ icon: Icon, title, text }) => <div key={title}><Icon size={23} strokeWidth={1.25} /><span><strong>{title}</strong><small>{text}</small></span></div>)}
      </div>

      <section className="shell collection-section">
        <div className="section-heading"><div><p className="eyebrow">THE LITTLE COLLECTIONS</p><h2>Tìm một chút <em>niềm vui.</em></h2></div><p>Cho bạn, hoặc cho một người đặc biệt.</p></div>
        <div className="collection-grid">
          <Link to="/shop?q=squishy" className="collection-card squishy-collection"><div className="squishy-art" aria-hidden="true"><div className="squishy-orbit" /><div className="mochi mochi-back" /><div className="mochi mochi-front"><span /><span /></div><span className="art-caption">TAKE A BREATH. GIVE IT A SQUEEZE.</span></div><div className="collection-caption"><div><small>MỘT CHÚT THƯ GIÃN</small><h3>Squishy</h3></div><ArrowUpRight size={22} strokeWidth={1.3} /></div></Link>
          <Link to="/shop?q=plush" className="collection-card"><img src={SOFT} alt="Gấu bông thủ công với gam màu ấm áp" loading="lazy" /><div className="collection-caption"><div><small>MỘT CÁI ÔM THẬT ÊM</small><h3>Gấu bông & plushie</h3></div><ArrowUpRight size={22} strokeWidth={1.3} /></div></Link>
          <Link to="/shop?q=stationery" className="collection-card"><img src={JOURNAL} alt="Sổ tay và những vật dụng cho một ngày bình yên" loading="lazy" /><div className="collection-caption"><div><small>CHO GÓC NHỎ CỦA BẠN</small><h3>Văn phòng phẩm</h3></div><ArrowUpRight size={22} strokeWidth={1.3} /></div></Link>
        </div>
      </section>

      <section className="shell featured-section">
        <div className="section-heading"><div><p className="eyebrow">CURATED BY PEATEA</p><h2>Những món đồ <em>đáng yêu.</em></h2></div><Link to="/shop" className="text-link">Xem tất cả sản phẩm <ArrowRight size={17} /></Link></div>
        {loading ? <PageLoader /> : featured.length ? <div className="product-grid">{featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="catalog-message"><PackageCheck size={28} strokeWidth={1.1} /><h3>{error ? 'Bộ sưu tập đang chờ kết nối' : 'Những điều mới đang được chuẩn bị'}</h3><p>{error ? 'Chúng mình chưa tải được sản phẩm. Bạn có thể thử lại sau một chút.' : 'Ghé lại Peatea để khám phá những món đồ mới nhé.'}</p>{error ? <button className="text-link" onClick={() => setAttempt(a => a + 1)}>Thử tải lại <ArrowRight size={15} /></button> : <Link to="/shop" className="text-link">Ghé cửa hàng <ArrowRight size={15} /></Link>}</div>}
      </section>

      <section className="taobao-banner shell">
        <div className="taobao-number">01 <span>→</span> 02 <span>→</span> Bạn.</div>
        <div><p className="eyebrow">FROM TAOBAO, WITH CARE</p><h2>Bạn tìm thấy. <em>Peatea mang về.</em></h2><p>Gửi chúng mình đường link món đồ bạn thích.<br />Phần đặt hàng và vận chuyển, để Peatea lo.</p></div>
        <Link to="/taobao" className="btn-outline">Đặt hộ Taobao <ArrowUpRight size={17} /></Link>
      </section>

      <section className="brand-story shell"><p className="eyebrow">A NOTE FROM PEATEA</p><h2>Không cần thật nhiều.<br />Chỉ cần những điều khiến bạn <em>mỉm cười.</em></h2><p>Peatea tin rằng niềm vui có thể bắt đầu từ những thứ rất nhỏ.<br />Cảm ơn bạn đã để chúng mình trở thành một phần trong ngày của bạn.</p><span className="story-signature">with love, peatea.</span></section>
    </div>
  )
}
