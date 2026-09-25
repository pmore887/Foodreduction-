import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase, FOOD_CATEGORIES, UNITS } from '../lib/supabaseClient.js'
import { logHistory, getExpiryBadge } from '../lib/helpers.js'
import { Search, Pencil, Trash2, X, Package, Filter } from 'lucide-react'

export default function Inventory() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    if (user) loadFood()
  }, [user])

  const loadFood = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('household_food')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      setError('Failed to load food inventory.')
      setLoading(false)
      return
    }
    setItems(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let result = items
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((i) => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
    }
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter)
    }
    setFiltered(result)
  }, [search, categoryFilter, items])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}" from your inventory?`)) return
    const { error } = await supabase.from('household_food').delete().eq('id', id)
    if (error) {
      setError('Failed to delete item.')
      return
    }
    setItems(items.filter((i) => i.id !== id))
  }

  const startEdit = (item) => {
    setEditItem(item)
    setEditForm({ ...item })
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      setError('Food name is required.')
      return
    }
    const { error } = await supabase.from('household_food').update({
      name: editForm.name.trim(),
      category: editForm.category,
      quantity: parseFloat(editForm.quantity),
      unit: editForm.unit,
      date_added: editForm.date_added,
      expiry_date: editForm.expiry_date || null,
      description: editForm.description || '',
    }).eq('id', editForm.id)

    if (error) {
      setError('Failed to update item.')
      return
    }

    setItems(items.map((i) => i.id === editForm.id ? editForm : i))
    setEditItem(null)
    setEditForm(null)
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Household Food Inventory</h1>
        <p className="page-subtitle">All food items currently available at home</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={28} /></div>
            <p>{items.length === 0 ? 'No food items in your inventory yet.' : 'No items match your search.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Date Added</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const badge = getExpiryBadge(item.expiry_date)
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>}
                      </td>
                      <td>{item.category}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.date_added ? new Date(item.date_added).toLocaleDateString() : '-'}</td>
                      <td>
                        {item.expiry_date ? (
                          <div>
                            <div>{new Date(item.expiry_date).toLocaleDateString()}</div>
                            <span className={`badge ${badge.class}`} style={{ marginTop: 4 }}>{badge.text}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)} title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item.id, item.name)} title="Delete" style={{ color: 'var(--error)' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editItem && editForm && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Edit Food Item</div>
            <div className="form-group">
              <label className="form-label">Food Name</label>
              <input className="form-input" name="name" value={editForm.name || ''} onChange={handleEditChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={editForm.category || ''} onChange={handleEditChange}>
                  {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" name="unit" value={editForm.unit || ''} onChange={handleEditChange}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" name="quantity" value={editForm.quantity || 0} onChange={handleEditChange} min="0.01" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Date Added</label>
                <input className="form-input" type="date" name="date_added" value={editForm.date_added || ''} onChange={handleEditChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-input" type="date" name="expiry_date" value={editForm.expiry_date || ''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={editForm.description || ''} onChange={handleEditChange} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
