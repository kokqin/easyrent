# Rental Solution - Landlord Portal

A premium landlord management dashboard featuring tenant tracking, revenue visualization, and lease management.

## Features

- **Supabase Authentication**: Secure login and signup for landlords.
- **Private Data Isolation**: Each landlord manages their own properties, tenants, and expenses securely.
- **Dashboard**: High-level overview of revenue, active leases, and recent activities.
- **Tenant Management**: Track tenant details, lease dates, and payment status.
- **Finance Tracking**: Manage property expenses and utility accounts.
- **Responsive UI**: Sleek dark-mode aesthetic built with React and Tailwind CSS.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up environment variables in `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm run dev`.

## Database Setup

Run the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor to initialize the database tables and RLS policies.
