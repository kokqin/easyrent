import { supabase } from '../lib/supabaseClient';
import { Expense } from '../types';

const mapRowToExpense = (row: any): Expense => ({
    id: row.id,
    title: row.title,
    amount: parseFloat(row.amount),
    date: row.date,
    category: row.category,
    type: row.type || 'Expense',
    photos: row.photos || [],
    propertyId: row.property_id,
    utilityAccountId: row.utility_account_id
});

const mapExpenseToRow = (expense: Partial<Expense>) => ({
    title: expense.title,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
    type: expense.type,
    photos: expense.photos,
    property_id: expense.propertyId,
    utility_account_id: expense.utilityAccountId
});

export async function getExpenses(): Promise<Expense[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }

    return data?.map(mapRowToExpense) || [];
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...mapExpenseToRow(expense), user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating expense:', error);
        return null;
    }

    return data ? mapRowToExpense(data) : null;
}

export async function deleteExpense(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting expense:', error);
        return false;
    }

    return true;
}
