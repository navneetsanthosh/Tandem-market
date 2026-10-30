import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function Login({ mode: initialMode = 'login', onSuccess }) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ username: '', email: '', password: '', account_type: searchParams.get('type') === 'seller' ? 'seller' : 'buyer', store_name: '', store_description: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const register = mode === 'register'

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const data = await api(register ? '/register/' : '/login/', { method: 'POST', body: register ? form : { username: form.username, password: form.password } })
      onSuccess(data)
      const destination = location.state?.from || (data.user.account_type === 'seller' ? '/seller' : '/')
      navigate(destination, { replace: true })
    } catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  return (
    <main className="auth-page"><section className="auth-story"><div className="auth-story-image"><img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1100&q=85" alt="A maker at work in a small studio" /><span>Good things happen<br /><em>when we make room.</em></span></div><p>For the people who make it.<br />For the people who find it.</p></section><section className="auth-panel"><div className="eyebrow"><span /> {register ? 'Your place in the community' : 'Welcome back'}</div><h1>{register ? 'Make room for good things.' : 'Good to see you again.'}</h1><p>{register ? 'Create an account to shop with care or open your own little corner of Tandem.' : 'Sign in to see your bag, your orders and the makers you love.'}</p><form className="auth-form" onSubmit={submit}>{register && <div className="account-type-chooser"><button type="button" className={form.account_type === 'buyer' ? 'selected' : ''} onClick={() => update('account_type', 'buyer')}><span>01</span><b>I’m here to discover</b><small>Shop independent finds</small></button><button type="button" className={form.account_type === 'seller' ? 'selected' : ''} onClick={() => update('account_type', 'seller')}><span>02</span><b>I’m here to make</b><small>Open an independent store</small></button></div>}<label>Username<input required minLength={3} autoComplete="username" value={form.username} onChange={(event) => update('username', event.target.value)} placeholder="Choose a username" /></label>{register && <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></label>}{register && form.account_type === 'seller' && <><label>Store name<input required value={form.store_name} onChange={(event) => update('store_name', event.target.value)} placeholder="What do you call your studio?" /></label><label>What do you make?<textarea rows="2" maxLength={240} value={form.store_description} onChange={(event) => update('store_description', event.target.value)} placeholder="Tell shoppers a little about your work" /></label></>}<label>Password<input required type="password" minLength={8} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={register ? 'At least 8 characters' : 'Your password'} /></label>{error && <div className="form-error">{error}</div>}<button className="button button-ink auth-submit" disabled={busy}>{busy ? 'One moment…' : register ? form.account_type === 'seller' ? 'Open my store' : 'Create my account' : 'Sign in'} <span>↗</span></button></form><div className="auth-switch">{register ? 'Already have an account?' : 'New to Tandem?'} <button onClick={() => { setError(''); setMode(register ? 'login' : 'register') }}>{register ? 'Sign in' : 'Create an account'}</button></div><small className="auth-privacy">✳ Your details are used only to support your Tandem account.</small></section></main>
  )
}
