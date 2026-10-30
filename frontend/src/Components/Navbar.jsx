import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar({ user, cartCount, onLogout }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" onClick={close} aria-label="Tandem Market home"><span className="wordmark-symbol">t</span><span>tandem<span className="wordmark-dot">.</span></span></Link>
      <button className="menu-toggle" onClick={() => setOpen((current) => !current)} aria-label="Toggle navigation"><span /><span /></button>
      <nav className={`site-nav ${open ? 'is-open' : ''}`}>
        <NavLink to="/products" onClick={close}>Shop all</NavLink>
        <Link to="/#makers" onClick={close}>Our makers</Link>
        {user?.account_type === 'seller' && <NavLink to="/seller" onClick={close}>Your studio</NavLink>}
        {user && user.account_type !== 'seller' && <NavLink to="/orders" onClick={close}>Your orders</NavLink>}
        {user?.account_type !== 'seller' && <Link to="/register?type=seller" className="nav-sell-link" onClick={close}>Sell on Tandem</Link>}
      </nav>
      <div className="header-tools">
        {user ? <div className="account-chip"><span>{user.username?.slice(0, 1).toUpperCase()}</span><b>{user.store_name || user.username}</b><button onClick={onLogout}>Sign out</button></div> : <Link className="header-account" to="/login">Sign in</Link>}
        <Link className="bag-link" to="/cart" aria-label={`Shopping bag with ${cartCount} items`}><span className="bag-glyph">↗</span><span>Bag</span><b>{cartCount}</b></Link>
      </div>
    </header>
  )
}
