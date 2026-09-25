import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase, UNITS, WASTE_REASONS, FOOD_PRICE_RANGES, formatINR } from '../lib/supabaseClient.js'
import { logHistory, estimateFoodValue } from '../lib/helpers.js'
import { Trash2, TrendingDown, Wallet, AlertCircle } from 'lucide-react'

export default function WasteTracker() {
  const { user } = useAuth()
  const [wasteItems, setWasteItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    food_name: '',
    quantity: 1,
    unit: 'pcs',
    waste_date: new Date().toISOString().split('T')[0],
    reason: 'Expired',
    estimated_cost: '',
  })

  useEffect(() => {
    if (user) loadWaste()
  }, [user])

  const loadWaste = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('food_waste')
      .select('*')
      .eq('user_id', user.id)
      .order('waste_date', { ascending: false })
    if (error) {
      setError('Failed to load waste records.')
    } else {
      setWasteItems(data || [])
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.food_name.trim()) {
      setError('Please enter the food name.')
      return
    }

    const cost = parseFloat(form.estimated_cost) || estimateFoodValue('Other', form.quantity, form.unit)

    const { error } = await supabase.from('food_waste').insert({
      user_id: user.id,
      food_name: form.food_name.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      waste_date: form.waste_date,
      reason: form.reason,
      estimated_cost: cost,
    })

    if (error) {
      setError('Failed to record food waste.')
      return
    }

    await logHistory(user.id, 'wasted', `Wasted ${form.quantity} ${form.unit} of ${form.food_name}`, form.quantity, form.unit)

    setSuccess('Food waste recorded.')
    setForm({ food_name: '', quantity: 1, unit: 'pcs', waste_date: new Date().toISOString().split('T')[0], reason: 'Expired', estimated_cost: '' })
    loadWaste()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this waste record?')) return
    const { error } = await supabase.from('food_waste').delete().eq('id', id)
    if (error) {
      setError('Failed to delete record.')
      return
    }
    setWasteItems(wasteItems.filter((w) => w.id !== id))
  }

  const totalCost = wasteItems.reduce((sum, w) => sum + (parseFloat(w.estimated_cost) || 0), 0)
  const totalQty = wasteItems.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0)

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Food Waste Tracker</h1>
        <p className="page-subtitle">Record and monitor food wasted in your household</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
            <Trash2 size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="stat-card-label">Total Items Wasted</div>
          <div className="stat-card-value">{wasteItems.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fffbeb' }}>
            <TrendingDown size={22} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stat-card-label">Total Quantity Wasted</div>
          <div className="stat-card-value">{totalQty}</div>
          <div className="stat-card-sub">units wasted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
            <Wallet size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="stat-card-label">Estimated Money Lost</div>
          <div className="stat-card-value">{formatINR(totalCost)}</div>
          <div className="stat-card-sub">estimated value</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }} className="waste-layout">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Record Food Waste</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Food Name *</label>
              <input className="form-input" name="food_name" value={form.food_name} onChange={handleChange} placeholder="e.g. Bananas" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0.01" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" name="waste_date" value={form.waste_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Waste</label>
              <select className="form-select" name="reason" value={form.reason} onChange={handleChange}>
                {WASTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Cost (optional)</label>
              <input className="form-input" type="number" name="estimated_cost" value={form.estimated_cost} onChange={handleChange} placeholder={`Auto: ${formatINR(estimateFoodValue('Other', form.quantity, form.unit))}`} min="0" step="1" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">
              <Trash2 size={16} /> Record Waste
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Waste History</h2>
          {wasteItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><AlertCircle size={28} /></div>
              <p>No food waste recorded yet. Help reduce waste by tracking it here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Est. Cost</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {wasteItems.map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600 }}>{w.food_name}</td>
                      <td>{w.quantity} {w.unit}</td>
                      <td>{new Date(w.waste_date).toLocaleDateString()}</td>
                      <td><span className="badge badge-expired">{w.reason}</span></td>
                      <td>{formatINR(parseFloat(w.estimated_cost || 0))}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(w.id)} style={{ color: 'var(--error)' }}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .waste-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
