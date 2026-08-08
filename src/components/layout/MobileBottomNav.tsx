import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { Home, BookOpen, Trophy, PlusCircle, Layers, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole } = useRole();

  const studentTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Library', path: '/library', icon: BookOpen },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Account', path: '/account', icon: User },
  ];

  const teacherTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'My Quizzes', path: '/teacher/quizzes', icon: Layers },
    { label: 'Create', path: '/builder/new', icon: PlusCircle },
    { label: 'Account', path: '/account', icon: User },
  ];

  const tabs = activeRole === 'teacher' ? teacherTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30 flex items-center justify-around lg:hidden shadow-lg select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors cursor-pointer ${
              isActive ? 'text-[#7C3AED] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
