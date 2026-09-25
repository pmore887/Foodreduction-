import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase, FOOD_CATEGORIES, UNITS } from '../lib/supabaseClient.js'
import { logHistory } from '../lib/helpers.js'
import { ShoppingCart, Check, Trash2, Plus, Package, AlertCircle } from 'lucide-react'

export default function ShoppingList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    item_name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Other',
  })

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [shopRes, foodRes] = await Promise.all([
      supabase.from('shopping_list').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('household_food').select('name, quantity, unit').eq('user_id', user.id),
    ])
    if (shopRes.error || foodRes.error) {
      setError('Failed to load shopping list.')
    } else {
      setItems(shopRes.data || [])
      setInventory(foodRes.data || [])
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.item_name.trim()) {
      setError('Please enter an item name.')
      return
    }

    const inInventory = inventory.some(
      (i) => i.name.toLowerCase() === form.item_name.trim().toLowerCase()
    )
    if (inInventory) {
      setError(`"${form.item_name}" is already in your household inventory. Consider using it before buying more.`)
      return
    }

    const { error } = await supabase.from('shopping_list').insert({
      user_id: user.id,
      item_name: form.item_name.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      category: form.category,
    })

    if (error) {
      setError('Failed to add shopping item.')
      return
    }

    await logHistory(user.id, 'shopping', `Added ${form.item_name} to shopping list`, form.quantity, form.unit)

    setSuccess(`"${form.item_name}" added to your shopping list.`)
    setForm({ item_name: '', quantity: 1, unit: 'pcs', category: 'Other' })
    loadData()
  }

  const togglePurchased = async (item) => {
    const { error } = await supabase
      .from('shopping_list')
      .update({ purchased: !item.purchased })
      .eq('id', item.id)
    if (error) {
      setError('Failed to update item.')
      return
    }
    setItems(items.map((i) => i.id === item.id ? { ...i, purchased: !i.purchased } : i))
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('shopping_list').delete().eq('id', id)
    if (error) {
      setError('Failed to delete item.')
      return
    }
    setItems(items.filter((i) => i.id !== id))
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  const pending = items.filter((i) => !i.purchased)
  const purchased = items.filter((i) => i.purchased)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Smart Shopping List</h1>
        <p className="page-subtitle">Plan purchases and avoid buying food you already have</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="info-banner">
        <Package className="info-banner-icon" size={22} />
        <div>
          <h3>{inventory.length} items currently in your household inventory</h3>
          <p>The system checks your inventory before adding items to prevent unnecessary purchases.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }} className="shopping-layout">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Add Shopping Item</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className="form-input" name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g. Milk" />
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
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">
              <Plus size={16} /> Add to List
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 className="card-title" style={{ marginBottom: 16 }}>
              To Buy ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><ShoppingCart size={28} /></div>
                <p>No items to buy. Add items to your shopping list.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Category</th>
                      <th>Purchased</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.category}</td>
                        <td>
                          <label className="checkbox-row">
                            <input type="checkbox" checked={item.purchased} onChange={() => togglePurchased(item)} />
                          </label>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item.id)} style={{ color: 'var(--error)' }}>
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

          {purchased.length > 0 && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 16 }}>
                Purchased ({purchased.length})
              </h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchased.map((item) => (
                      <tr key={item.id} style={{ opacity: 0.6 }}>
                        <td style={{ fontWeight: 600, textDecoration: 'line-through' }}>{item.item_name}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.category}</td>
                        <td><span className="badge badge-completed"><Check size={12} /> Purchased</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item.id)} style={{ color: 'var(--error)' }}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .shopping-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
