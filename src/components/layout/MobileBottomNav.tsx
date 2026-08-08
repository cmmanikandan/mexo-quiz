import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Activity, User } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenCreate?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCreate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Create', path: 'create', icon: Plus, isCreate: true },
    { label: 'Activity', path: '/activity', icon: Activity },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/90 z-30 flex items-center justify-around lg:hidden shadow-lg select-none">
      {mainTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        if (tab.isCreate) {
          return (
            <button
              key={tab.label}
              onClick={() => onOpenCreate && onOpenCreate()}
              className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-[#7C3AED]"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 -mt-4 border-2 border-white transform hover:scale-105 active:scale-95 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-extrabold mt-0.5 text-[#7C3AED]">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all cursor-pointer ${
              isActive ? 'text-[#7C3AED] font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#7C3AED]' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
