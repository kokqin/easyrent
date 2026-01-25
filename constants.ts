
import { Tenant, Activity, RevenueData, Property, Expense, UtilityAccount } from './types';

export const REVENUE_DATA: RevenueData[] = [
  { week: 'Week 1', amount: 32000 },
  { week: 'Week 2', amount: 35000 },
  { week: 'Week 3', amount: 34000 },
  { week: 'Current', amount: 42500 },
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: 'The Aviary',
    address: '123 Skyline Boulevard, Downtown Metro',
    rooms: [
      { id: 'r1', number: '4B' },
      { id: 'r2', number: '10C' },
      { id: 'r3', number: '12A' }
    ]
  },
  {
    id: 'p2',
    name: 'Greenwood Heights',
    address: '45 Forest Lane, North District',
    rooms: [
      { id: 'r4', number: '2A' },
      { id: 'r5', number: '1A' }
    ]
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Unit 4B AC Repair',
    amount: 250,
    date: '2024-03-15',
    category: 'Maintenance',
    photos: ['https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?auto=format&fit=crop&q=80&w=200']
  },
  {
    id: 'e2',
    title: 'Monthly Cleaning - The Aviary',
    amount: 120,
    date: '2024-03-10',
    category: 'Cleaning',
    photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200']
  }
];

export const MOCK_UTILITY_ACCOUNTS: UtilityAccount[] = [
  {
    id: 'u1',
    type: 'Electricity',
    accountNumber: 'ELE-9920112',
    provider: 'Metro Power Grid',
    propertyId: 'p1'
  },
  {
    id: 'u2',
    type: 'Water',
    accountNumber: 'WTR-445882',
    provider: 'City Water Works',
    propertyId: 'p1'
  }
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    unit: '4B',
    leaseStart: 'Oct 24, 2023',
    leaseEnd: 'Oct 24, 2024',
    status: 'Moving Out',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1fOJhojZmpa1kZqdaoB2sxdGz2buFLBCmDAq6tyz0UW7JT7deab2N6pBvmm9LMaG_QaqAi9HgOXyuodEO9QCJQRMAjb9WAM2TP91N6d8CgQ_T78H6xCdQeiBGrihOl_kZSC--XcjXTXG5JEFSrKkYmaMtBl6jxp4UJPbzoYMkVmDM3VIkFs8lb5WBSolMKLpfhQ9SSXdwS1YxA-yXVfjOV9iBzsPUbqItXkjgEdnVozzt7w_idaCfGuPD6wU9MtjpbUOcxb-ohB-1',
    property: 'The Aviary',
    rent: 2450.00,
    deposit: 2450.00,
    notes: 'Tenant has a cat named Luna. Security deposit paid via wire transfer on Oct 25th.',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400'],
    idPhoto: 'https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&q=80&w=400'
  }
];

export const RECENT_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'payment',
    title: 'Rent Received',
    details: 'Unit 4B - Sarah Jenkins',
    amount: '+$1,250',
    timestamp: '2h ago'
  }
];
