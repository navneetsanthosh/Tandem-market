import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, imageSource, money } from '../api'

export default function ProductDetail({ products, onAdd }) {
  const { id } = useParams()
  const [product, setProduct] = useState(() => products.find((item) => String(item.id) === id) || null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(!product)
  const [error, setError] = useState('')

  useEffect(() => {
    const cached = products.find((item) => String(item.id) === id)
    if (cached) { setProduct(cached); setLoading(false); return }
    setLoading(true)
    api(`/products/${id}/`).then(setProduct).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [id, products])

  if (loading) return <main className="section-wrap catalog-loading">Opening this find…</main>
  if (error || !product) return <main className="section-wrap empty-market catalog-empty"><b>We couldn’t find this item.</b><Link className="underlined-link" to="/products">Back to the collection ↗</Link></main>
  const image = imageSource(product)
  return (
    <main className="section-wrap product-detail-page">
      <div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/products">Shop</Link><span>/</span><b>{product.name}</b></div>
      <div className="detail-layout"><div className="detail-photo">{image ? <img src={image} alt={product.name} /> : <span className="image-placeholder">Tandem<br />finds</span>}<span className="detail-photo-tag">Chosen with care</span></div><div className="detail-copy"><div className="eyebrow"><span /> {product.category_label || product.category}</div><h1>{product.name}</h1>{product.seller_id ? <Link className="detail-maker" to={`/stores/${product.seller_id}`}>From <b>{product.store_name || product.seller_name}</b> <span>↗</span></Link> : <span className="detail-maker">From <b>{product.store_name || product.seller_name || 'Independent maker'}</b></span>}<div className="detail-price">{money(product.price)} <small>INR</small></div><p className="detail-description">{product.description}</p><div className="detail-stock"><span /> {product.stock > 0 ? `${product.stock} available from this maker` : 'This item is currently sold out'}</div><div className="detail-buy"><div className="quantity-stepper"><button onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Reduce quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity((current) => Math.min(product.stock || 1, current + 1))} aria-label="Increase quantity">+</button></div><button className="button button-ink" disabled={product.stock < 1} onClick={() => onAdd(product, quantity)}>{product.stock < 1 ? 'Out of stock' : 'Add to bag'} <span>↗</span></button></div><div className="detail-promises"><div><span>01</span><p><b>Made to be used</b><br />Considered objects for everyday life.</p></div><div><span>02</span><p><b>From real makers</b><br />Every listing belongs to an independent store.</p></div><div><span>03</span><p><b>Secure ordering</b><br />Your stock and total are checked at checkout.</p></div></div></div></div>
    </main>
  )
}
