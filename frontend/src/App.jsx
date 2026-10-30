import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Home from './Pages/Home'
import Products from './Pages/Products'
import Cart from './Pages/Cart'
import AddProduct from './Pages/AddProduct'
import ProductDetail from './Pages/ProductDetail'
import Checkout from './Pages/Checkout'
import Login from './Pages/Login'
import SellerDashboard from './Pages/SellerDashboard'
import StorePage from './Pages/StorePage'
import Orders from './Pages/Orders'
import { api } from './api'
import './App.css'

function ProtectedRoute({ user, sellerOnly = false, children }) {
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (sellerOnly && user.account_type !== 'seller') return <Navigate to="/register?type=seller" replace />
  return children
}

function PageFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main"><a className="wordmark footer-wordmark" href="/"><span className="wordmark-symbol">t</span><span>tandem<span className="wordmark-dot">.</span></span></a><p>Good things are better<br />when they're shared.</p><div className="footer-links"><a href="/products">Shop all</a><a href="/register?type=seller">Open a store</a><a href="mailto:hello@tandem.market">Get in touch</a></div></div>
      <div className="footer-bottom"><span>Independent by nature. Together by design.</span><span>© {new Date().getFullYear()} Tandem Market</span></div>
    </footer>
  )
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tandem-user') || 'null') } catch { return null }
  })
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tandem-cart') || '[]') } catch { return [] }
  })
  const [notice, setNotice] = useState('')

  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const data = await api('/products/')
      setProducts(Array.isArray(data) ? data : [])
      setCatalogError('')
    } catch (error) {
      setCatalogError(error.message)
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => { refreshProducts() }, [refreshProducts])
  useEffect(() => { localStorage.setItem('tandem-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const addToCart = (product, quantity = 1) => {
    if (product.stock < 1) { setNotice('This item has just sold out.'); return }
    setCart((current) => {
      const found = current.find((item) => item.id === product.id)
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item)
      return [...current, { ...product, quantity: Math.min(product.stock, quantity) }]
    })
    setNotice(`${product.name} added to your bag.`)
  }
  const updateCart = (next) => setCart(next)
  const signIn = (data) => {
    const nextUser = { token: data.token, ...data.user }
    setUser(nextUser)
    localStorage.setItem('tandem-user', JSON.stringify(nextUser))
    setNotice(`Welcome${nextUser.store_name ? ` to ${nextUser.store_name}` : `, ${nextUser.username}`}!`)
  }
  const signOut = () => {
    if (user?.token) api('/logout/', { method: 'POST', token: user.token }).catch(() => {})
    setUser(null)
    localStorage.removeItem('tandem-user')
    setNotice('You have signed out.')
  }
  const cartWithFreshProducts = cart.map((item) => ({ ...(products.find((product) => product.id === item.id) || item), quantity: item.quantity }))

  return (
    <div className="app-shell">
      <div className="top-note"><span className="top-note-star">✳</span> A good place for things made with care <a href="/register?type=seller">Meet your next favourite maker <span>↗</span></a></div>
      <Navbar user={user} cartCount={cartCount} onLogout={signOut} />
      {catalogError && <div className="connection-note">We couldn't reach the shop just now. Start the Django server to browse listings and place orders.</div>}
      <Routes>
        <Route path="/" element={<Home products={products} loading={loadingProducts} onAdd={addToCart} />} />
        <Route path="/products" element={<Products products={products} loading={loadingProducts} onAdd={addToCart} />} />
        <Route path="/products/:id" element={<ProductDetail products={products} onAdd={addToCart} />} />
        <Route path="/stores/:id" element={<StorePage onAdd={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cartWithFreshProducts} setCart={updateCart} />} />
        <Route path="/checkout" element={<ProtectedRoute user={user}><Checkout cart={cartWithFreshProducts} token={user?.token} onComplete={() => { setCart([]); refreshProducts() }} /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<Orders confirmation />} />
        <Route path="/orders" element={<ProtectedRoute user={user}><Orders token={user?.token} /></ProtectedRoute>} />
        <Route path="/login" element={<Login mode="login" onSuccess={signIn} />} />
        <Route path="/register" element={<Login mode="register" onSuccess={signIn} />} />
        <Route path="/products/add" element={<ProtectedRoute user={user} sellerOnly><AddProduct user={user} onCreated={refreshProducts} /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute user={user} sellerOnly><SellerDashboard user={user} token={user?.token} onRefresh={refreshProducts} /></ProtectedRoute>} />
        <Route path="*" element={<main className="not-found"><span>404</span><h1>This page took another path.</h1><a className="button button-dark" href="/">Back to Tandem</a></main>} />
      </Routes>
      <PageFooter />
      {notice && <div className="toast-message" role="status"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    </div>
  )
}
