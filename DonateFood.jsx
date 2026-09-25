import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase, UNITS } from '../lib/supabaseClient.js'
import { logHistory } from '../lib/helpers.js'
import { HeartHandshake, CheckCircle } from 'lucide-react'

export default function DonateFood() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    food_name: '',
    quantity: 1,
    unit: 'pcs',
    description: '',
    available_date: new Date().toISOString().split('T')[0],
    available_time: '',
    donor_name: profile?.full_name || '',
    donor_phone: profile?.phone || '',
    donor_email: user?.email || '',
    additional_info: '',
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

    if (!form.food_name.trim()) {
      setError('Please enter the food name.')
      return
    }
    if (!form.donor_name.trim()) {
      setError('Please enter donor name.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('donations').insert({
      user_id: user.id,
      food_name: form.food_name.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      description: form.description.trim(),
      available_date: form.available_date,
      available_time: form.available_time,
      donor_name: form.donor_name.trim(),
      donor_phone: form.donor_phone.trim(),
      donor_email: form.donor_email.trim(),
      additional_info: form.additional_info.trim(),
      status: 'pending',
    })

    if (error) {
      setError('Failed to submit donation request.')
      setLoading(false)
      return
    }

    await logHistory(user.id, 'donated', `Donated ${form.quantity} ${form.unit} of ${form.food_name}`, form.quantity, form.unit)

    setSuccess('Your donation request has been saved. It will appear in your Donation History with status Pending. Please contact an organization from the NGO section to arrange pickup or drop-off.')
    setLoading(false)

    setTimeout(() => navigate('/donation-history'), 2500)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donate Extra Food</h1>
        <p className="page-subtitle">Share usable surplus food with those who need it</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success"><CheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />{success}</div>}

      <div className="alert alert-info">
        <strong>How this works:</strong> Submitting this form saves a donation request in our system. It does not automatically notify an NGO. After submitting, visit the NGO section to contact an organization directly and arrange your donation. Your request status will move from Pending → Accepted → Completed or Rejected.
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Food Name *</label>
            <input className="form-input" name="food_name" value={form.food_name} onChange={handleChange} placeholder="e.g. Rice, 5kg bag" />
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
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe the food condition, packaging, etc." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Available Date</label>
              <input className="form-input" type="date" name="available_date" value={form.available_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Available Time</label>
              <input className="form-input" type="time" name="available_time" value={form.available_time} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Donor Name *</label>
            <input className="form-input" name="donor_name" value={form.donor_name} onChange={handleChange} placeholder="Your name" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Donor Phone</label>
              <input className="form-input" name="donor_phone" value={form.donor_phone} onChange={handleChange} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label className="form-label">Donor Email</label>
              <input className="form-input" name="donor_email" value={form.donor_email} onChange={handleChange} placeholder="Email address" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Information (optional)</label>
            <textarea className="form-textarea" name="additional_info" value={form.additional_info} onChange={handleChange} placeholder="Any extra details for the donation" />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            <HeartHandshake size={18} />
            {loading ? 'Submitting...' : 'Submit Donation Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
