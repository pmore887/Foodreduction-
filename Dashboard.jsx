import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { fetchDashboardStats, getExpiryStatus, formatINR } from './helpers.js'
import { supabase } from './supabaseClient.js'
import {
  Package, AlertTriangle, HeartHandshake, Trash2, TrendingDown,
  Wallet, ShoppingCart, Leaf, ArrowRight,
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentFood, setRecentFood] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, foodRes] = await Promise.all([
        fetchDashboardStats(user.id),
        supabase
          .from('household_food')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setStats(s)
      setRecentFood(foodRes.data || [])
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">{error}</div>
    )
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Household Dashboard</h1>
        <p className="page-subtitle">Welcome back, {displayName}. Here's your household food overview.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)' }}>
            <Package size={22} style={{ color: 'var(--primary-600)' }} />
          </div>
          <div className="stat-card-label">Food Items at Home</div>
          <div className="stat-card-value">{stats.foodCount}</div>
          <div className="stat-card-sub">items in your inventory</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fffbeb' }}>
            <AlertTriangle size={22} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stat-card-label">Food Nearing Expiry</div>
          <div className="stat-card-value">{stats.expiringCount}</div>
          <div className="stat-card-sub">expiring or expired items</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eff6ff' }}>
            <HeartHandshake size={22} style={{ color: 'var(--info)' }} />
          </div>
          <div className="stat-card-label">Food Donated</div>
          <div className="stat-card-value">{stats.donatedCount}</div>
          <div className="stat-card-sub">{stats.totalDonatedQty} units donated</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
            <Trash2 size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="stat-card-label">Food Wasted</div>
          <div className="stat-card-value">{stats.wasteCount}</div>
          <div className="stat-card-sub">{stats.totalWastedQty} units wasted</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)' }}>
            <TrendingDown size={22} style={{ color: 'var(--primary-600)' }} />
          </div>
          <div className="stat-card-label">Waste Reduction</div>
          <div className="stat-card-value">{stats.wasteReductionPct}%</div>
          <div className="stat-card-sub">donated vs wasted</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f0fdf4' }}>
            <Wallet size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div className="stat-card-label">Estimated Money Saved</div>
          <div className="stat-card-value">{formatINR(stats.moneySaved)}</div>
          <div className="stat-card-sub">estimated savings</div>
        </div>
      </div>

      <div className="info-banner">
        <Leaf className="info-banner-icon" size={22} />
        <div>
          <h3>Reduce waste, save money, help others</h3>
          <p>Track your food inventory, monitor expiry dates, donate surplus, and build smarter shopping lists.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recently Added Food</h2>
          <Link to="/inventory" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentFood.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={28} />
            </div>
            <p>No food items yet. Start by adding food to your household inventory.</p>
            <Link to="/add-food" className="btn btn-primary" style={{ marginTop: 16 }}>
              <Leaf size={16} /> Add Food
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {recentFood.map((item) => {
                  const status = getExpiryStatus(item.expiry_date)
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>
                        {item.expiry_date ? (
                          <span className={`badge ${status === 'expired' ? 'badge-expired' : status === 'expiring' ? 'badge-expiring' : 'badge-fresh'}`}>
                            {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
        <Link to="/add-food" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s', cursor: 'pointer' }}>
          <Leaf size={24} style={{ color: 'var(--primary-600)', marginBottom: 8 }} />
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Add Household Food</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track food you have at home</p>
        </Link>
        <Link to="/shopping" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s', cursor: 'pointer' }}>
          <ShoppingCart size={24} style={{ color: 'var(--primary-600)', marginBottom: 8 }} />
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Smart Shopping List</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.shoppingPending} items to buy</p>
        </Link>
        <Link to="/donate" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.15s', cursor: 'pointer' }}>
          <HeartHandshake size={24} style={{ color: 'var(--info)', marginBottom: 8 }} />
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Donate Extra Food</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Share surplus with those in need</p>
        </Link>
      </div>
    </div>
  )
}
