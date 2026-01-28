import { useState, useEffect, useCallback } from 'react';
import { Tenant, Expense, UtilityAccount, Property, Activity } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import * as api from '../api';
import { MOCK_TENANTS, MOCK_EXPENSES, MOCK_UTILITY_ACCOUNTS, MOCK_PROPERTIES, RECENT_ACTIVITIES } from '../constants';

interface DataState<T> {
    data: T;
    loading: boolean;
    error: string | null;
}

// Hook for managing tenants
export function useTenants() {
    const [state, setState] = useState<DataState<Tenant[]>>({
        data: MOCK_TENANTS,
        loading: true,
        error: null
    });

    const fetchTenants = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState({ data: MOCK_TENANTS, loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const data = await api.getTenants();
        setState({ data, loading: false, error: null });
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const addTenant = useCallback(async (tenant: Tenant) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: [tenant, ...prev.data] }));
            return;
        }

        const newTenant = await api.createTenant(tenant);
        if (newTenant) {
            setState(prev => ({ ...prev, data: [newTenant, ...prev.data] }));
        }
    }, []);

    const updateTenant = useCallback(async (tenant: Tenant) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(t => t.id === tenant.id ? tenant : t)
            }));
            return;
        }

        const updated = await api.updateTenant(tenant.id, tenant);
        if (updated) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(t => t.id === tenant.id ? updated : t)
            }));
        }
    }, []);

    const deleteTenant = useCallback(async (id: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: prev.data.filter(t => t.id !== id) }));
            return;
        }

        const success = await api.deleteTenant(id);
        if (success) {
            setState(prev => ({ ...prev, data: prev.data.filter(t => t.id !== id) }));
        }
    }, []);

    return {
        tenants: state.data,
        loading: state.loading,
        error: state.error,
        addTenant,
        updateTenant,
        deleteTenant,
        refetch: fetchTenants
    };
}

// Hook for managing expenses
export function useExpenses() {
    const [state, setState] = useState<DataState<Expense[]>>({
        data: MOCK_EXPENSES,
        loading: true,
        error: null
    });

    const fetchExpenses = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState({ data: MOCK_EXPENSES, loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const data = await api.getExpenses();
        setState({ data, loading: false, error: null });
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = useCallback(async (expense: Expense) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: [expense, ...prev.data] }));
            return expense;
        }

        const newExpense = await api.createExpense(expense);
        if (newExpense) {
            setState(prev => ({ ...prev, data: [newExpense, ...prev.data] }));
        }
        return newExpense;
    }, []);

    const deleteExpense = useCallback(async (id: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: prev.data.filter(e => e.id !== id) }));
            return;
        }

        const success = await api.deleteExpense(id);
        if (success) {
            setState(prev => ({ ...prev, data: prev.data.filter(e => e.id !== id) }));
        }
    }, []);

    return {
        expenses: state.data,
        loading: state.loading,
        error: state.error,
        addExpense,
        deleteExpense,
        refetch: fetchExpenses
    };
}

// Hook for managing utility accounts
export function useUtilityAccounts() {
    const [state, setState] = useState<DataState<UtilityAccount[]>>({
        data: MOCK_UTILITY_ACCOUNTS,
        loading: true,
        error: null
    });

    const fetchUtilityAccounts = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState({ data: MOCK_UTILITY_ACCOUNTS, loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const data = await api.getUtilityAccounts();
        setState({ data, loading: false, error: null });
    }, []);

    useEffect(() => {
        fetchUtilityAccounts();
    }, [fetchUtilityAccounts]);

    const addUtility = useCallback(async (utility: UtilityAccount) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: [...prev.data, utility] }));
            return utility;
        }

        const newUtility = await api.createUtilityAccount(utility);
        if (newUtility) {
            setState(prev => ({ ...prev, data: [...prev.data, newUtility] }));
        }
        return newUtility;
    }, []);

    const updateUtility = useCallback(async (utility: UtilityAccount) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(u => u.id === utility.id ? utility : u)
            }));
            return;
        }

        const updated = await api.updateUtilityAccount(utility.id, utility);
        if (updated) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(u => u.id === utility.id ? updated : u)
            }));
        }
    }, []);

    const deleteUtility = useCallback(async (id: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: prev.data.filter(u => u.id !== id) }));
            return;
        }

        const success = await api.deleteUtilityAccount(id);
        if (success) {
            setState(prev => ({ ...prev, data: prev.data.filter(u => u.id !== id) }));
        }
    }, []);

    return {
        utilityAccounts: state.data,
        loading: state.loading,
        error: state.error,
        addUtility,
        updateUtility,
        deleteUtility,
        refetch: fetchUtilityAccounts
    };
}

