import { createClient } from '@supabase/supabase-js';

// Configuration keys for localStorage
const STORAGE_KEYS = {
    URL: 'easyrent_supabase_url',
    KEY: 'easyrent_supabase_key'
};

const getStoredConfig = () => {
    if (typeof window === 'undefined') return { url: null, key: null };
    return {
        url: localStorage.getItem(STORAGE_KEYS.URL),
        key: localStorage.getItem(STORAGE_KEYS.KEY)
    };
};

const { url: storedUrl, key: storedKey } = getStoredConfig();

const supabaseUrl = storedUrl || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using mock data mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;

export const updateSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem(STORAGE_KEYS.URL, url);
    localStorage.setItem(STORAGE_KEYS.KEY, key);
    window.location.reload(); // Reload to re-initialize client
};

export const clearSupabaseConfig = () => {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.KEY);
    window.location.reload();
};

export const getSupabaseConfig = () => ({
    url: localStorage.getItem(STORAGE_KEYS.URL) || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem(STORAGE_KEYS.KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
});
