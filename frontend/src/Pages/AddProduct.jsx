import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

const categories = [['home', 'Home & living'], ['fashion', 'Clothing & accessories'], ['art', 'Art & stationery'], ['beauty', 'Beauty & care'], ['food', 'Food & pantry'], ['jewellery', 'Jewellery'], ['other', 'Other finds']]

export default function AddProduct({ user, onCreated }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', category: 'home', price: '', stock: '1', image_url: '' })
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    try { await api('/products/', { token: user.token, method: 'POST', body: payload }); await onCreated(); navigate('/seller') }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return (
    <main className="seller-form-page section-wrap"><div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/seller">Your studio</Link><span>/</span><b>New listing</b></div><div className="seller-form-heading"><div className="eyebrow"><span /> A new find for someone</div><h1>Put it out <em>into the world.</em></h1><p>Good listings tell the story and set clear expectations.</p></div><form className="seller-product-form" onSubmit={submit}><label>Product name<input required maxLength={100} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="What do you call this piece?" /></label><label>Category<select value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="seller-wide">Description<textarea required rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Materials, process, measurements, care — what should a buyer know?" /></label><label>Price (₹)<input type="number" required min="1" step="1" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="0" /></label><label>Available pieces<input type="number" required min="0" max="10000" step="1" value={form.stock} onChange={(event) => update('stock', event.target.value)} /></label><label className="seller-wide">Product image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} /><small>JPEG, PNG or WebP. Use a clear, well-lit photo of your own product.</small></label><label className="seller-wide">Or use an image URL<input type="url" value={form.image_url} onChange={(event) => update('image_url', event.target.value)} placeholder="https://…" /></label>{error && <div className="form-error seller-wide">{error}</div>}<div className="seller-wide seller-form-actions"><Link to="/seller" className="text-link">Back to your studio</Link><button className="button button-ink" disabled={busy}>{busy ? 'Publishing your listing…' : 'Publish listing'} <span>↗</span></button></div></form></main>
  )
}
