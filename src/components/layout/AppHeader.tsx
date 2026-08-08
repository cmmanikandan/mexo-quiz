import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MexoAvatar } from '../common/MexoAvatar';
import { MexoAppsLauncher } from './MexoAppsLauncher';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { notificationService } from '../../services/notificationService';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Menu,
  Search,
  LogOut,
  Settings,
  User,
  Bell,
  PlusCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

interface AppHeaderProps {
  onHamburger: () => void;
  onOpenCreate?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onHamburger, onOpenCreate }) => {
  const { profile, signOut, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [notifications] = useState(() => notificationService.getNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.user_metadata?.full_name || user?.email || 'MEXO User';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-40 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onHamburger}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
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

        {/* Notifications Button — Direct Navigation to Notifications Page */}
        <button
          id="notifications-button"
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Open Notifications Page"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        <MexoAppsLauncher />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              id="profile-menu"
              className="flex items-center justify-center p-0.5 rounded-full border-2 border-transparent hover:border-[#7C3AED] transition-all focus:outline-hidden cursor-pointer"
            >
              <MexoAvatar
                name={displayName}
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                size="sm"
              />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
              align="end"
              sideOffset={8}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-extrabold text-xs text-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
              </div>

              <DropdownMenu.Item
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors cursor-pointer outline-hidden"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors cursor-pointer outline-hidden"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenu.Item>

              {isAdmin && (
                <DropdownMenu.Item
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer outline-hidden"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Admin Console</span>
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

              <DropdownMenu.Item
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer outline-hidden"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};