// Hook for managing properties
export function useProperties() {
    const [state, setState] = useState<DataState<Property[]>>({
        data: MOCK_PROPERTIES,
        loading: true,
        error: null
    });

    const fetchProperties = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState({ data: MOCK_PROPERTIES, loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const data = await api.getProperties();
        setState({ data, loading: false, error: null });
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const addProperty = useCallback(async (property: Property) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: [...prev.data, property] }));
            return;
        }

        const newProperty = await api.createProperty(property);
        if (newProperty) {
            setState(prev => ({ ...prev, data: [...prev.data, newProperty] }));
        }
    }, []);

    const updateProperty = useCallback(async (property: Property) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === property.id ? property : p)
            }));
            return;
        }

        const updated = await api.updateProperty(property.id, property);
        if (updated) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === property.id ? updated : p)
            }));
        }
    }, []);

    const deleteProperty = useCallback(async (id: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: prev.data.filter(p => p.id !== id) }));
            return;
        }

        const success = await api.deleteProperty(id);
        if (success) {
            setState(prev => ({ ...prev, data: prev.data.filter(p => p.id !== id) }));
        }
    }, []);

    const addRoom = useCallback(async (propertyId: string, roomNumber: string) => {
        if (!isSupabaseConfigured()) {
            const newRoom = { id: Date.now().toString(), number: roomNumber };
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? { ...p, rooms: [...p.rooms, newRoom] } : p)
            }));
            return;
        }

        const newRoom = await api.addRoom(propertyId, roomNumber);
        if (newRoom) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? { ...p, rooms: [...p.rooms, newRoom] } : p)
            }));
        }
    }, []);

    const updateRoom = useCallback(async (propertyId: string, roomId: string, roomNumber: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? {
                    ...p,
                    rooms: p.rooms.map(r => r.id === roomId ? { ...r, number: roomNumber } : r)
                } : p)
            }));
            return;
        }

        const updated = await api.updateRoom(roomId, roomNumber);
        if (updated) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? {
                    ...p,
                    rooms: p.rooms.map(r => r.id === roomId ? updated : r)
                } : p)
            }));
        }
    }, []);

    const deleteRoom = useCallback(async (propertyId: string, roomId: string) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? {
                    ...p,
                    rooms: p.rooms.filter(r => r.id !== roomId)
                } : p)
            }));
            return;
        }

        const success = await api.deleteRoom(roomId);
        if (success) {
            setState(prev => ({
                ...prev,
                data: prev.data.map(p => p.id === propertyId ? {
                    ...p,
                    rooms: p.rooms.filter(r => r.id !== roomId)
                } : p)
            }));
        }
    }, []);

    return {
        properties: state.data,
        loading: state.loading,
        error: state.error,
        addProperty,
        updateProperty,
        deleteProperty,
        addRoom,
        updateRoom,
        deleteRoom,
        refetch: fetchProperties
    };
}

// Hook for managing activities
export function useActivities() {
    const [state, setState] = useState<DataState<Activity[]>>({
        data: RECENT_ACTIVITIES,
        loading: true,
        error: null
    });

    const fetchActivities = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState({ data: RECENT_ACTIVITIES, loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const data = await api.getActivities();
        setState({ data, loading: false, error: null });
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const addActivity = useCallback(async (activity: Activity) => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, data: [activity, ...prev.data] }));
            return;
        }

        const newActivity = await api.createActivity(activity);
        if (newActivity) {
            setState(prev => ({ ...prev, data: [newActivity, ...prev.data] }));
        }
    }, []);

    return {
        activities: state.data,
        loading: state.loading,
        error: state.error,
        addActivity,
        refetch: fetchActivities
    };
}

// Hook for managing user profile
export function useUserProfile() {
    const [state, setState] = useState<{
        profile: { name: string; avatar: string; email?: string };
        loading: boolean;
        error: string | null;
    }>({
        profile: {
            name: 'Billionaire',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
            email: undefined
        },
        loading: true,
        error: null
    });

    const fetchProfile = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));
        const { data: { user } } = await supabase!.auth.getUser();
        const data = await api.getUserProfile();
        setState({
            profile: {
                name: data.name,
                avatar: data.avatar,
                email: user?.email
            },
            loading: false,
            error: null
        });
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = useCallback(async (updates: Partial<{ name: string; avatar: string }>) => {
        setState(prev => ({
            ...prev,
            profile: { ...prev.profile, ...updates }
        }));

        if (!isSupabaseConfigured()) return;

        await api.updateUserProfile(updates);
    }, []);

    return {
        profile: state.profile,
        loading: state.loading,
        error: state.error,
        updateProfile,
        refetch: fetchProfile
    };
}
