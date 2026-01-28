
export type TenantStatus = 'Active' | 'Moving Out' | 'Late Payment';

export interface Tenant {
  id: string;
  name: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  status: TenantStatus;
  avatar?: string;
  property: string;
  rent: number;
  deposit: number;
  notes: string;
  photos?: string[];
  idPhoto?: string;
}

export interface Activity {
  id: string;
  type: 'payment' | 'lease' | 'maintenance';
  title: string;
  details: string;
  amount?: string;
  timestamp: string;
  status?: string;
}

export interface RevenueData {
  week: string;
  amount: number;
}

export interface Room {
  id: string;
  number: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  rooms: Room[];
}

export type ExpenseCategory = 'Maintenance' | 'Cleaning' | 'Utilities' | 'Rent' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  type: 'Income' | 'Expense';
  photos: string[];
  propertyId?: string;
  roomId?: string; // Optional: Link to a specific room
  utilityAccountId?: string; // Link to a specific utility account
}

export type UtilityType = 'Water' | 'Electricity' | 'Internet';

export interface UtilityAccount {
  id: string;
  type: UtilityType;
  accountNumber: string;
  provider: string;
  propertyId: string;
}

export type View = 'home' | 'properties' | 'tenants' | 'finance' | 'lease-details';
