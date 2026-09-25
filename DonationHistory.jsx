import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { supabase } from './supabaseClient.js'
import { HeartHandshake, AlertCircle } from 'lucide-react'

export default function DonationHistory() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) loadDonations()
  }, [user])

  const loadDonations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      setError('Failed to load donation history.')
    } else {
      setDonations(data || [])
    }
    setLoading(false)
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'badge-pending',
      accepted: 'badge-approved',
      completed: 'badge-completed',
      rejected: 'badge-rejected',
    }
    const label = {
      pending: 'Pending',
      accepted: 'Accepted',
      completed: 'Completed',
      rejected: 'Rejected',
    }
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{label[status] || status}</span>
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donation History</h1>
        <p className="page-subtitle">Your previous donation requests and their status</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {donations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HeartHandshake size={28} /></div>
            <p>No donation requests yet. Start donating your extra food to help others.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Qty</th>
                  <th>Available</th>
                  <th>Donor</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.food_name}</div>
                      {d.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.description}</div>}
                    </td>
                    <td>{d.quantity} {d.unit}</td>
                    <td>
                      {d.available_date ? new Date(d.available_date).toLocaleDateString() : '-'}
                      {d.available_time && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.available_time}</div>}
                    </td>
                    <td>{d.donor_name}</td>
                    <td>
                      {d.donor_phone && <div style={{ fontSize: 12 }}>{d.donor_phone}</div>}
                      {d.donor_email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.donor_email}</div>}
                    </td>
                    <td>{statusBadge(d.status)}</td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
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
