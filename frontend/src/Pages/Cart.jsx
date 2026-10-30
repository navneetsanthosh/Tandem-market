import { Link } from 'react-router-dom'
import { imageSource, money } from '../api'

export default function Cart({ cart, setCart }) {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const delivery = 0
  const updateQuantity = (id, amount) => setCart(cart.map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(item.stock ?? 50, item.quantity + amount)) } : item).filter((item) => item.quantity > 0))

  return (
    <main className="section-wrap cart-page"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><b>Your bag</b></div><div className="cart-heading"><div><div className="eyebrow"><span /> Good choices so far</div><h1>Your bag<span>.</span></h1></div><span>{cart.length} {cart.length === 1 ? 'kind of find' : 'kinds of finds'}</span></div>
      {cart.length === 0 ? <div className="empty-bag"><span className="empty-bag-icon">↗</span><h2>Nothing in here just yet.</h2><p>There’s something out there with your name on it.</p><Link className="button button-ink" to="/products">Find it in the shop <span>↗</span></Link></div> : <div className="cart-layout"><div className="cart-items">{cart.map((item) => <article className="cart-row" key={item.id}><Link className="cart-thumb" to={`/products/${item.id}`}>{imageSource(item) && <img src={imageSource(item)} alt={item.name} />}</Link><div className="cart-item-copy"><span>{item.store_name || item.seller_name}</span><Link to={`/products/${item.id}`}>{item.name}</Link><small>{money(item.price)} each</small><div className="cart-quantity"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button><button className="remove-item" onClick={() => setCart(cart.filter((line) => line.id !== item.id))}>Remove</button></div></div><strong className="cart-line-total">{money(Number(item.price) * item.quantity)}</strong></article>)}</div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery</span><b>Complimentary</b></div><p>Every order ships with care from the independent makers you chose.</p><div className="summary-total"><span>Total</span><b>{money(subtotal + delivery)}</b></div><Link className="button button-ink checkout-link" to="/checkout">Continue to checkout <span>↗</span></Link><small>Cash on delivery · Stock checked at checkout</small></aside></div>}
    </main>
  )
}
