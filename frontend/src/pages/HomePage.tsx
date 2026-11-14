import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  Handshake,
  Truck,
  Sparkle,
  CaretDown,
  Plant
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import Snap from 'lenis/snap'
import { useLenis } from '../context/LenisContext'
import ProductCard from '../components/ui/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import { productService } from '../services/api'
import type { Product } from '../types'

const BEAR = 'https://images.unsplash.com/photo-1602734846297-9299fc2d4703?auto=format&fit=crop&w=1200&q=85'
const JOURNAL = 'https://images.unsplash.com/photo-1523634540939-0be5fba32c8f?auto=format&fit=crop&w=900&q=85'
const SOFT = 'https://images.unsplash.com/photo-1562040506-a9b32cb51b94?auto=format&fit=crop&w=900&q=85'

const SCREENS = [
  { id: 'screen-hero', label: 'Trang đầu' },
  { id: 'screen-collections', label: 'Bộ sưu tập' },
  { id: 'screen-featured', label: 'Đáng yêu' },
  { id: 'screen-story', label: 'Peatea & Taobao' },
]

/** Reveal animation hook — adds .is-visible class when element enters viewport */
function useReveal(rootMargin = '0px 0px -80px 0px') {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!els.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.delay ?? '0'
            setTimeout(() => el.classList.add('is-visible'), Number(delay))
            obs.unobserve(el)
          }
        })
      },
      { rootMargin, threshold: 0.08 }
    )

    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [rootMargin])
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [activeScreen, setActiveScreen] = useState(0)

  const { lenis } = useLenis()
  const screensRef = useRef<(HTMLElement | null)[]>([])
  const snapRef = useRef<InstanceType<typeof Snap> | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    productService.getFeatured()
      .then(r => { if (active) setFeatured(r.data.data ?? []) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  // Reveal animation
  useReveal()

  // Setup Lenis Snap — snaps screen 2 & 3 (middle), leaves top/bottom free
  useEffect(() => {
    if (!lenis) return
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop) return

    const snap = new Snap(lenis, {
      type: 'proximity',
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      distanceThreshold: '65%',
      onSnapComplete: (item) => {
        if (typeof item.index === 'number' && item.index < SCREENS.length) {
          setActiveScreen(item.index)
        }
      },
    })
    snapRef.current = snap

    // Only register the MIDDLE screens (index 1 & 2) for snapping
    screensRef.current.forEach((el, idx) => {
      if (el && idx >= 1 && idx <= 2) {
        snap.addElement(el, { align: 'start' })
      }
    })

    const handleScroll = () => {
      const scrollY = lenis.scroll
      const viewportHeight = window.innerHeight
      const threshold = viewportHeight * 0.35
      for (let i = screensRef.current.length - 1; i >= 0; i--) {
        const el = screensRef.current[i]
        if (el && scrollY >= el.offsetTop - threshold) {
          setActiveScreen(i)
          break
        }
      }
    }

    lenis.on('scroll', handleScroll)

    return () => {
      snap.destroy()
      snapRef.current = null
      lenis.off('scroll', handleScroll)
    }
  }, [lenis])

  const scrollToScreen = useCallback((index: number) => {
    const el = screensRef.current[index]
    if (el && lenis) {
      lenis.scrollTo(el, {
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenis])

  return (
    <div className="home-page landing-snap-container">
      {/* Floating navigation dots */}
      <nav className="landing-dots" aria-label="Điều hướng các phần trang chủ">
        {SCREENS.map((screen, idx) => (
          <button
            key={screen.id}
            type="button"
            className={`landing-dot ${activeScreen === idx ? 'is-active' : ''}`}
            onClick={() => scrollToScreen(idx)}
            aria-label={`Chuyển đến phần ${screen.label}`}
          >
            <span className="dot-bullet" />
            <span className="dot-label">{screen.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Screen 1: Hero & Service Strip ─────────────────────────── */}
      <section
        ref={(el) => { screensRef.current[0] = el }}
        className="landing-screen landing-screen-hero"
        id="screen-hero"
      >
        <div className="hero-section shell">
          <div className="hero-copy">
            <p className="eyebrow" data-reveal data-delay="0">
              <span className="tiny-line" /> A LITTLE JOY, EVERY DAY
            </p>
            <h1 data-reveal data-delay="80">
              Những điều nhỏ.<br /><em>Niềm vui lớn.</em>
            </h1>
            <p className="hero-description" data-reveal data-delay="180">
              Một người bạn mềm mại, một món đồ thật xinh.<br className="desktop-break" />
              Peatea chọn những điều dễ thương để ngày của bạn<br className="desktop-break" />
              nhẹ nhàng hơn một chút.
            </p>
            <div className="hero-actions" data-reveal data-delay="260">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Link to="/shop" className="btn-primary">
                  Khám phá cửa hàng <ArrowUpRight size={17} weight="bold" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Link to="/shop?new=1" className="text-link">
                  Có gì mới? <ArrowRight size={16} weight="bold" />
                </Link>
              </motion.div>
            </div>
            <div className="hero-footnote" data-reveal data-delay="340">
              <Plant size={17} weight="duotone" />
              <span>Được chọn bằng sự quan tâm, dành cho bạn.</span>
            </div>
          </div>

          <div className="hero-visual" data-reveal="scale" data-delay="100">
            <img
              className="hero-photo"
              src={BEAR}
              alt="Chú gấu bông nâu mềm mại với chiếc nơ nhỏ, trên nền tối giản"
              {...{ fetchpriority: 'high' }}
            />
            <span className="hero-photo-note">SOFT THINGS. SLOW MOMENTS.</span>
            <div className="hero-photo-bottom">
              <div>
                <span>THE SOFT SIDE OF LIFE</span>
                <p>Mềm mại theo cách của bạn.</p>
              </div>
              <motion.div whileHover={{ y: -3, scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Link to="/shop" aria-label="Khám phá bộ sưu tập">
                  <ArrowUpRight size={22} weight="bold" />
                </Link>
              </motion.div>
            </div>
            <div className="hero-stamp">
              <Sparkle size={19} weight="duotone" />
              <span>small things<br /><i>with love</i></span>
            </div>
          </div>
        </div>

        <div className="service-strip shell">
          {[
            { icon: Package, title: 'Chọn lựa có tâm', text: 'Chăm chút từng món đồ' },
            { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Niềm vui đến tận cửa' },
            { icon: Handshake, title: 'Luôn ở đây vì bạn', text: 'Tư vấn trước & sau mua' },
          ].map(({ icon: Icon, title, text }, i) => (
            <div key={title} data-reveal data-delay={String(420 + i * 80)}>
              <Icon size={24} weight="duotone" />
              <span><strong>{title}</strong><small>{text}</small></span>
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          className="scroll-indicator"
          onClick={() => scrollToScreen(1)}
          aria-label="Cuộn xuống khám phá thêm"
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <span>Cuộn để khám phá</span>
          <CaretDown size={17} weight="bold" className="scroll-arrow" />
        </motion.button>
      </section>

      {/* ── Screen 2: Curated Collections ──────────────────────────── */}
      <section
        ref={(el) => { screensRef.current[1] = el }}
        className="landing-screen landing-screen-collection"
        id="screen-collections"
      >
        <div className="shell collection-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal data-delay="0">THE LITTLE COLLECTIONS</p>
              <h2 data-reveal data-delay="80">Tìm một chút <em>niềm vui.</em></h2>
            </div>
            <p data-reveal data-delay="140">Cho bạn, hoặc cho một người đặc biệt.</p>
          </div>
          <div className="collection-grid">
            {[
              {
                to: '/shop?q=squishy',
                delay: '100',
                content: (
                  <>
                    <div className="squishy-art" aria-hidden="true">
                      <div className="squishy-orbit" />
                      <div className="mochi mochi-back" />
                      <div className="mochi mochi-front"><span /><span /></div>
                      <span className="art-caption">TAKE A BREATH. GIVE IT A SQUEEZE.</span>
                    </div>
                    <div className="collection-caption">
                      <div><small>MỘT CHÚT THƯ GIÃN</small><h3>Squishy</h3></div>
                      <ArrowUpRight size={22} weight="bold" />
                    </div>
                  </>
                ),
                extra: 'squishy-collection',
              },
              {
                to: '/shop?q=plush',
                delay: '200',
                content: (
                  <>
                    <img src={SOFT} alt="Gấu bông thủ công với gam màu ấm áp" loading="lazy" />
                    <div className="collection-caption">
                      <div><small>MỘT CÁI ÔM THẬT ÊM</small><h3>Gấu bông & plushie</h3></div>
                      <ArrowUpRight size={22} weight="bold" />
                    </div>
                  </>
                ),
              },
              {
                to: '/shop?q=stationery',
                delay: '300',
                content: (
                  <>
                    <img src={JOURNAL} alt="Sổ tay và những vật dụng cho một ngày bình yên" loading="lazy" />
                    <div className="collection-caption">
                      <div><small>CHO GÓC NHỎ CỦA BẠN</small><h3>Văn phòng phẩm</h3></div>
                      <ArrowUpRight size={22} weight="bold" />
                    </div>
                  </>
                ),
              },
            ].map((card) => (
              <motion.div
                key={card.to}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <Link
                  to={card.to}
                  className={`collection-card${card.extra ? ` ${card.extra}` : ''}`}
                  data-reveal="up"
                  data-delay={card.delay}
                >
                  {card.content}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screen 3: Featured Products ─────────────────────────────── */}
      <section
        ref={(el) => { screensRef.current[2] = el }}
        className="landing-screen landing-screen-featured"
        id="screen-featured"
      >
        <div className="shell featured-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal data-delay="0">CURATED BY PEATEA</p>
              <h2 data-reveal data-delay="80">Những món đồ <em>đáng yêu.</em></h2>
            </div>
            <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Link to="/shop" className="text-link" data-reveal data-delay="140">
                Xem tất cả sản phẩm <ArrowRight size={17} weight="bold" />
              </Link>
            </motion.div>
          </div>
          {loading ? (
            <PageLoader />
          ) : featured.length ? (
            <div className="product-grid">
              {featured.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} revealDelay={i * 90} />
              ))}
            </div>
          ) : (
            <div className="catalog-message" data-reveal>
              <Package size={30} weight="duotone" />
              <h3>{error ? 'Bộ sưu tập đang chờ kết nối' : 'Những điều mới đang được chuẩn bị'}</h3>
              <p>
                {error
                  ? 'Chúng mình chưa tải được sản phẩm. Bạn có thể thử lại sau một chút.'
                  : 'Ghé lại Peatea để khám phá những món đồ mới nhé.'}
              </p>
              {error ? (
                <button type="button" className="text-link" onClick={() => setAttempt((a) => a + 1)}>
                  Thử tải lại <ArrowRight size={15} weight="bold" />
                </button>
              ) : (
                <Link to="/shop" className="text-link">Ghé cửa hàng <ArrowRight size={15} weight="bold" /></Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Screen 4: Taobao & Brand Story ─────────────────────────── */}
      <section
        ref={(el) => { screensRef.current[3] = el }}
        className="landing-screen landing-screen-story"
        id="screen-story"
      >
        <div className="shell story-content">
          <div className="taobao-banner" data-reveal="up" data-delay="0">
            <div className="taobao-number">01 <span>→</span> 02 <span>→</span> Bạn.</div>
            <div>
              <p className="eyebrow">FROM TAOBAO, WITH CARE</p>
              <h2>Bạn tìm thấy. <em>Peatea mang về.</em></h2>
              <p>
                Gửi chúng mình đường link món đồ bạn thích.<br />
                Phần đặt hàng và vận chuyển, để Peatea lo.
              </p>
            </div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Link to="/taobao" className="btn-outline">
                Đặt hộ Taobao <ArrowUpRight size={17} weight="bold" />
              </Link>
            </motion.div>
          </div>

          <div className="brand-story" data-reveal="up" data-delay="140">
            <p className="eyebrow">A NOTE FROM PEATEA</p>
            <h2>Không cần thật nhiều.<br />Chỉ cần những điều khiến bạn <em>mỉm cười.</em></h2>
            <p>
              Peatea tin rằng niềm vui có thể bắt đầu từ những thứ rất nhỏ.<br />
              Cảm ơn bạn đã để chúng mình trở thành một phần trong ngày của bạn.
            </p>
            <span className="story-signature">with love, peatea.</span>
          </div>
        </div>
      </section>
    </div>
  )
}
