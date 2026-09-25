import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { supabase, FOOD_CATEGORIES, UNITS } from '../lib/supabaseClient.js'
import { logHistory } from '../lib/helpers.js'
import { Leaf, CheckCircle } from 'lucide-react'

export default function AddFood() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    category: 'Fruits',
    quantity: 1,
    unit: 'pcs',
    date_added: new Date().toISOString().split('T')[0],
    expiry_date: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Please enter a food name.')
      return
    }
    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('household_food').insert({
      user_id: user.id,
      name: form.name.trim(),
      category: form.category,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      date_added: form.date_added,
      expiry_date: form.expiry_date || null,
      description: form.description.trim(),
    })

    if (error) {
      setError('Failed to save food item. Please try again.')
      setLoading(false)
      return
    }

    await logHistory(user.id, 'added', `Added ${form.quantity} ${form.unit} of ${form.name}`, form.quantity, form.unit)

    setSuccess('Food item added to your household inventory!')
    setLoading(false)

    setTimeout(() => navigate('/inventory'), 1500)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Household Food</h1>
        <p className="page-subtitle">Track food items available in your home</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success"><CheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />{success}</div>}

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Food Name *</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Bananas"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                className="form-input"
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date Added</label>
              <input
                className="form-input"
                type="date"
                name="date_added"
                value={form.date_added}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              className="form-input"
              type="date"
              name="expiry_date"
              value={form.expiry_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes about this food item"
            />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            <Leaf size={18} />
            {loading ? 'Saving...' : 'Add to Inventory'}
          </button>
        </form>
      </div>
    </div>
  )
}
