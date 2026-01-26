
import React, { useState, useEffect } from 'react';
import { View, Tenant, Expense, UtilityAccount } from './types';
import Dashboard from './views/Dashboard';
import TenantsList from './views/TenantsList';
import LeaseDetails from './views/LeaseDetails';
import PropertiesList from './views/PropertiesList';
import FinanceList from './views/FinanceList';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import { useTenants, useExpenses, useUtilityAccounts, useUserProfile } from './hooks/useSupabase';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  // Use Supabase hooks for data management
  const { tenants, addTenant, updateTenant } = useTenants();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { utilityAccounts, addUtility, updateUtility, deleteUtility } = useUtilityAccounts();
  const { profile: userProfile, updateProfile: onUpdateProfile } = useUserProfile();

  if (!session) {
    return <Login />;
  }

  const navigateToLeaseDetails = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setCurrentView('lease-details');
  };

  const handleAddExpense = (newExpense: Expense) => {
    addExpense(newExpense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  const handleAddUtility = (newUtility: UtilityAccount) => {
    addUtility(newUtility);
  };

  const handleUpdateUtility = (updatedUtility: UtilityAccount) => {
    updateUtility(updatedUtility);
  };

  const handleDeleteUtility = (id: string) => {
    deleteUtility(id);
  };

  const handleUpdateProfile = (updates: Partial<{ name: string; avatar: string }>) => {
    onUpdateProfile(updates);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    updateTenant(updatedTenant);
  };

  const handleAddTenant = (newTenant: Tenant) => {
    addTenant(newTenant);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Dashboard
            onSelectTenant={navigateToLeaseDetails}
            expenses={expenses}
            tenants={tenants}
            utilityAccounts={utilityAccounts}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'tenants':
        return <TenantsList tenants={tenants} onSelectTenant={navigateToLeaseDetails} onAddTenant={handleAddTenant} />;
      case 'properties':
        return <PropertiesList expenses={expenses} />;
      case 'finance':
        return (
          <FinanceList
            expenses={expenses}
            utilityAccounts={utilityAccounts}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddUtility={handleAddUtility}
            onUpdateUtility={handleUpdateUtility}
            onDeleteUtility={handleDeleteUtility}
          />
        );
      case 'lease-details':
        return (
          <LeaseDetails
            tenantId={selectedTenantId!}
            tenants={tenants}
            onUpdateTenant={handleUpdateTenant}
            onBack={() => setCurrentView('tenants')}
          />
        );
      default:
        return (
          <Dashboard
            onSelectTenant={navigateToLeaseDetails}
            expenses={expenses}
            tenants={tenants}
            utilityAccounts={utilityAccounts}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
    }
  };

  const showNav = ['home', 'properties', 'tenants', 'finance'].includes(currentView);

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-background-light dark:bg-background-dark overflow-x-hidden">
      <main className={`${showNav ? 'pb-24' : ''}`}>
        {renderView()}
      </main>

      {showNav && (
        <BottomNav
          activeView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setSelectedTenantId(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
