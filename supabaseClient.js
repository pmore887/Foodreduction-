import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Meat & Poultry',
  'Fish & Seafood',
  'Grains & Cereals',
  'Bakery',
  'Beverages',
  'Snacks',
  'Frozen Foods',
  'Condiments & Sauces',
  'Other',
]

export const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'box', 'bottle', 'bag', 'bunch']

export const WASTE_REASONS = [
  'Expired',
  'Spoiled',
  'Moldy',
  'Overcooked',
  'Leftover too long',
  'Purchased too much',
  'Did not like taste',
  'Other',
]

// Approximate Indian household food prices (per unit) for estimating waste/donation value.
// These are NOT exact market prices — only rough averages for estimation.
export const FOOD_PRICE_RANGES = {
  'Fruits': { min: 50, max: 150, avg: 100 },        // per kg
  'Vegetables': { min: 30, max: 80, avg: 55 },      // per kg
  'Dairy': { min: 20, max: 80, avg: 50 },           // per L/pack
  'Meat & Poultry': { min: 150, max: 300, avg: 220 }, // per kg
  'Fish & Seafood': { min: 200, max: 400, avg: 300 }, // per kg
  'Grains & Cereals': { min: 40, max: 80, avg: 60 }, // per kg (rice, wheat)
  'Bakery': { min: 25, max: 80, avg: 50 },          // per piece
  'Beverages': { min: 20, max: 120, avg: 60 },      // per L/bottle
  'Snacks': { min: 10, max: 60, avg: 35 },          // per pack
  'Frozen Foods': { min: 40, max: 150, avg: 90 },   // per pack
  'Condiments & Sauces': { min: 30, max: 150, avg: 80 }, // per bottle
  'Other': { min: 20, max: 80, avg: 50 },           // fallback per unit
}

// Default average price per unit (in INR) used when category is unknown.
export const AVG_FOOD_PRICE = 50

// Indian Rupee formatter — rounds to whole rupees, no decimals.
export function formatINR(amount) {
  const rounded = Math.round(amount)
  return '\u20B9' + rounded.toLocaleString('en-IN')
}
