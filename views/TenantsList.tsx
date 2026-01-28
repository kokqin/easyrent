import React, { useState, useMemo, useEffect } from 'react';
import { Tenant, TenantStatus, Property } from '../types';

interface TenantsListProps {
  tenants: Tenant[];
  properties: Property[];
  onSelectTenant: (id: string) => void;
  onAddTenant: (tenant: Tenant) => void;
}

const TenantsList: React.FC<TenantsListProps> = ({ tenants, properties, onSelectTenant, onAddTenant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | TenantStatus>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Tenant Form State - using YYYY-MM-DD for date inputs
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    property: '',
    unit: '',
    rent: '',
    deposit: '',
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: '',
    notes: ''
  });

  // Set default property when properties load or modal opens
  useEffect(() => {
    if (showAddModal && properties.length > 0 && !newTenantData.property) {
      setNewTenantData(prev => ({ ...prev, property: properties[0].name }));
    }
  }, [showAddModal, properties]);

  const availableUnits = useMemo(() => {
    const prop = properties.find(p => p.name === newTenantData.property);
    return prop ? prop.rooms : [];
  }, [newTenantData.property, properties]);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Helper to format ISO date to "MMM DD, YYYY" for consistent UI
  const formatForDisplay = (isoStr: string) => {
    if (!isoStr) return 'TBD';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddSubmit = () => {
    if (!newTenantData.name || !newTenantData.unit || !newTenantData.rent) return;

    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: newTenantData.name,
      property: newTenantData.property,
      unit: newTenantData.unit,
      rent: parseFloat(newTenantData.rent) || 0,
      deposit: parseFloat(newTenantData.deposit) || 0,
      leaseStart: formatForDisplay(newTenantData.leaseStart),
      leaseEnd: formatForDisplay(newTenantData.leaseEnd),
      status: 'Active',
      notes: newTenantData.notes,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newTenantData.name)}&background=13ec5b&color=102216&bold=true`
    };

    onAddTenant(newTenant);
    setShowAddModal(false);
    // Reset form
    setNewTenantData({
      name: '',
      property: properties[0]?.name || '',
      unit: '',
      rent: '',
      deposit: '',
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: '',
      notes: ''
    });
  };

  const filters: ('All' | TenantStatus)[] = ['All', 'Active', 'Moving Out', 'Late Payment'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center px-6 pt-12 pb-4 justify-between bg-surface-light/80 dark:bg-background-dark/95 backdrop-blur-sm sticky top-0 z-20">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Tenants</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-2">
        <div className="flex items-center w-full rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm h-12 px-4 transition-all focus-within:ring-2 focus-within:ring-primary/50">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mr-3">search</span>
          <input
            className="bg-transparent border-none text-base w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 p-0"
            placeholder="Search name, unit, or property..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeFilter === f
              ? 'bg-primary text-background-dark shadow-md shadow-primary/10'
              : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tenant List */}
      <div className="flex flex-col px-4 gap-3 mt-2 pb-8">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => onSelectTenant(tenant.id)}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors overflow-hidden">
                {tenant.avatar ? (
                  <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url('${tenant.avatar}')` }}></div>
                ) : (
                  <span className="text-lg font-bold text-slate-700 dark:text-primary">{tenant.unit}</span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h3>
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mt-0.5 truncate">
                  {tenant.property} • Unit {tenant.unit}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] opacity-70">event</span>
                  Until {tenant.leaseEnd}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${tenant.status === 'Active'
                  ? 'bg-green-100 text-green-800 dark:bg-primary/10 dark:text-primary border-green-200 dark:border-primary/20'
                  : tenant.status === 'Moving Out'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20'
                  }`}>
                  {tenant.status}
                </span>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xl">chevron_right</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-500 italic">No tenants found matching your criteria.</div>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black tracking-tight">New Tenant</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter tenant name"
                  className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                  value={newTenantData.name}
                  onChange={e => setNewTenantData({ ...newTenantData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Property</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner appearance-none"
                    value={newTenantData.property}
                    onChange={e => setNewTenantData({ ...newTenantData, property: e.target.value, unit: '' })}
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Unit</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner appearance-none"
                    value={newTenantData.unit}
                    onChange={e => setNewTenantData({ ...newTenantData, unit: e.target.value })}
                  >
                    <option value="" disabled>Select</option>
                    {availableUnits.map(room => (
                      <option key={room.id} value={room.number}>{room.number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Lease Start</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                    value={newTenantData.leaseStart}
                    onChange={e => setNewTenantData({ ...newTenantData, leaseStart: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Lease End</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                    value={newTenantData.leaseEnd}
                    onChange={e => setNewTenantData({ ...newTenantData, leaseEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Monthly Rent</label>
                  <input
                    type="number"
                    placeholder="$0.00"
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-primary shadow-inner"
                    value={newTenantData.rent}
                    onChange={e => setNewTenantData({ ...newTenantData, rent: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Deposit</label>
                  <input
                    type="number"
                    placeholder="$0.00"
                    className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-primary shadow-inner"
                    value={newTenantData.deposit}
                    onChange={e => setNewTenantData({ ...newTenantData, deposit: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleAddSubmit}
                className="w-full bg-primary text-background-dark font-black py-4.5 rounded-[24px] uppercase tracking-widest active:scale-95 transition-transform mt-2 shadow-lg shadow-primary/20"
              >
                Onboard Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsList;
