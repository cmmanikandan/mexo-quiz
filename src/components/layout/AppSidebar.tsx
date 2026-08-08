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
  Shield,
  ExternalLink,
  X,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MexoAvatar } from '../common/MexoAvatar';

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
    { label: 'Live Sessions', path: '/sessions', icon: Radio },
    { label: 'Learning Progress', path: '/progress', icon: TrendingUp },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MEXO User';

  const mexoId = profile?.username || user?.email?.split('@')[0] || '927624bit060';

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
      {/* Dark Blurred Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-[82vw] max-w-xs sm:w-72 lg:w-64 lg:top-16 bg-white border-r border-slate-200/90 z-50 lg:z-30 transition-transform duration-200 ease-in-out flex flex-col justify-between p-3.5 select-none ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Mobile Top Sidebar Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 lg:hidden pt-2 px-1">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="MEXO" className="w-7 h-7 object-contain" />
              <span className="text-base font-black text-slate-900 tracking-tight">
                MEXO <span className="text-[#7C3AED]">Quiz</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onOpenCreate();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-yellow-300 stroke-[3] group-hover:scale-110 transition-transform" />
            <span>+ Create Resource</span>
          </button>

          {/* Navigation links */}
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
                      ? 'bg-purple-50 text-[#7C3AED] font-extrabold border border-purple-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* MEXO Ecosystem Apps Section */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">MEXO Apps</p>
            <a
              href="https://mexo-mail.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors"
            >
              <span>MEXO Mail</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="https://mexo-forms.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors"
            >
              <span>MEXO Forms</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Bottom Section: Account, Settings & User Profile Card */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="space-y-0.5">
            <button
              onClick={() => {
                navigate('/account');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#7C3AED]" />
              <span>MEXO Account</span>
            </button>

            <button
              onClick={() => {
                navigate('/settings');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Admin Console</span>
              </button>
            )}
          </div>

          {/* User Profile Card at Bottom */}
          <div
            onClick={() => {
              navigate('/account');
              if (window.innerWidth < 1024) onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-all cursor-pointer flex items-center space-x-3"
          >
            <MexoAvatar
              name={displayName}
              src={profile?.avatar_url || user?.user_metadata?.avatar_url}
              size="sm"
              className="w-9 h-9 text-xs font-bold border border-purple-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate uppercase tracking-tight">{displayName}</p>
              <p className="text-[10px] text-purple-600 font-mono font-bold truncate">@{mexoId}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
