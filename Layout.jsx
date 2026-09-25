import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import {
  Menu, X, LogOut, Leaf,
  LayoutDashboard, PackagePlus, Boxes, Clock, Trash2,
  ShoppingCart, HeartHandshake, Building2, Wallet, History,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add-food', label: 'Add Food', icon: PackagePlus },
  { path: '/inventory', label: 'Inventory', icon: Boxes },
  { path: '/expiry', label: 'Expiry Reminder', icon: Clock },
  { path: '/waste', label: 'Waste Tracker', icon: Trash2 },
  { path: '/shopping', label: 'Smart Shopping List', icon: ShoppingCart },
  { path: '/donate', label: 'Donate Food', icon: HeartHandshake },
  { path: '/ngo', label: 'NGO & Donation', icon: Building2 },
  { path: '/money-saved', label: 'Money Saved', icon: Wallet },
  { path: '/history', label: 'History', icon: History },
]

export default function Layout({ children }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <Leaf size={20} />
          </span>
          <span className="sidebar-brand-text">Household</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-signout" onClick={handleSignOut} title="Sign out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <div className="sidebar-main">
        <header className="sidebar-topbar">
          <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="sidebar-topbar-title">Household Food Waste Reduction</span>
        </header>

        <main className="main-content">{children}</main>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">Household Food Waste Reduction</div>
            <p className="footer-text">
              Helping families reduce food waste, save money, and donate surplus food to those in need.
            </p>
            <p className="footer-text" style={{ marginTop: 8 }}>
              &copy; {new Date().getFullYear()} Household Food Waste Reduction. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
