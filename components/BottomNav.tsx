
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'properties', label: 'Properties', icon: 'apartment' },
    { id: 'tenants', label: 'Tenants', icon: 'group' },
    { id: 'finance', label: 'Finance', icon: 'account_balance_wallet' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
      <div className="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/5 pb-8 pt-3 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 group ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <span className={`material-symbols-outlined text-[26px] ${isActive ? 'filled' : ''} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(19,236,91,0.6)]"></span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
