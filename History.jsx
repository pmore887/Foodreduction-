import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { History as HistoryIcon, Plus, Trash2, HeartHandshake, ShoppingCart } from 'lucide-react'

export default function History() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user) loadHistory()
  }, [user])

  const loadHistory = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(100)
    if (error) {
      setError('Failed to load history.')
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const filtered = filter === 'all' ? records : records.filter((r) => r.activity_type === filter)

  const iconForType = (type) => {
    switch (type) {
      case 'added': return <Plus size={16} style={{ color: 'var(--primary-600)' }} />
      case 'wasted': return <Trash2 size={16} style={{ color: 'var(--error)' }} />
      case 'donated': return <HeartHandshake size={16} style={{ color: 'var(--info)' }} />
      case 'shopping': return <ShoppingCart size={16} style={{ color: 'var(--warning)' }} />
      default: return <HistoryIcon size={16} />
    }
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Household History</h1>
        <p className="page-subtitle">All your household food activities in one place</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Activities</option>
          <option value="added">Food Added</option>
          <option value="wasted">Food Wasted</option>
          <option value="donated">Food Donated</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HistoryIcon size={28} /></div>
            <p>No activity recorded yet. Start using the app to build your household history.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {iconForType(r.activity_type)}
                        <span style={{ textTransform: 'capitalize' }}>{r.activity_type}</span>
                      </div>
                    </td>
                    <td>{r.description}</td>
                    <td>{r.quantity} {r.unit}</td>
                    <td>{new Date(r.activity_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
