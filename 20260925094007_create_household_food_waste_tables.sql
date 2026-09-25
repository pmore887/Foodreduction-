/*
# Household Food Waste Reduction - Database Schema

## Overview
Creates the complete schema for a household food-waste reduction app with multi-user support.
Each household (user) sees only their own data through Row Level Security policies.

## New Tables

1. **profiles** - Extended user info (display name, phone) linked to auth.users
   - id (uuid, PK, references auth.users)
   - full_name (text)
   - phone (text)
   - created_at (timestamptz)

2. **household_food** - Food items currently available at home
   - id (uuid, PK)
   - user_id (uuid, owner, defaults to auth.uid())
   - name (text, not null)
   - category (text)
   - quantity (numeric, not null)
   - unit (text)
   - date_added (date)
   - expiry_date (date)
   - description (text)
   - created_at (timestamptz)

3. **food_waste** - Records of wasted food
   - id (uuid, PK)
   - user_id (uuid, owner)
   - food_name (text)
   - quantity (numeric)
   - unit (text)
   - waste_date (date)
   - reason (text)
   - estimated_cost (numeric) - estimated money value of wasted food
   - created_at (timestamptz)

4. **shopping_list** - Smart shopping list items
   - id (uuid, PK)
   - user_id (uuid, owner)
   - item_name (text)
   - quantity (numeric)
   - unit (text)
   - category (text)
   - purchased (boolean, default false)
   - created_at (timestamptz)

5. **donations** - Donation offers from households
   - id (uuid, PK)
   - user_id (uuid, owner)
   - food_name (text)
   - quantity (numeric)
   - unit (text)
   - description (text)
   - available_date (date)
   - available_time (text)
   - donor_name (text)
   - donor_phone (text)
   - donor_email (text)
   - additional_info (text)
   - status (text, default 'pending')
   - created_at (timestamptz)

6. **history** - Aggregated household activity log
   - id (uuid, PK)
   - user_id (uuid, owner)
   - activity_type (text) - 'added', 'wasted', 'donated', 'shopping'
   - description (text)
   - quantity (numeric)
   - unit (text)
   - activity_date (timestamptz)
   - created_at (timestamptz)

## Security (RLS)
- All tables have RLS enabled.
- Owner-scoped CRUD policies: each authenticated user can only access rows where user_id = auth.uid().
- Owner columns default to auth.uid() so inserts work even when the client omits user_id.
- profiles table: users can read/update only their own profile row.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Household food inventory
CREATE TABLE IF NOT EXISTS household_food (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text DEFAULT 'Other',
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'pcs',
  date_added date DEFAULT CURRENT_DATE,
  expiry_date date,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE household_food ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_food" ON household_food;
CREATE POLICY "select_own_food" ON household_food FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_food" ON household_food;
CREATE POLICY "insert_own_food" ON household_food FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_food" ON household_food;
CREATE POLICY "update_own_food" ON household_food FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_food" ON household_food;
CREATE POLICY "delete_own_food" ON household_food FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_household_food_user_id ON household_food(user_id);
CREATE INDEX IF NOT EXISTS idx_household_food_expiry ON household_food(expiry_date);

-- Food waste records
CREATE TABLE IF NOT EXISTS food_waste (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'pcs',
  waste_date date DEFAULT CURRENT_DATE,
  reason text DEFAULT '',
  estimated_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_waste ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_waste" ON food_waste;
CREATE POLICY "select_own_waste" ON food_waste FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_waste" ON food_waste;
CREATE POLICY "insert_own_waste" ON food_waste FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_waste" ON food_waste;
CREATE POLICY "update_own_waste" ON food_waste FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_waste" ON food_waste;
CREATE POLICY "delete_own_waste" ON food_waste FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_food_waste_user_id ON food_waste(user_id);

-- Shopping list
CREATE TABLE IF NOT EXISTS shopping_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'pcs',
  category text DEFAULT 'Other',
  purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_shopping" ON shopping_list;
CREATE POLICY "select_own_shopping" ON shopping_list FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_shopping" ON shopping_list;
CREATE POLICY "insert_own_shopping" ON shopping_list FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_shopping" ON shopping_list;
CREATE POLICY "update_own_shopping" ON shopping_list FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_shopping" ON shopping_list;
CREATE POLICY "delete_own_shopping" ON shopping_list FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'pcs',
  description text DEFAULT '',
  available_date date DEFAULT CURRENT_DATE,
  available_time text DEFAULT '',
  donor_name text DEFAULT '',
  donor_phone text DEFAULT '',
  donor_email text DEFAULT '',
  additional_info text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_donations" ON donations;
CREATE POLICY "select_own_donations" ON donations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_donations" ON donations;
CREATE POLICY "insert_own_donations" ON donations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_donations" ON donations;
CREATE POLICY "update_own_donations" ON donations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_donations" ON donations;
CREATE POLICY "delete_own_donations" ON donations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);

-- History log
CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text DEFAULT '',
  quantity numeric DEFAULT 0,
  unit text DEFAULT '',
  activity_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON history;
CREATE POLICY "select_own_history" ON history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON history;
CREATE POLICY "insert_own_history" ON history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON history;
CREATE POLICY "delete_own_history" ON history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();