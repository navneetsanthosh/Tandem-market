import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../Components/ProductCard'
import { api } from '../api'

export default function StorePage({ onAdd }) {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { setStore(null); setError(''); api(`/stores/${id}/`).then(setStore).catch((requestError) => setError(requestError.message)) }, [id])
  if (error) return <main className="section-wrap empty-market catalog-empty"><b>This studio isn’t here.</b><Link to="/products">Back to the shop ↗</Link></main>
  if (!store) return <main className="section-wrap catalog-loading">Finding this maker…</main>
  return <main className="section-wrap store-page"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/products">Shop</Link><span>/</span><b>{store.store_name}</b></div><div className="store-banner"><span className="store-monogram">{store.store_name.slice(0, 1)}</span><div><div className="eyebrow"><span /> Independent studio</div><h1>{store.store_name}<span>.</span></h1><p>{store.store_description || 'A little corner of Tandem, filled with things made thoughtfully.'}</p></div><span className="store-count">{store.product_count} listings</span></div><div className="section-intro store-listings-heading"><div><div className="eyebrow"><span /> From this maker</div><h2>Made with <em>intention.</em></h2></div></div>{store.products.length ? <div className="product-grid">{store.products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <div className="empty-market"><span>✳</span><div><b>New things are on the way.</b><p>This studio hasn’t published a listing yet.</p></div></div>}</main>
}
