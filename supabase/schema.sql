
-- ZenLease Landlord Portal - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- 1. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rooms table (linked to properties)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  lease_start TEXT NOT NULL,
  lease_end TEXT NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Moving Out', 'Late Payment')) DEFAULT 'Active',
  avatar TEXT,
  property TEXT NOT NULL,
  rent DECIMAL(10,2) NOT NULL,
  deposit DECIMAL(10,2) NOT NULL,
  notes TEXT,
  photos TEXT[],
  id_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT CHECK (category IN ('Maintenance', 'Cleaning', 'Utilities', 'Other')) NOT NULL,
  photos TEXT[],
  property_id UUID REFERENCES properties(id),
  utility_account_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Utility Accounts table
CREATE TABLE IF NOT EXISTS utility_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  type TEXT CHECK (type IN ('Water', 'Electricity', 'Internet')) NOT NULL,
  account_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  type TEXT CHECK (type IN ('payment', 'lease', 'maintenance')) NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  amount TEXT,
  timestamp TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() UNIQUE,
  name TEXT NOT NULL DEFAULT 'Billionaire',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100'
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for private access (Authenticated users only, their own data)

CREATE POLICY "Users can view their own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rooms" ON rooms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rooms" ON rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rooms" ON rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rooms" ON rooms FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tenants" ON tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tenants" ON tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tenants" ON tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tenants" ON tenants FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own utility_accounts" ON utility_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own utility_accounts" ON utility_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own utility_accounts" ON utility_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own utility_accounts" ON utility_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON activities FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" ON user_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON user_profile FOR DELETE USING (auth.uid() = user_id);
