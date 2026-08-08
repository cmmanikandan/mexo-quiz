import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  PlusCircle,
  Activity,
  User,
  MoreHorizontal,
  BookOpen,
  Users,
  Radio,
  BarChart3,
  Calendar,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenCreate?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCreate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Create', path: 'create', icon: PlusCircle, isCreate: true },
    { label: 'Activity', path: '/assignments', icon: Activity },
    { label: 'Profile', path: '/account', icon: User },
  ];

  const overflowItems = [
    { label: 'My Library', path: '/library', icon: BookOpen },
    { label: 'Classes', path: '/classes', icon: Users },
    { label: 'Live Sessions', path: '/sessions', icon: Radio },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30 flex items-center justify-around lg:hidden shadow-lg select-none">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 -mt-4 border-2 border-white">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold mt-0.5">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#7C3AED] font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      {/* Overflow More Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">MEXO Navigation</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {overflowItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setShowMoreMenu(false);
                      navigate(item.path);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] flex items-center space-x-3 text-xs font-bold transition-all text-left"
                  >
                    <Icon className="w-4 h-4 text-[#7C3AED]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
