import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, imageSource, money } from '../api'

export default function Checkout({ cart, token, onComplete }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ customer_name: '', phone: '', address: '', city: '', postal_code: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const placeOrder = async (event) => {
    event.preventDefault()
    if (!cart.length) { setError('Your bag is empty. Add a find before checking out.'); return }
    setBusy(true); setError('')
    try {
      const order = await api('/orders/', {
        token,
        method: 'POST',
        body: { ...form, payment_method: 'cod', items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) },
      })
      onComplete()
      navigate('/order-confirmation', { state: { order } })
    } catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  return (
    <main className="section-wrap checkout-page"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/cart">Your bag</Link><span>/</span><b>Checkout</b></div><div className="checkout-heading"><div><div className="eyebrow"><span /> Almost at the good part</div><h1>Checkout<span>.</span></h1><p>Just a few details and your finds will be on their way.</p></div><span className="checkout-lock">✳ Your details stay private</span></div>
      <div className="checkout-layout"><form className="checkout-form" onSubmit={placeOrder}><section><div className="form-section-title"><span>01</span><div><h2>Where should we send it?</h2><p>Each independent maker will prepare their part of your order.</p></div></div><div className="checkout-fields"><label className="wide">Full name<input required value={form.customer_name} onChange={(event) => update('customer_name', event.target.value)} autoComplete="name" placeholder="Your name" /></label><label>Phone number<input required value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="+91" /></label><label>PIN code<input required value={form.postal_code} onChange={(event) => update('postal_code', event.target.value)} autoComplete="postal-code" placeholder="6-digit PIN" /></label><label className="wide">Street address<textarea required rows="2" value={form.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" placeholder="House, street, area" /></label><label className="wide">City<input required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" placeholder="Your city" /></label></div></section><section className="payment-section"><div className="form-section-title"><span>02</span><div><h2>How would you like to pay?</h2><p>Payment is collected when your order arrives.</p></div></div><label className="payment-choice"><input type="radio" checked readOnly /><span><b>Cash on delivery</b><small>Pay the delivery partner when you receive your order.</small></span><i>COD</i></label></section>{error && <div className="form-error">{error}</div>}<button className="button button-ink place-order-button" disabled={busy}>{busy ? 'Placing your order…' : `Place order · ${money(total)}`} <span>↗</span></button><small className="checkout-disclaimer">This portfolio demo records a sample order. It does not collect real payment.</small></form>
        <aside className="checkout-summary"><h2>Your finds <span>{cart.length}</span></h2><div className="checkout-items">{cart.map((item) => <div key={item.id} className="checkout-item"><div className="checkout-item-image">{imageSource(item) && <img src={imageSource(item)} alt="" />}<b>{item.quantity}</b></div><div><strong>{item.name}</strong><small>{item.store_name || item.seller_name}</small></div><b>{money(Number(item.price) * item.quantity)}</b></div>)}</div><div className="checkout-totals"><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Delivery</span><b>Complimentary</b></div><div className="checkout-grand-total"><span>Total</span><b>{money(total)}</b></div></div></aside></div>
    </main>
  )
}
