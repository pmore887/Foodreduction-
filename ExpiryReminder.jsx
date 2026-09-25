import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { supabase } from './supabaseClient.js'
import { getDaysUntilExpiry, getExpiryStatus } from './helpers.js'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function ExpiryReminder() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user) loadFood()
  }, [user])

  const loadFood = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('household_food')
      .select('*')
      .eq('user_id', user.id)
      .order('expiry_date', { ascending: true, nullsFirst: false })
    if (error) {
      setError('Failed to load food items.')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const fresh = items.filter((i) => getExpiryStatus(i.expiry_date) === 'fresh')
  const expiring = items.filter((i) => getExpiryStatus(i.expiry_date) === 'expiring')
  const expired = items.filter((i) => getExpiryStatus(i.expiry_date) === 'expired')

  const display = filter === 'all' ? items : filter === 'fresh' ? fresh : filter === 'expiring' ? expiring : filter === 'expired' ? expired : items

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expiry Reminder</h1>
        <p className="page-subtitle">Monitor food freshness and avoid waste</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('fresh')}>
          <div className="stat-card-icon" style={{ background: '#f0fdf4' }}>
            <CheckCircle size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div className="stat-card-label">Fresh</div>
          <div className="stat-card-value">{fresh.length}</div>
          <div className="stat-card-sub">more than 3 days left</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('expiring')}>
          <div className="stat-card-icon" style={{ background: '#fffbeb' }}>
            <Clock size={22} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stat-card-label">Expiring Soon</div>
          <div className="stat-card-value">{expiring.length}</div>
          <div className="stat-card-sub">3 days or less</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('expired')}>
          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
            <XCircle size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="stat-card-label">Expired</div>
          <div className="stat-card-value">{expired.length}</div>
          <div className="stat-card-sub">past expiry date</div>
        </div>
      </div>

      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Items</option>
          <option value="fresh">Fresh</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card">
        {display.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><AlertTriangle size={28} /></div>
            <p>No food items to display.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Remaining Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {display.map((item) => {
                  const days = getDaysUntilExpiry(item.expiry_date)
                  const status = getExpiryStatus(item.expiry_date)
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{days !== null ? `${days} days` : 'N/A'}</td>
                      <td>
                        {status === 'fresh' && <span className="badge badge-fresh">Fresh</span>}
                        {status === 'expiring' && <span className="badge badge-expiring">Expiring Soon</span>}
                        {status === 'expired' && <span className="badge badge-expired">Expired</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
