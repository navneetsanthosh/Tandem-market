import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../Components/ProductCard'

const categories = [
  ['all', 'All finds'], ['home', 'Home & living'], ['fashion', 'Clothing'], ['art', 'Art & paper'],
  ['beauty', 'Beauty & care'], ['food', 'Food & pantry'], ['jewellery', 'Jewellery'],
]

export default function Products({ products, loading, onAdd }) {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState('newest')
  const visible = useMemo(() => {
    const filtered = products.filter((item) => (category === 'all' || item.category === category) && (!query || `${item.name} ${item.description} ${item.store_name}`.toLowerCase().includes(query.toLowerCase())))
    if (sort === 'price_low') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price_high') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
    return filtered
  }, [products, category, query, sort])

  return (
    <main className="catalog-page section-wrap">
      <div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><b>Shop all</b></div>
      <div className="catalog-heading"><div><div className="eyebrow"><span /> The whole good collection</div><h1>Good things, <em>all here.</em></h1><p>Useful, beautiful and made with a little more care.</p></div><div className="catalog-count">{visible.length.toString().padStart(2, '0')} <span>finds to explore</span></div></div>
      <div className="catalog-controls"><div className="filter-pills">{categories.map(([key, label]) => <button key={key} className={category === key ? 'is-active' : ''} onClick={() => setCategory(key)}>{label}</button>)}</div><div className="catalog-tools"><label className="catalog-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="newest">Recently added</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option></select></div></div>
      {loading ? <div className="catalog-loading">Gathering the good things…</div> : visible.length ? <div className="product-grid catalog-grid">{visible.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <div className="empty-market catalog-empty"><span>⌕</span><div><b>No finds by that name yet.</b><p>Try another search or browse the whole collection.</p></div><button className="underlined-link" onClick={() => { setCategory('all'); setQuery('') }}>Clear filters ↗</button></div>}
    </main>
  )
}
