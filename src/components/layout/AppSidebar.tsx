import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  BookOpen,
  PlusCircle,
  Users,
  FileText,
  Radio,
  BarChart3,
  Trophy,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  User,
  HelpCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose, onOpenCreate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, isAdmin } = useAuth();

  const mainNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'My Library', path: '/library', icon: BookOpen },
    { label: 'Create', path: 'create', icon: PlusCircle, isCreate: true },
    { label: 'Classes', path: '/classes', icon: Users },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Live Sessions', path: '/sessions', icon: Radio },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Learning Progress', path: '/progress', icon: TrendingUp },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
    ...(isAdmin ? [{ label: 'Admin Console', path: '/admin', icon: Shield }] : []),
  ];

  const handleNav = (item: typeof mainNavItems[0]) => {
    if (item.isCreate) {
      onOpenCreate();
    } else {
      navigate(item.path);
    }
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-40 transition-transform duration-200 ease-in-out flex flex-col justify-between p-3 select-none ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-3 overflow-y-auto pr-1">
          {/* Prominent Create Action Banner */}
          <button
            onClick={() => {
              onOpenCreate();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <PlusCircle className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
            <span>+ Create Resource</span>
          </button>

          {/* Navigation items */}
          <nav className="space-y-0.5">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-50 text-[#7C3AED] font-bold border border-purple-100/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account / User Section Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <button
            onClick={() => {
              navigate('/account');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center space-x-3 p-2 rounded-2xl hover:bg-slate-100/80 transition-all text-left cursor-pointer"
          >
            <img
              src={profile?.avatar_url || user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={profile?.username || 'Profile'}
              className="w-8 h-8 rounded-full object-cover border border-purple-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User'}</p>
              <p className="text-[10px] text-slate-500 truncate">@{profile?.username || user?.email?.split('@')[0] || 'mexo'}</p>
            </div>
            <User className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
