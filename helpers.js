import { supabase, FOOD_PRICE_RANGES, AVG_FOOD_PRICE, formatINR } from './supabaseClient.js'

// Estimate the value of a food item in INR based on its category and quantity.
// Uses approximate Indian household food prices — NOT exact market rates.
export function estimateFoodValue(category, quantity, unit) {
  const priceRange = FOOD_PRICE_RANGES[category] || FOOD_PRICE_RANGES['Other']
  let qty = parseFloat(quantity) || 1
  // For gram/ml units, convert to kg/L for pricing
  if (unit === 'g') qty = qty / 1000
  if (unit === 'ml') qty = qty / 1000
  // For piece-based units (pcs, pack, box, bottle, bag, bunch), use price per unit
  return Math.round(qty * priceRange.avg)
}

export { formatINR }

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return 'unknown'
  if (days < 0) return 'expired'
  if (days <= 3) return 'expiring'
  return 'fresh'
}

export function getExpiryBadge(expiryDate) {
  const status = getExpiryStatus(expiryDate)
  const days = getDaysUntilExpiry(expiryDate)
  if (status === 'expired') return { class: 'badge-expired', text: `Expired ${Math.abs(days)}d ago` }
  if (status === 'expiring') return { class: 'badge-expiring', text: `${days}d left` }
  if (status === 'fresh') return { class: 'badge-fresh', text: `${days}d left` }
  return { class: 'badge-fresh', text: 'No expiry' }
}

export async function fetchDashboardStats(userId) {
  const [foodRes, wasteRes, donationRes, shoppingRes] = await Promise.all([
    supabase.from('household_food').select('*').eq('user_id', userId),
    supabase.from('food_waste').select('*').eq('user_id', userId),
    supabase.from('donations').select('*').eq('user_id', userId),
    supabase.from('shopping_list').select('*').eq('user_id', userId),
  ])

  const foodItems = foodRes.data || []
  const wasteItems = wasteRes.data || []
  const donations = donationRes.data || []
  const shoppingItems = shoppingRes.data || []

  const expiringSoon = foodItems.filter((f) => {
    const status = getExpiryStatus(f.expiry_date)
    return status === 'expiring' || status === 'expired'
  })

  const totalWasteCost = wasteItems.reduce((sum, w) => sum + (parseFloat(w.estimated_cost) || 0), 0)
  const totalDonatedQty = donations.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0)
  const totalWastedQty = wasteItems.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0)

  const wasteReductionPct = totalDonatedQty + totalWastedQty > 0
    ? Math.round((totalDonatedQty / (totalDonatedQty + totalWastedQty)) * 100)
    : 0

  // Estimated money saved: value of food donated (food redirected from potential waste)
  // plus 50% of waste cost (food that tracking helps avoid in future).
  const donatedValue = donations.reduce((sum, d) =>
    sum + estimateFoodValue(d.category || 'Other', d.quantity, d.unit), 0)
  const moneySaved = Math.round(donatedValue + totalWasteCost * 0.5)

  const shoppingPending = shoppingItems.filter((s) => !s.purchased).length

  return {
    foodCount: foodItems.length,
    expiringCount: expiringSoon.length,
    donatedCount: donations.length,
    wasteCount: wasteItems.length,
    wasteReductionPct,
    moneySaved,
    shoppingPending,
    totalDonatedQty,
    totalWastedQty,
    totalWasteCost,
  }
}

export async function logHistory(userId, activityType, description, quantity, unit) {
  await supabase.from('history').insert({
    user_id: userId,
    activity_type: activityType,
    description,
    quantity: parseFloat(quantity) || 0,
    unit: unit || '',
  })
}
