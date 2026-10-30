import { Link } from 'react-router-dom'
import { imageSource, money } from '../api'

export default function ProductCard({ product, onAdd, showAdd = true }) {
  const image = imageSource(product)
  return (
    <article className="product-card">
      <Link className="product-card-image" to={`/products/${product.id}`}>
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <span className="image-placeholder">Tandem<br />finds</span>}
        {product.stock <= 3 && product.stock > 0 && <span className="stock-ribbon">Almost gone</span>}
        {product.stock === 0 && <span className="stock-ribbon sold-out">Sold out</span>}
      </Link>
      <div className="product-card-copy">
        <div className="product-card-meta"><span>{product.category_label || product.category}</span><span>·</span>{product.seller_id ? <Link to={`/stores/${product.seller_id}`}>{product.store_name || product.seller_name || 'Independent maker'}</Link> : <span>{product.store_name || product.seller_name || 'Independent maker'}</span>}</div>
        <Link className="product-card-title" to={`/products/${product.id}`}>{product.name}</Link>
        <div className="product-card-bottom"><strong>{money(product.price)}</strong>{showAdd && <button onClick={() => onAdd(product)} disabled={product.stock < 1}>{product.stock < 1 ? 'Sold out' : 'Add to bag'} <span>↗</span></button>}</div>
      </div>
    </article>
  )
}
