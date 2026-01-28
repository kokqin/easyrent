
import React, { useMemo, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { REVENUE_DATA, RECENT_ACTIVITIES, MOCK_PROPERTIES } from '../constants';
import { Expense, Tenant, UtilityAccount } from '../types';
import { supabase, getSupabaseConfig, updateSupabaseConfig, clearSupabaseConfig } from '../lib/supabaseClient';

interface DashboardProps {
  onSelectTenant: (id: string) => void;
  expenses: Expense[];
  tenants: Tenant[];
  utilityAccounts: UtilityAccount[];
  userProfile: { name: string; avatar: string };
  onUpdateProfile: (updates: Partial<{ name: string; avatar: string }>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onSelectTenant,
  expenses,
  tenants,
  utilityAccounts,
  userProfile,
  onUpdateProfile
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Logic
  const notifications = useMemo(() => {
    const list: { id: string; msg: string; type: 'utility' | 'tenant'; targetId?: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check Unpaid Utility Accounts (30-day rule)
    utilityAccounts.forEach(account => {
      const accountExpenses = expenses.filter(e => e.utilityAccountId === account.id);
      const latestPayment = accountExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      let isUnpaid = false;
      if (!latestPayment) {
        isUnpaid = true;
      } else {
        const lastDateObj = new Date(latestPayment.date);
        lastDateObj.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) isUnpaid = true;
      }

      if (isUnpaid) {
        list.push({
          id: `util-${account.id}`,
          msg: `${account.type} payment overdue for ${account.accountNumber}`,
          type: 'utility'
        });
      }
    });

    // 2. Check Tenants (Exceeding end date by 1 day or status is Late Payment)
    tenants.forEach(tenant => {
      const endDate = new Date(tenant.leaseEnd);
      endDate.setHours(0, 0, 0, 0);

      const isExpired = today.getTime() > endDate.getTime();
      const isLateStatus = tenant.status === 'Late Payment';

      if (isExpired || isLateStatus) {
        list.push({
          id: `tenant-${tenant.id}`,
          msg: `${tenant.name} (${tenant.unit}) - ${isExpired ? 'Lease expired / Overdue' : 'Late payment detected'}`,
          type: 'tenant',
          targetId: tenant.id
        });
      }
    });

    return list;
  }, [expenses, tenants, utilityAccounts]);

  const notificationCount = notifications.length;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdateProfile({ name: tempName });
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col gap-6 pt-8 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            onClick={handleAvatarClick}
            className="relative group cursor-pointer transition-transform active:scale-95"
            title="Click to change avatar"
          >
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-11 ring-2 ring-slate-200 dark:ring-surface-dark shadow-sm overflow-hidden"
              style={{ backgroundImage: `url("${userProfile.avatar}")` }}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <span className="material-symbols-outlined text-white text-[18px]">photo_camera</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 size-3.5 bg-primary rounded-full border-2 border-background-light dark:border-background-dark shadow-sm"></div>
          </div>
          <div className="flex flex-col justify-center max-w-[140px]">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-tight">Welcome,</h2>
            {isEditingName ? (
              <input
                autoFocus
                className="text-lg font-extrabold leading-tight tracking-tight text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
            ) : (
              <h1
                onClick={() => { setTempName(userProfile.name); setIsEditingName(true); }}
                className="text-lg font-extrabold leading-tight tracking-tight text-primary truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 group"
              >
                {userProfile.name}
                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={() => supabase?.auth.signOut()}
            title="Sign Out"
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button
            onClick={() => setShowNotifications(true)}
            title={notificationCount > 0 ? `${notificationCount} issues requiring attention` : "No notifications"}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors relative active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-surface-dark animate-bounce">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 p-5 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] p-5 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[100px] text-primary">groups</span>
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Total Tenants
              </p>
              <div className="flex items-end gap-3 mt-2">
                <span className="text-4xl font-extrabold tracking-tight">{tenants.length}</span>
                <span className="inline-flex items-center text-xs font-bold text-[#111813] mb-1.5 px-2 py-1 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.3)]">
                  <span className="material-symbols-outlined text-[14px] mr-0.5 font-bold">arrow_upward</span>
                  4
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32 hover:border-slate-300 dark:hover:border-white/10 transition-colors cursor-pointer group">
            <div className="size-9 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px] filled">contract</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Active Leases</p>
              <p className="text-2xl font-bold tracking-tight">{tenants.filter(t => t.status === 'Active').length}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32 hover:border-slate-300 dark:hover:border-white/10 transition-colors cursor-pointer group">
            <div className="size-9 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 relative group-hover:bg-orange-500 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px] filled">meeting_room</span>
              <span className="absolute top-0 right-0 size-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-surface-dark group-hover:border-orange-500"></span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Vacant Rooms</p>
              <p className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">6</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Chart */}
      <section className="px-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monthly Revenue</p>
              <h3 className="text-3xl font-extrabold tracking-tight">$42,500</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-primary flex items-center bg-primary/10 px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                12%
              </span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">vs last month</p>
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13ec5b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  hide={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2e24', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#13ec5b' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#13ec5b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-5 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
          <button className="text-primary text-sm font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">See All</button>
        </div>
        <div className="flex flex-col gap-3">
          {RECENT_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-center gap-4 p-3 pr-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className={`size-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${activity.type === 'payment' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
                activity.type === 'lease' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                  'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                <span className="material-symbols-outlined text-[22px]">
                  {activity.type === 'payment' ? 'payments' : activity.type === 'lease' ? 'edit_document' : 'plumbing'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-sm font-bold truncate">{activity.title}</p>
                  {activity.amount && <span className="text-xs font-semibold text-green-600 dark:text-green-400">{activity.amount}</span>}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activity.details}</p>
                  <span className="text-[10px] font-medium text-slate-400">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowNotifications(false)}
          ></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-white/5 relative z-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                <h4 className="text-xl font-black tracking-tight">Alerts</h4>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.targetId) {
                        onSelectTenant(notif.targetId);
                        setShowNotifications(false);
                      }
                    }}
                    className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'tenant' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                      <span className="material-symbols-outlined">
                        {notif.type === 'tenant' ? 'person_alert' : 'warning'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {notif.msg}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        {notif.type === 'tenant' ? 'Tenant Issue' : 'Utility Overdue'}
                      </p>
                    </div>
                    {notif.type === 'tenant' && (
                      <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-sm self-center">
                        chevron_right
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-slate-600">check_circle</span>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-6 bg-primary/10 text-primary font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-primary hover:text-background-dark transition-all active:scale-95"
              >
                Dismiss All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowSettings(false)}
          ></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-white/5 relative z-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                <h4 className="text-xl font-black tracking-tight">Database Settings</h4>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Supabase URL</label>
                <input
                  type="text"
                  placeholder="https://xxx.supabase.co"
                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 transition-all outline-none"
                  value={dbConfig.url}
                  onChange={(e) => setDbConfig({ ...dbConfig, url: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Anon Key</label>
                <textarea
                  placeholder="eyJhbGci..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 transition-all outline-none resize-none"
                  value={dbConfig.key}
                  onChange={(e) => setDbConfig({ ...dbConfig, key: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => clearSupabaseConfig()}
                  className="flex-1 bg-red-500/10 text-red-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  Clear Hook
                </button>
                <button
                  onClick={() => updateSupabaseConfig(dbConfig.url, dbConfig.key)}
                  className="flex-[2] bg-primary text-background-dark font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save & Reload
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-500 mt-2 leading-relaxed">
                Settings are saved locally in your browser and never uploaded to public servers.
              </p>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-24 right-5 h-14 pl-5 pr-7 bg-primary text-[#111813] rounded-full shadow-[0_8px_30px_rgba(19,236,91,0.3)] hover:shadow-[0_10px_40px_rgba(19,236,91,0.5)] active:scale-95 hover:scale-105 transition-all duration-300 z-30 flex items-center gap-3 font-bold text-base group">
        <span className="material-symbols-outlined text-[26px] group-hover:rotate-90 transition-transform duration-300">add</span>
        Add Tenant
      </button>
    </div>
  );
};

export default Dashboard;
