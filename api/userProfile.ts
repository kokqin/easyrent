import { supabase } from '../lib/supabaseClient';

interface UserProfile {
    id: string;
    name: string;
    avatar: string;
}

const DEFAULT_PROFILE: Omit<UserProfile, 'id'> = {
    name: 'Billionaire',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100'
};

export async function getUserProfile(): Promise<UserProfile> {
    if (!supabase) {
        return { id: 'default', ...DEFAULT_PROFILE };
    }

    const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .limit(1)
        .single();

    if (error || !data) {
        // Create default profile if none exists
        const { data: newData, error: insertError } = await supabase
            .from('user_profile')
            .insert([DEFAULT_PROFILE])
            .select()
            .single();

        if (insertError || !newData) {
            console.error('Error creating user profile:', insertError);
            return { id: 'default', ...DEFAULT_PROFILE };
        }

        return {
            id: newData.id,
            name: newData.name,
            avatar: newData.avatar
        };
    }

    return {
        id: data.id,
        name: data.name,
        avatar: data.avatar
    };
}

export async function updateUserProfile(updates: Partial<Omit<UserProfile, 'id'>>): Promise<UserProfile | null> {
    if (!supabase) return null;

    // Get existing profile first
    const { data: existingData } = await supabase
        .from('user_profile')
        .select('id')
        .limit(1)
        .single();

    if (!existingData) {
        console.error('No user profile found to update');
        return null;
    }

    const { data, error } = await supabase
        .from('user_profile')
        .update(updates)
        .eq('id', existingData.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        return null;
    }

    return data ? {
        id: data.id,
        name: data.name,
        avatar: data.avatar
    } : null;
}
