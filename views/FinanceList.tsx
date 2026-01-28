
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, UtilityAccount, UtilityType, Property } from '../types';

interface FinanceListProps {
  expenses: Expense[];
  properties: Property[];
  utilityAccounts: UtilityAccount[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onAddUtility: (utility: UtilityAccount) => void;
  onUpdateUtility: (utility: UtilityAccount) => void;
  onDeleteUtility: (id: string) => void;
}

const FinanceList: React.FC<FinanceListProps> = ({
  expenses,
  properties,
  utilityAccounts,
  onAddExpense,
  onDeleteExpense,
  onAddUtility,
  onUpdateUtility,
  onDeleteUtility
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Utility Accounts'>('Overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUtilityForm, setShowUtilityForm] = useState(false);
  const [editingUtilityId, setEditingUtilityId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [newExpense, setNewExpense] = useState<{
    title: string;
    amount: string;
    date: string;
    category: ExpenseCategory;
    type: 'Income' | 'Expense';
    utilityAccountId: string;
    propertyId: string;
    photos: string[];
  }>({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Maintenance',
    type: 'Expense',
    utilityAccountId: '',
    propertyId: properties[0]?.id || '',
    photos: []
  });

  const [utilityFormData, setUtilityFormData] = useState<{
    type: UtilityType;
    accountNumber: string;
    provider: string;
    propertyId: string;
  }>({
    type: 'Electricity',
    accountNumber: '',
    provider: '',
    propertyId: properties[0]?.id || ''
  });

  const monthOptions = useMemo(() => {
    const options = [];
    const startYear = 2024;
    const startMonth = 0;
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    let current = new Date(startDate);
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const val = `${year}-${month}`;
      const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ val, label });
      current.setMonth(current.getMonth() + 1);
    }
    return options.reverse();
  }, []);

  const filteredData = useMemo(() => {
    // Robust month filtering using string comparison to avoid timezone shifts
    const filteredExpenses = expenses.filter(exp => {
      return exp.date.substring(0, 7) === selectedMonth;
    });

    const totalIncome = filteredExpenses.filter(e => e.type === 'Income').reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = filteredExpenses.filter(e => e.type === 'Expense').reduce((sum, exp) => sum + exp.amount, 0);

    return {
      expenses: filteredExpenses,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    };
  }, [selectedMonth, expenses]);

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;

    const parsedAmount = parseFloat(newExpense.amount);
    if (isNaN(parsedAmount)) return;

    // Start with a temporary object (API will provide real ID)
    const expenseData: Omit<Expense, 'id'> = {
      title: newExpense.title,
      amount: parsedAmount,
      date: newExpense.date,
      category: newExpense.category,
      type: newExpense.type,
      utilityAccountId: newExpense.category === 'Utilities' ? newExpense.utilityAccountId : undefined,
      propertyId: newExpense.propertyId,
      photos: newExpense.photos
    };

    // onAddExpense is now expected to handle the API call and state update
    // If it's the hook version, it might return the new item
    const createdItem = await (onAddExpense as any)(expenseData);

    // Automatically switch view to the month of the added record
    const recordMonth = newExpense.date.substring(0, 7);
    setSelectedMonth(recordMonth);

    // Reset form
    setNewExpense({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Maintenance',
      type: 'Expense',
      utilityAccountId: '',
      propertyId: properties[0]?.id || '',
      photos: []
    });
    setShowAddForm(false);
  };

  const handleSaveUtility = async () => {
    if (!utilityFormData.accountNumber || !utilityFormData.provider) return;

    if (editingUtilityId) {
      onUpdateUtility({
        id: editingUtilityId,
        ...utilityFormData
      });
    } else {
      // onAddUtility handles API and state
      await (onAddUtility as any)(utilityFormData);
    }

    setUtilityFormData({
      type: 'Electricity',
      accountNumber: '',
      provider: '',
      propertyId: properties[0]?.id || ''
    });
    setEditingUtilityId(null);
    setShowUtilityForm(false);
  };

  const startEditUtility = (account: UtilityAccount) => {
    setEditingUtilityId(account.id);
    setUtilityFormData({
      type: account.type,
      accountNumber: account.accountNumber,
      provider: account.provider,
      propertyId: account.propertyId
    });
    setShowUtilityForm(true);
  };

  const getUtilityStatus = (accountId: string) => {
    const accountExpenses = expenses.filter(e => e.utilityAccountId === accountId);
    const latestPayment = accountExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (!latestPayment) return { isPaid: false, lastDate: 'Never Paid' };

    const lastDateObj = new Date(latestPayment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDateObj.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
    return { isPaid: diffDays <= 30, lastDate: latestPayment.date };
  };

  const getExpenseIcon = (expense: Expense) => {
    if (expense.type === 'Income') return { icon: 'trending_up', color: 'bg-green-500/10 text-green-500' };
    if (expense.category === 'Maintenance') return { icon: 'build', color: 'bg-red-500/10 text-red-500' };
    if (expense.category === 'Cleaning') return { icon: 'cleaning_services', color: 'bg-blue-500/10 text-blue-500' };

    if (expense.category === 'Utilities' && expense.utilityAccountId) {
      const account = utilityAccounts.find(a => a.id === expense.utilityAccountId);
      if (account) {
        switch (account.type) {
          case 'Electricity': return { icon: 'bolt', color: 'bg-yellow-500/10 text-yellow-500' };
          case 'Water': return { icon: 'water_drop', color: 'bg-cyan-500/10 text-cyan-500' };
          case 'Internet': return { icon: 'wifi', color: 'bg-indigo-500/10 text-indigo-500' };
        }
      }
      return { icon: 'bolt', color: 'bg-yellow-500/10 text-yellow-500' };
    }

    return { icon: 'receipt_long', color: 'bg-slate-500/10 text-slate-500' };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 pt-12 pb-4 flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Finance</h1>
        <div className="flex p-1 bg-slate-100 dark:bg-surface-dark rounded-2xl w-full">
          {['Overview', 'Utility Accounts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab
                ? 'bg-white dark:bg-background-dark text-primary shadow-sm'
                : 'text-slate-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative inline-block w-fit">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-surface-dark border-none rounded-full px-4 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary pr-8 cursor-pointer uppercase tracking-wider"
          >
            {monthOptions.map(opt => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-primary">expand_more</span>
        </div>
      </header>

      {activeTab === 'Overview' ? (
        <>
          <section className="px-5 mb-6">
            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-primary/20 to-transparent">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Net Balance • {monthOptions.find(o => o.val === selectedMonth)?.label}
                </p>
                <h2 className={`text-4xl font-black tracking-tight ${filteredData.netBalance >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  ${filteredData.netBalance.toLocaleString()}
                </h2>
              </div>
              <div className="flex border-t border-slate-100 dark:border-white/5 divide-x divide-slate-100 dark:divide-white/5">
                <div className="flex-1 p-5 bg-slate-50/30 dark:bg-white/5">
                  <div className="flex items-center gap-1.5 text-green-500 mb-1.5">
                    <span className="material-symbols-outlined text-[18px] filled">trending_up</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">Income</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${filteredData.totalIncome.toLocaleString()}</p>
                </div>
                <div className="flex-1 p-5 bg-slate-50/30 dark:bg-white/5">
                  <div className="flex items-center gap-1.5 text-red-500 mb-1.5">
                    <span className="material-symbols-outlined text-[18px] filled">trending_down</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">Expense</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${filteredData.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 pb-24 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-400">Finance Records</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-1.5 bg-primary/10 px-4 py-2.5 rounded-2xl active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                Add Entry
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {filteredData.expenses.map(expense => {
                const { icon, color } = getExpenseIcon(expense);
                return (
                  <div key={expense.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm group">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                          <span className="material-symbols-outlined text-[24px]">
                            {icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">{expense.title}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{expense.category}</span>
                            <span className="size-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                            <span className="text-[10px] text-slate-400 font-bold">{expense.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`font-black text-sm ${expense.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                          {expense.type === 'Income' ? '+' : '-'}${expense.amount.toLocaleString()}
                        </span>
                        <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredData.expenses.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4 bg-slate-100/30 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                  <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
                  <p className="text-sm font-bold text-slate-500">No records found for this month</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="px-5 pb-24 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-400">Utility Accounts</h3>
            <button
              onClick={() => {
                setEditingUtilityId(null);
                setUtilityFormData({ type: 'Electricity', accountNumber: '', provider: '', propertyId: properties[0]?.id || '' });
                setShowUtilityForm(true);
              }}
              className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-1.5 bg-primary/10 px-4 py-2.5 rounded-2xl active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              New Account
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {utilityAccounts.map(account => {
              const property = properties.find(p => p.id === account.propertyId);
              const status = getUtilityStatus(account.id);
              return (
                <div key={account.id} className="bg-white dark:bg-surface-dark p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${account.type === 'Electricity' ? 'bg-yellow-500/10 text-yellow-500' :
                        account.type === 'Water' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                        <span className="material-symbols-outlined text-[30px] filled">
                          {account.type === 'Electricity' ? 'bolt' : account.type === 'Water' ? 'water_drop' : 'wifi'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{property?.name || 'External'}</p>
                        <h5 className="font-extrabold text-base text-slate-900 dark:text-white">{account.type}</h5>
                        <p className="text-sm font-black text-slate-400 mt-0.5 tracking-tight">{account.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${status.isPaid ? 'bg-green-100 text-green-700 dark:bg-primary/20 dark:text-primary' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 animate-pulse'
                        }`}>
                        {status.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEditUtility(account)} className="text-slate-300 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => onDeleteUtility(account.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Payment</span>
                      <span className={`text-xs font-black mt-0.5 ${!status.isPaid ? 'text-red-500 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                        {status.lastDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Provider</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{account.provider}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-background-dark/80 backdrop-blur-md">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black tracking-tight">Add Record</h4>
              <button onClick={() => setShowAddForm(false)} className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-background-dark rounded-2xl">
                {(['Expense', 'Income'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewExpense({ ...newExpense, type: t, category: t === 'Income' ? 'Other' : newExpense.category })}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${newExpense.type === t
                      ? (t === 'Expense' ? 'bg-white dark:bg-surface-dark text-red-500 shadow-sm' : 'bg-white dark:bg-surface-dark text-green-500 shadow-sm')
                      : 'text-slate-400'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={newExpense.category === 'Other' ? "Description (e.g. Extra Rent, Bonus)" : "Title (e.g. Roof Repair)"}
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                value={newExpense.title}
                onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
              />
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                value={newExpense.date}
                onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-primary shadow-inner"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <select
                  className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner appearance-none"
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  disabled={newExpense.type === 'Income'}
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <select
                className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner appearance-none"
                value={newExpense.propertyId}
                onChange={e => setNewExpense({ ...newExpense, propertyId: e.target.value })}
              >
                <option value="">Select Property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {newExpense.category === 'Utilities' && (
                <select
                  className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm font-bold"
                  value={newExpense.utilityAccountId}
                  onChange={e => {
                    const acc = utilityAccounts.find(a => a.id === e.target.value);
                    setNewExpense({ ...newExpense, utilityAccountId: e.target.value, title: acc ? `${acc.type} Payment` : newExpense.title });
                  }}
                >
                  <option value="">Select Account...</option>
                  {utilityAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.type} ({a.accountNumber})</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleAddExpense}
                className="w-full bg-primary text-background-dark font-black py-4.5 rounded-[24px] uppercase active:scale-95 transition-transform"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtilityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-background-dark/80 backdrop-blur-md">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-white/5 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black tracking-tight">{editingUtilityId ? 'Edit Account' : 'New Account'}</h4>
              <button onClick={() => { setShowUtilityForm(false); setEditingUtilityId(null); }} className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <select
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold"
                value={utilityFormData.propertyId}
                onChange={e => setUtilityFormData({ ...utilityFormData, propertyId: e.target.value })}
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold"
                value={utilityFormData.type}
                onChange={e => setUtilityFormData({ ...utilityFormData, type: e.target.value as UtilityType })}
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
                <option value="Internet">Internet</option>
              </select>
              <input
                type="text"
                placeholder="Account Number"
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold"
                value={utilityFormData.accountNumber}
                onChange={e => setUtilityFormData({ ...utilityFormData, accountNumber: e.target.value })}
              />
              <input
                type="text"
                placeholder="Provider Name"
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-bold"
                value={utilityFormData.provider}
                onChange={e => setUtilityFormData({ ...utilityFormData, provider: e.target.value })}
              />
              <button
                onClick={handleSaveUtility}
                className="w-full bg-primary text-background-dark font-black py-4.5 rounded-[24px] uppercase"
              >
                {editingUtilityId ? 'Update Account' : 'Link Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceList;
