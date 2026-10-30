import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../Components/ProductCard'

const categories = [
  { label: 'Home & living', key: 'home', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85' },
  { label: 'Clothing', key: 'fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85' },
  { label: 'Art & paper', key: 'art', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=85' },
  { label: 'Jewellery', key: 'jewellery', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85' },
]

export default function Home({ products, loading, onAdd }) {
  const navigate = useNavigate()
  const featured = products.slice(0, 4)
  return (
    <main>
      <section className="market-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Independent makers, one thoughtful place</div>
          <h1>Good things<br />find <em>their people.</em></h1>
          <p>A marketplace for useful, beautiful things made in small batches by people who care how they’re made.</p>
          <div className="hero-buttons"><Link className="button button-ink" to="/products">Find your next favourite <span>↗</span></Link><button className="button button-outline" onClick={() => document.getElementById('makers')?.scrollIntoView({ behavior: 'smooth' })}>Meet the makers</button></div>
          <div className="hero-quiet-proof"><span className="proof-seal">T</span><span><b>Small on purpose.</b><br />Made thoughtfully. Chosen carefully.</span></div>
        </div>
        <div className="hero-scene">
          <div className="scene-main"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=90" alt="Thoughtfully designed home objects on a quiet shelf" /><div className="scene-caption"><span>01 / 04</span><b>Objects for the everyday, made a little more special.</b></div></div>
          <div className="scene-small scene-small-top"><img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=85" alt="Handmade stoneware pottery" /></div>
          <div className="scene-small scene-small-bottom"><img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=85" alt="A delicate piece of handmade jewellery" /></div>
          <div className="scene-stamp">Made by<br /><i>many hands</i> <span>✳</span></div>
        </div>
        <div className="hero-footnotes"><span>Made in small batches</span><span>Shared by independent stores</span><span>Kept in the good rotation</span></div>
      </section>

      <section className="values-ribbon"><span>✳ Thoughtfully made</span><span>Independent by nature</span><span>Good things, together</span><span>Made with care</span></section>

      <section className="section-wrap category-section">
        <div className="section-intro"><div><div className="eyebrow"><span /> A place for every kind of good thing</div><h2>Find your kind of <em>everyday.</em></h2></div><Link className="underlined-link" to="/products">Explore all categories <span>↗</span></Link></div>
        <div className="category-grid">{categories.map((category, index) => <button className={`category-tile tile-${index + 1}`} key={category.key} onClick={() => navigate(`/products?category=${category.key}`)}><img src={category.image} alt="" loading="lazy" /><span className="category-shade" /><span className="category-number">0{index + 1}</span><b>{category.label}</b><span className="category-arrow">↗</span></button>)}</div>
      </section>

      <section className="section-wrap featured-section">
        <div className="section-intro"><div><div className="eyebrow"><span /> A few good finds</div><h2>Made to be <em>kept.</em></h2><p>Good design makes the everyday feel a little more like yours.</p></div><Link className="underlined-link" to="/products">See all the finds <span>↗</span></Link></div>
        {loading ? <div className="catalog-loading">Gathering the good things…</div> : featured.length ? <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <div className="empty-market"><span>✳</span><div><b>The shelves are ready.</b><p>Start the backend and add sample listings to bring this marketplace to life.</p></div><Link to="/products">Browse the shop ↗</Link></div>}
      </section>

      <section className="makers-band" id="makers"><div className="makers-image"><img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85" alt="Maker working in a bright studio" /></div><div className="makers-copy"><div className="eyebrow eyebrow-light"><span /> Built around independent work</div><h2>Made by many.<br /><em>Better together.</em></h2><p>We give small studios and independent makers a place to find their people. One shop, your own story, and room to grow at your pace.</p><Link className="button button-paper" to="/register?type=seller">Open your studio <span>↗</span></Link><div className="maker-note">A marketplace that leaves space for the people who make it.</div></div></section>
      <section className="manifesto"><span className="manifesto-spark">✳</span><p>“A little more intention in what we buy<br />can make a <em>world of difference.</em>”</p><span>THE TANDEM THOUGHT</span></section>
    </main>
  )
}
