import { supabase } from '../lib/supabaseClient';
import { Activity } from '../types';

const mapRowToActivity = (row: any): Activity => ({
    id: row.id,
    type: row.type,
    title: row.title,
    details: row.details,
    amount: row.amount,
    timestamp: row.timestamp,
    status: row.status
});

export async function getActivities(): Promise<Activity[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching activities:', error);
        return [];
    }

    return data?.map(mapRowToActivity) || [];
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('activities')
        .insert([{
            type: activity.type,
            title: activity.title,
            details: activity.details,
            amount: activity.amount,
            timestamp: activity.timestamp,
            status: activity.status,
            user_id: user.id
        }])
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error creating activity:', error);
        return null;
    }

    return data ? mapRowToActivity(data) : null;
}
