import { supabase } from '../lib/supabaseClient';
import { Tenant } from '../types';

// Convert database row to Tenant type
const mapRowToTenant = (row: any): Tenant => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    status: row.status,
    avatar: row.avatar,
    property: row.property,
    rent: parseFloat(row.rent),
    deposit: parseFloat(row.deposit),
    notes: row.notes || '',
    photos: row.photos || [],
    idPhoto: row.id_photo
});

// Convert Tenant to database row format
const mapTenantToRow = (tenant: Partial<Tenant>) => ({
    name: tenant.name,
    unit: tenant.unit,
    lease_start: tenant.leaseStart,
    lease_end: tenant.leaseEnd,
    status: tenant.status,
    avatar: tenant.avatar,
    property: tenant.property,
    rent: tenant.rent,
    deposit: tenant.deposit,
    notes: tenant.notes,
    photos: tenant.photos,
    id_photo: tenant.idPhoto
});

export async function getTenants(): Promise<Tenant[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tenants:', error);
        return [];
    }

    return data?.map(mapRowToTenant) || [];
}

export async function getTenantById(id: string): Promise<Tenant | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching tenant:', error);
        return null;
    }

    return data ? mapRowToTenant(data) : null;
}

export async function createTenant(tenant: Omit<Tenant, 'id'>): Promise<Tenant | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('tenants')
        .insert([{ ...mapTenantToRow(tenant), user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating tenant:', error);
        return null;
    }

    return data ? mapRowToTenant(data) : null;
}

export async function updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('tenants')
        .update(mapTenantToRow(updates))
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating tenant:', error);
        return null;
    }

    return data ? mapRowToTenant(data) : null;
}

export async function deleteTenant(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting tenant:', error);
        return false;
    }

    return true;
}
