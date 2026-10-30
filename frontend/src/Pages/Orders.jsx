import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, money } from '../api'

const orderStatus = { placed: 'Order received', confirmed: 'Being prepared', shipped: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' }

export default function Orders({ token, confirmation = false }) {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const confirmedOrder = location.state?.order
  useEffect(() => {
    if (confirmation || !token) return
    api('/orders/', { token }).then(setOrders).catch((requestError) => setError(requestError.message))
  }, [token, confirmation])

  if (confirmation) return <main className="order-confirmation section-wrap"><div className="confirmation-seal">✓</div><div className="eyebrow"><span /> Thank you for choosing well</div><h1>Your good things<br /><em>are on their way.</em></h1><p>{confirmedOrder ? `Order #${String(confirmedOrder.id).padStart(4, '0')} has been placed. The independent makers will take it from here.` : 'Your order was placed. You can check its progress from your order history.'}</p>{confirmedOrder && <div className="confirmation-card"><span>Order total</span><b>{money(confirmedOrder.total_amount)}</b><small>Cash on delivery · {confirmedOrder.items?.length || 0} line items</small></div>}<div className="confirmation-actions"><Link className="button button-ink" to="/products">Find another good thing <span>↗</span></Link><Link className="underlined-link" to="/orders">View order history</Link></div></main>

  return <main className="section-wrap orders-page"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><b>Your orders</b></div><div className="section-intro"><div><div className="eyebrow"><span /> A good thing to look back on</div><h1>Your orders<span>.</span></h1><p>Your finds, and the people making them ready.</p></div><Link className="underlined-link" to="/products">Back to the shop ↗</Link></div>{error && <div className="form-error">{error}</div>}{orders.length ? <div className="buyer-order-list">{orders.map((order) => <article className="buyer-order-card" key={order.id}><div className="buyer-order-top"><div><span>Order #{String(order.id).padStart(4, '0')}</span><small>{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</small></div><b className={`order-status order-status-${order.status}`}>{orderStatus[order.status] || order.status}</b></div><div className="buyer-order-products">{order.items.map((item) => <div key={item.id}><span>{item.product_name} <small>× {item.quantity}</small></span><b>{money(Number(item.unit_price) * item.quantity)}</b><small className="order-maker">From {item.seller_name}</small></div>)}</div><div className="buyer-order-total"><span>Total · cash on delivery</span><b>{money(order.total_amount)}</b></div></article>)}</div> : !error && <div className="empty-bag"><span className="empty-bag-icon">↗</span><h2>No orders, for now.</h2><p>When something finds its way to you, it’ll appear here.</p><Link className="button button-ink" to="/products">Browse the shop <span>↗</span></Link></div>}</main>
}
