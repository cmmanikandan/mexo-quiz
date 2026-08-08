import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MexoAvatar } from '../common/MexoAvatar';
import { MexoAppsLauncher } from './MexoAppsLauncher';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { notificationService } from '../../services/notificationService';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Menu, Search, LogOut, Settings, User, Bell, PlusCircle, Plus, Sparkles
} from 'lucide-react';

interface AppHeaderProps {
  onHamburger: () => void;
  onOpenCreate?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onHamburger, onOpenCreate }) => {
  const { profile, signOut, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.user_metadata?.full_name || user?.email || 'MEXO User';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onHamburger}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="MEXO" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center">
            MEXO<span className="text-[#7C3AED] ml-1">Quiz</span>
          </span>
        </a>
      </div>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search quizzes, lessons, classes, public resources..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-2xl bg-slate-100/80 border border-transparent focus:border-[#7C3AED] focus:bg-white text-slate-900 transition-all outline-hidden"
          />
        </div>
      </form>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="px-3.5 py-1.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              id="notifications-button"
              className="relative p-2 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
              align="end"
              sideOffset={8}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-[10px] font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  View All ({notifications.length}) →
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                        n.read ? 'bg-white' : 'bg-purple-50/60 font-semibold'
                      }`}
                    >
                      <p className="text-slate-900 font-bold">{n.title}</p>
                      <p className="text-slate-500 text-[11px]">{n.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <MexoAppsLauncher />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              id="profile-menu"
              className="flex items-center justify-center p-0.5 rounded-full border-2 border-transparent hover:border-[#7C3AED] transition-all focus:outline-hidden cursor-pointer"
              aria-label="Profile menu"
            >
              <MexoAvatar name={displayName} src={profile?.avatar_url || user?.user_metadata?.avatar_url} size="sm" className="w-8 h-8 text-xs font-bold" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
              align="end"
              sideOffset={8}
            >
              <div className="flex flex-col items-center text-center px-5 py-5 border-b border-slate-100 bg-slate-50/50">
                <MexoAvatar name={displayName} src={profile?.avatar_url || user?.user_metadata?.avatar_url} size="lg" className="w-14 h-14 text-xl mb-3 border-2 border-white shadow-md" />
                <p className="font-bold text-sm text-slate-900">{displayName}</p>
                <p className="text-xs text-[#7C3AED] font-mono font-semibold mt-0.5 truncate max-w-full">{profile?.primary_address || user?.email}</p>
                <div className="mt-2 flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-extrabold uppercase">
                    Level {profile?.level || 5} Scholar
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                    🔥 {profile?.streak || 7}d Streak
                  </span>
                </div>
                <button
                  onClick={() => navigate('/account')}
                  className="mt-3 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Manage MEXO Account
                </button>
              </div>

              <div className="p-2 space-y-0.5">
                <DropdownMenu.Item
                  onClick={() => navigate('/account')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer outline-hidden"
                >
                  <User className="w-4 h-4 mr-2.5 text-[#7C3AED]" />
                  MEXO Account & Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => navigate('/settings')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer outline-hidden"
                >
                  <Settings className="w-4 h-4 mr-2.5 text-slate-500" />
                  Preferences & Settings
                </DropdownMenu.Item>
                {isAdmin && (
                  <DropdownMenu.Item
                    onClick={() => navigate('/admin')}
                    className="flex items-center px-3 py-2.5 text-xs font-extrabold text-emerald-700 bg-emerald-50/50 rounded-xl hover:bg-emerald-100/70 cursor-pointer outline-hidden"
                  >
                    <Sparkles className="w-4 h-4 mr-2.5 text-emerald-600" />
                    Admin Console (Super User)
                  </DropdownMenu.Item>
                )}
              </div>

              <div className="border-t border-slate-100 p-2">
                <DropdownMenu.Item
                  onClick={async () => { await signOut(); navigate('/signin'); }}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer outline-hidden"
                >
                  <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                  Sign out of MEXO
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

