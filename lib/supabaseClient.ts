import { createClient } from '@supabase/supabase-js';

// Configuration keys for localStorage
const STORAGE_PREFIX = 'easyrent_supabase';

const getStorageKey = (type: 'url' | 'key', email?: string) => {
    if (email) return `${STORAGE_PREFIX}_${type}_${email}`;
    return `${STORAGE_PREFIX}_${type}_global`;
};

const getStoredConfig = (email?: string) => {
    if (typeof window === 'undefined') return { url: null, key: null };

    // If email provided, try that first
    if (email) {
        const url = localStorage.getItem(getStorageKey('url', email));
        const key = localStorage.getItem(getStorageKey('key', email));
        if (url && key) return { url, key };
    }

    // Fallback to last used or global
    const lastUser = localStorage.getItem(`${STORAGE_PREFIX}_last_user`);
    const targetEmail = email || lastUser;

    if (targetEmail) {
        const url = localStorage.getItem(getStorageKey('url', targetEmail));
        const key = localStorage.getItem(getStorageKey('key', targetEmail));
        if (url && key) return { url, key };
    }

    return {
        url: localStorage.getItem(getStorageKey('url')),
        key: localStorage.getItem(getStorageKey('key'))
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

export const isConfigBound = (email?: string) => {
    const config = getStoredConfig(email);
    return !!(config.url && config.key);
};

export const updateSupabaseConfig = (url: string, key: string, email?: string) => {
    localStorage.setItem(getStorageKey('url', email), url);
    localStorage.setItem(getStorageKey('key', email), key);
    if (email) {
        localStorage.setItem(`${STORAGE_PREFIX}_last_user`, email);
    }
    window.location.reload();
};

export const clearSupabaseConfig = (email?: string) => {
    localStorage.removeItem(getStorageKey('url', email));
    localStorage.removeItem(getStorageKey('key', email));
    window.location.reload();
};

export const getSupabaseConfig = (email?: string) => {
    const config = getStoredConfig(email);
    return {
        url: config.url || import.meta.env.VITE_SUPABASE_URL || '',
        key: config.key || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
};
