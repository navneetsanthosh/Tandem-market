import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../Components/ProductCard'
import { api, money } from '../api'

const nextStatus = { new: 'packing', packing: 'shipped', shipped: 'delivered', delivered: 'delivered' }
const statusLabel = { new: 'New order', packing: 'Packing', shipped: 'On its way', delivered: 'Delivered' }

export default function SellerDashboard({ user, token }) {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [busyItem, setBusyItem] = useState(null)
  const load = useCallback(() => api('/seller/dashboard/', { token }).then(setDashboard).catch((requestError) => setError(requestError.message)), [token])
  useEffect(() => { load() }, [load])

  const advance = async (item) => {
    setBusyItem(item.id)
    try { await api(`/seller/items/${item.id}/status/`, { token, method: 'PATCH', body: { fulfillment_status: nextStatus[item.fulfillment_status] } }); await load() }
    catch (requestError) { setError(requestError.message) }
    finally { setBusyItem(null) }
  }

  if (error) return <main className="section-wrap seller-dashboard"><div className="form-error">{error}</div><Link to="/">Back to Tandem</Link></main>
  if (!dashboard) return <main className="section-wrap catalog-loading">Opening your studio…</main>
  const stats = dashboard.stats
  return (
    <main className="section-wrap seller-dashboard"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><b>Your studio</b></div><div className="seller-welcome"><div><div className="eyebrow"><span /> Seller studio</div><h1>Good morning, <em>{dashboard.store_name || user.username}.</em></h1><p>{dashboard.store_description || 'Your little corner of the Tandem marketplace.'}</p></div><Link className="button button-ink" to="/products/add">Add a listing <span>↗</span></Link></div><div className="seller-stat-grid"><div><span>Active listings</span><b>{stats.active_listings}</b><small>Good things out in the world</small></div><div><span>Available pieces</span><b>{stats.units_in_stock}</b><small>Across your current listings</small></div><div><span>Items to prepare</span><b>{stats.items_to_fulfil}</b><small>Orders that need your care</small></div><div><span>Sales value</span><b>{money(stats.sales_total)}</b><small>From orders placed here</small></div></div><section className="seller-section"><div className="section-intro"><div><div className="eyebrow"><span /> Your collection</div><h2>Out in the <em>world.</em></h2></div><Link className="underlined-link" to="/products/add">Add another listing ↗</Link></div>{dashboard.products.length ? <div className="product-grid">{dashboard.products.map((product) => <ProductCard key={product.id} product={product} showAdd={false} />)}</div> : <div className="empty-market"><span>✳</span><div><b>Your first listing starts here.</b><p>Show the marketplace what you make.</p></div><Link to="/products/add">Create a listing ↗</Link></div>}</section><section className="seller-section orders-section"><div className="section-intro"><div><div className="eyebrow"><span /> Care in every order</div><h2>Orders to <em>prepare.</em></h2></div><span className="orders-count">{dashboard.recent_items.length} recent items</span></div>{dashboard.recent_items.length ? <div className="seller-order-list">{dashboard.recent_items.map((item) => <article className="seller-order-row" key={item.id}><div className="order-id">#{String(item.order_id).padStart(4, '0')}<small>{new Date(item.order_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</small></div><div className="order-product"><b>{item.product_name}</b><span>{item.quantity} piece{item.quantity === 1 ? '' : 's'} · {item.buyer_name}</span><small>{item.ship_to}, {item.city} {item.postal_code}</small></div><strong>{money(Number(item.unit_price) * item.quantity)}</strong><span className={`fulfilment-pill fulfilment-${item.fulfillment_status}`}>{statusLabel[item.fulfillment_status]}</span><button className="button button-outline small-action" disabled={busyItem === item.id || item.fulfillment_status === 'delivered'} onClick={() => advance(item)}>{busyItem === item.id ? 'Saving…' : item.fulfillment_status === 'new' ? 'Start packing' : item.fulfillment_status === 'packing' ? 'Mark shipped' : item.fulfillment_status === 'shipped' ? 'Mark delivered' : 'Complete'}</button></article>)}</div> : <div className="empty-market"><span>↗</span><div><b>No orders just yet.</b><p>When someone finds your work, their orders will appear here.</p></div></div>}</section></main>
  )
}
