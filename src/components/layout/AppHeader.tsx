import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { MexoAvatar } from '../common/MexoAvatar';
import { MexoAppsLauncher } from './MexoAppsLauncher';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { notificationService } from '../../services/notificationService';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Menu, Search, LogOut, Settings, User, Bell, ChevronDown, GraduationCap, School, ShieldCheck, Zap, Plus
} from 'lucide-react';

interface AppHeaderProps {
  onHamburger: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onHamburger }) => {
  const { profile, signOut } = useAuth();
  const { activeRole, switchRole } = useRole();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'MEXO User';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/library?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const roleMetaMap: Record<string, { label: string; icon: string; color: string }> = {
    student: { label: 'Student Mode', icon: '🎓', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    teacher: { label: 'Teacher Mode', icon: '👨‍🏫', color: 'bg-purple-50 text-[#7C3AED] border-purple-200' },
    admin: { label: 'Admin Mode', icon: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  };

  const roleMeta = roleMetaMap[activeRole] || roleMetaMap['student'];

  return (
    <header className="h-16 border-b border-app-border bg-white px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 shadow-mexo-sm select-none">
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <button
          id="hamburger-menu"
          onClick={onHamburger}
          className="p-2 rounded-xl text-app-body hover:bg-slate-100 transition-colors"
          title="Toggle menu"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 cursor-pointer select-none"
          role="link"
          tabIndex={0}
        >
          <img src="/logo.png" alt="MEXO Quiz" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center leading-none">
              MEXO <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] bg-clip-text text-transparent font-extrabold ml-1">Quiz</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider hidden sm:block">Learn. Play. Compete.</span>
          </div>
        </div>

        {/* Workspace Role Switcher Pills */}
        <div className="hidden lg:flex items-center ml-4 pl-3 border-l border-slate-200">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs hover:opacity-90 transition-all cursor-pointer ${roleMeta.color}`}
              >
                <span>{roleMeta.icon}</span>
                <span>{roleMeta.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="w-56 bg-white rounded-2xl shadow-mexo-popover border border-app-border z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150"
                align="start"
                sideOffset={6}
              >
                <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Switch Workspace Role
                </div>
                <DropdownMenu.Item
                  onClick={() => switchRole('student')}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">🎓</span>
                    <span>Student Dashboard</span>
                  </span>
                  {activeRole === 'student' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchRole('teacher')}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">👨‍🏫</span>
                    <span>Teacher Dashboard</span>
                  </span>
                  {activeRole === 'teacher' && <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchRole('admin')}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">⚡</span>
                    <span>Admin Dashboard</span>
                  </span>
                  {activeRole === 'admin' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:block flex-1 max-w-md px-4">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-app-muted pointer-events-none" />
          <input
            id="quiz-search-header"
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search quizzes, subjects, teachers..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#EEF3F9] text-xs text-app-heading placeholder-app-muted border border-transparent focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: Quick Create (for Teachers), Notifications, Apps Launcher, Avatar */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {activeRole === 'teacher' && (
          <button
            onClick={() => navigate('/builder/new')}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#0878E8] text-white text-xs font-extrabold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        )}

        {/* Notifications Popover */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-80 bg-white rounded-2xl shadow-mexo-popover border border-app-border z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
              align="end"
              sideOffset={8}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifications(notificationService.markAllAsRead())}
                    className="text-[10px] font-bold text-[#7C3AED] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-1 my-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        notificationService.markAsRead(n.id);
                        setNotifications(notificationService.getNotifications());
                        if (n.link) navigate(n.link);
                      }}
                      className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                        n.read ? 'bg-white border-slate-100 text-slate-600' : 'bg-purple-50/60 border-purple-100 text-slate-900 font-semibold'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="hidden sm:block">
          <PWAInstallButton variant="ghost" size="sm" />
        </div>

        <MexoAppsLauncher />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              id="profile-menu"
              className="flex items-center justify-center p-0.5 rounded-full border-2 border-transparent hover:border-[#7C3AED] transition-all focus:outline-none cursor-pointer"
              aria-label="Profile menu"
            >
              <MexoAvatar name={displayName} src={profile?.avatar_url} size="sm" className="w-8 h-8 text-xs font-bold" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-72 bg-white rounded-2xl shadow-mexo-popover border border-app-border z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
              align="end"
              sideOffset={8}
            >
              <div className="flex flex-col items-center text-center px-5 py-5 border-b border-app-border bg-slate-50/50">
                <MexoAvatar name={displayName} src={profile?.avatar_url} size="lg" className="w-14 h-14 text-xl mb-3 border-2 border-white shadow-mexo-md" />
                <p className="font-bold text-sm text-app-heading">{displayName}</p>
                <p className="text-xs text-[#7C3AED] font-mono font-semibold mt-0.5 truncate max-w-full">{profile?.primary_address}</p>
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
                  className="mt-3 px-4 py-1.5 rounded-full border border-app-border text-xs font-semibold text-app-heading hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  Manage MEXO Account
                </button>
              </div>

              <div className="p-2 space-y-0.5">
                <DropdownMenu.Item
                  onClick={() => navigate('/account')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-app-body rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <User className="w-4 h-4 mr-2.5 text-[#7C3AED]" />
                  MEXO Account
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchRole('student')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-app-body rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="w-4 h-4 mr-2.5 text-center text-sm">🎓</span>
                  Switch to Student Mode
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchRole('teacher')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-app-body rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="w-4 h-4 mr-2.5 text-center text-sm">👨‍🏫</span>
                  Switch to Teacher Mode
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchRole('admin')}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-app-body rounded-xl hover:bg-slate-100 cursor-pointer outline-none"
                >
                  <span className="w-4 h-4 mr-2.5 text-center text-sm">⚡</span>
                  Switch to Admin Mode
                </DropdownMenu.Item>
              </div>

              <div className="border-t border-app-border p-2">
                <DropdownMenu.Item
                  onClick={async () => { await signOut(); navigate('/signin'); }}
                  className="flex items-center px-3 py-2.5 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer outline-none"
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
