import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase, FOOD_PRICE_RANGES, formatINR } from '../lib/supabaseClient.js'
import { estimateFoodValue } from '../lib/helpers.js'
import { Wallet, TrendingDown, HeartHandshake, Trash2 } from 'lucide-react'

export default function MoneySaved() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [wasteRes, donationRes, foodRes] = await Promise.all([
      supabase.from('food_waste').select('*').eq('user_id', user.id),
      supabase.from('donations').select('*').eq('user_id', user.id),
      supabase.from('household_food').select('*').eq('user_id', user.id),
    ])

    if (wasteRes.error || donationRes.error || foodRes.error) {
      setError('Failed to load savings data.')
      setLoading(false)
      return
    }

    const wasteItems = wasteRes.data || []
    const donations = donationRes.data || []
    const foodItems = foodRes.data || []

    // Estimated value of wasted food (from user-entered cost or auto-estimated)
    const totalWasteCost = wasteItems.reduce((sum, w) =>
      sum + (parseFloat(w.estimated_cost) || estimateFoodValue('Other', w.quantity, w.unit)), 0)

    const totalDonatedQty = donations.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0)
    const totalWastedQty = wasteItems.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0)

    // Estimated value of donated food, based on category-specific Indian prices
    const donatedValue = donations.reduce((sum, d) =>
      sum + estimateFoodValue(d.category || 'Other', d.quantity, d.unit), 0)

    const wasteReductionPct = totalDonatedQty + totalWastedQty > 0
      ? Math.round((totalDonatedQty / (totalDonatedQty + totalWastedQty)) * 100)
      : 0

    // Estimated money saved = value of food donated (redirected from potential waste)
    //   + 50% of waste cost (food that tracking helps avoid buying/overbuying in future)
    const estimatedSaved = Math.round(donatedValue + totalWasteCost * 0.5)

    setStats({
      totalWasteCost,
      totalDonatedQty,
      totalWastedQty,
      donatedValue,
      wasteReductionPct,
      estimatedSaved,
      foodCount: foodItems.length,
      wasteCount: wasteItems.length,
      donationCount: donations.length,
    })
    setLoading(false)
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Money Saved</h1>
        <p className="page-subtitle">Estimated savings from reducing household food waste</p>
      </div>

      <div className="alert alert-info">
        <strong>Note:</strong> All amounts are estimates based on approximate food prices and your recorded waste/donation data. Actual savings may vary.
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f0fdf4' }}>
            <Wallet size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div className="stat-card-label">Estimated Money Saved</div>
          <div className="stat-card-value">{formatINR(stats.estimatedSaved)}</div>
          <div className="stat-card-sub">estimated savings from waste reduction</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
            <Trash2 size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="stat-card-label">Money Lost to Waste</div>
          <div className="stat-card-value">{formatINR(stats.totalWasteCost)}</div>
          <div className="stat-card-sub">estimated value of wasted food</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eff6ff' }}>
            <HeartHandshake size={22} style={{ color: 'var(--info)' }} />
          </div>
          <div className="stat-card-label">Value of Donated Food</div>
          <div className="stat-card-value">{formatINR(stats.donatedValue)}</div>
          <div className="stat-card-sub">{stats.totalDonatedQty} units donated</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)' }}>
            <TrendingDown size={22} style={{ color: 'var(--primary-600)' }} />
          </div>
          <div className="stat-card-label">Waste Reduction Rate</div>
          <div className="stat-card-value">{stats.wasteReductionPct}%</div>
          <div className="stat-card-sub">donated vs total waste + donations</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 16 }}>How We Calculate Savings</h2>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <p><strong>Money Lost to Waste:</strong> Sum of estimated costs for each food waste record. If you did not enter a cost, we estimate it using approximate Indian food prices by category.</p>
          <p><strong>Estimated Money Saved:</strong> The value of food you donated (redirected from potential waste) plus 50% of your waste cost, representing food you would have wasted without tracking.</p>
          <p><strong>Value of Donated Food:</strong> Based on the quantity and category of food donated, using approximate Indian household food prices (e.g. rice ~\u20B960/kg, vegetables ~\u20B955/kg, fruits ~\u20B9100/kg).</p>
          <p><strong>Waste Reduction Rate:</strong> Percentage of surplus food that was donated rather than wasted: donated / (donated + wasted).</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Approximate Indian Food Prices Used</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Price Range (per kg/L/unit)</th>
                <th>Avg Used</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(FOOD_PRICE_RANGES).map(([cat, range]) => (
                <tr key={cat}>
                  <td style={{ fontWeight: 600 }}>{cat}</td>
                  <td>{formatINR(range.min)} – {formatINR(range.max)}</td>
                  <td>{formatINR(range.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          These are approximate values for estimation only, not exact market prices.
        </p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Your Activity Summary</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Food items currently at home</td>
                <td style={{ fontWeight: 600 }}>{stats.foodCount}</td>
              </tr>
              <tr>
                <td>Total food waste records</td>
                <td style={{ fontWeight: 600 }}>{stats.wasteCount}</td>
              </tr>
              <tr>
                <td>Total donation requests</td>
                <td style={{ fontWeight: 600 }}>{stats.donationCount}</td>
              </tr>
              <tr>
                <td>Total quantity wasted</td>
                <td style={{ fontWeight: 600 }}>{stats.totalWastedQty} units</td>
              </tr>
              <tr>
                <td>Total quantity donated</td>
                <td style={{ fontWeight: 600 }}>{stats.totalDonatedQty} units</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
