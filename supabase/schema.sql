-- ZenLease Landlord Portal - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- 1. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rooms table (linked to properties)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  type TEXT CHECK (type IN ('Water', 'Electricity', 'Internet')) NOT NULL,
  account_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  name TEXT NOT NULL DEFAULT 'Billionaire',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100'
);

-- Enable Row Level Security (RLS) for all tables
-- Note: For public access without auth, we'll disable RLS or create public policies

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
-- WARNING: This allows anyone with your anon key to read/write data

CREATE POLICY "Allow public read access" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON properties FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON properties FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON rooms FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON tenants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON tenants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON tenants FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON expenses FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON utility_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON utility_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON utility_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON utility_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON activities FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON user_profile FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON user_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON user_profile FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON user_profile FOR DELETE USING (true);

-- Insert sample data (optional - remove if you don't want seed data)

-- Sample Properties
INSERT INTO properties (id, name, address) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'The Aviary', '123 Skyline Boulevard, Downtown Metro'),
  ('22222222-2222-2222-2222-222222222222', 'Greenwood Heights', '45 Forest Lane, North District');

-- Sample Rooms
INSERT INTO rooms (property_id, number) VALUES 
  ('11111111-1111-1111-1111-111111111111', '4B'),
  ('11111111-1111-1111-1111-111111111111', '10C'),
  ('11111111-1111-1111-1111-111111111111', '12A'),
  ('22222222-2222-2222-2222-222222222222', '2A'),
  ('22222222-2222-2222-2222-222222222222', '1A');

-- Sample Utility Accounts
INSERT INTO utility_accounts (type, account_number, provider, property_id) VALUES 
  ('Electricity', 'ELE-9920112', 'Metro Power Grid', '11111111-1111-1111-1111-111111111111'),
  ('Water', 'WTR-445882', 'City Water Works', '11111111-1111-1111-1111-111111111111');
