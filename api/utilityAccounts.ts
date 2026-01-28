import { supabase } from '../lib/supabaseClient';
import { UtilityAccount } from '../types';

const mapRowToUtilityAccount = (row: any): UtilityAccount => ({
    id: row.id,
    type: row.type,
    accountNumber: row.account_number,
    provider: row.provider,
    propertyId: row.property_id
});

const mapUtilityAccountToRow = (account: Partial<UtilityAccount>) => ({
    type: account.type,
    account_number: account.accountNumber,
    provider: account.provider,
    property_id: account.propertyId
});

export async function getUtilityAccounts(): Promise<UtilityAccount[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('utility_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching utility accounts:', error);
        return [];
    }

    return data?.map(mapRowToUtilityAccount) || [];
}

export async function createUtilityAccount(account: Omit<UtilityAccount, 'id'>): Promise<UtilityAccount | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('utility_accounts')
        .insert([{ ...mapUtilityAccountToRow(account), user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating utility account:', error);
        return null;
    }

    return data ? mapRowToUtilityAccount(data) : null;
}

export async function updateUtilityAccount(id: string, updates: Partial<UtilityAccount>): Promise<UtilityAccount | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('utility_accounts')
        .update(mapUtilityAccountToRow(updates))
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating utility account:', error);
        return null;
    }

    return data ? mapRowToUtilityAccount(data) : null;
}

export async function deleteUtilityAccount(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('utility_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting utility account:', error);
        return false;
    }

    return true;
}
