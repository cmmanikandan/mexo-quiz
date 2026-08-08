import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import {
  Home, BookOpen, FileText, Award, Trophy, User, PlusCircle, Users, Database, BarChart3, Settings, ShieldCheck, Flame, Layers, Clock, HelpCircle, CheckSquare
} from 'lucide-react';

export const AppSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole, switchRole } = useRole();

  const studentLinks = [
    { label: 'Dashboard Home', path: '/', icon: Home },
    { label: 'Quiz Library', path: '/library', icon: BookOpen },
    { label: 'Assignments', path: '/student/assignments', icon: FileText },
    { label: 'Practice Mode', path: '/student/practice', icon: CheckSquare },
    { label: 'Quiz History', path: '/student/history', icon: Clock },
    { label: 'Certificates', path: '/student/certificates', icon: Award },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Achievements & XP', path: '/student/achievements', icon: Flame },
    { label: 'Manage Account', path: '/account', icon: User },
  ];

  const teacherLinks = [
    { label: 'Teacher Overview', path: '/', icon: Home },
    { label: 'My Quizzes', path: '/teacher/quizzes', icon: Layers },
    { label: 'Create New Quiz', path: '/builder/new', icon: PlusCircle },
    { label: 'Homework Assignments', path: '/teacher/assignments', icon: FileText },
    { label: 'Classrooms', path: '/teacher/classes', icon: Users },
    { label: 'Question Bank', path: '/teacher/question-bank', icon: Database },
    { label: 'Analytics & Reports', path: '/teacher/analytics', icon: BarChart3 },
    { label: 'Manage Account', path: '/account', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Overview', path: '/', icon: ShieldCheck },
    { label: 'User Accounts & Roles', path: '/admin/users', icon: Users },
    { label: 'Quiz System Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Categories & Tags', path: '/admin/categories', icon: Layers },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
    { label: 'Manage Account', path: '/account', icon: User },
  ];

  const currentLinks =
    activeRole === 'teacher' ? teacherLinks : activeRole === 'admin' ? adminLinks : studentLinks;

  const handleNav = (path: string) => {
    navigate(path);
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
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-app-border z-40 transition-transform duration-200 ease-in-out flex flex-col justify-between p-3 select-none ${
          isOpen ? 'translate-x-0 shadow-mexo-lg' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Active Workspace Banner */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {activeRole === 'teacher' ? '👨‍🏫' : activeRole === 'admin' ? '⚡' : '🎓'}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 capitalize">{activeRole} Workspace</p>
                <p className="text-[10px] text-slate-500">Tap to switch role</p>
              </div>
            </div>
            <button
              onClick={() => {
                const nextRole = activeRole === 'student' ? 'teacher' : activeRole === 'teacher' ? 'admin' : 'student';
                switchRole(nextRole);
              }}
              className="text-[10px] font-bold text-[#7C3AED] hover:underline"
            >
              Switch
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {currentLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-50 text-[#7C3AED] font-bold border border-purple-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 rounded-2xl bg-[#EEF5FF] border border-blue-100 space-y-1">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="MEXO Quiz" className="w-5 h-5 object-contain" />
            <span className="text-xs font-extrabold text-slate-900">MEXO Ecosystem</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-normal">
            Unified authentication, shared Supabase backend, single account.
          </p>
        </div>
      </aside>
    </>
  );
};
