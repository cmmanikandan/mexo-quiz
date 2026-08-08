import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Laptop, Key, Grid, Lock, HardDrive } from 'lucide-react';

export const AccountNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navItems = [
    { label: 'Overview', path: '/account', icon: User },
    { label: 'Personal Information', path: '/account/personal', icon: User },
    { label: 'Security & Password', path: '/account/security', icon: Shield },
    { label: 'Devices & Sessions', path: '/account/devices', icon: Laptop },
    { label: 'Recovery Options', path: '/account/recovery', icon: Key },
    { label: 'Connected Apps', path: '/account/apps', icon: Grid },
    { label: 'Privacy & Data', path: '/account/privacy', icon: Lock },
    { label: 'Data & Storage', path: '/account/storage', icon: HardDrive },
  ];

  return (
    <nav className="bg-white rounded-3xl border border-app-border p-3 space-y-1 shadow-mexo-sm select-none">
      <div className="px-3 py-2 text-[10px] font-extrabold text-app-muted uppercase tracking-wider">
        Manage Account
      </div>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          item.path === '/account'
            ? currentPath === '/account' || currentPath === '/account/'
            : currentPath.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-purple-50 text-[#7C3AED] font-bold border border-purple-100 shadow-2xs'
                : 'text-app-body hover:bg-slate-50 hover:text-app-heading'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-app-muted'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
