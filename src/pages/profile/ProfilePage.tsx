import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  User,
  ShieldCheck,
  Flame,
  Award,
  Trophy,
  Settings,
  ExternalLink,
  Layers,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  useDocumentTitle('User Profile & Capabilities — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const { currentMode, toggleRoleMode } = useRole();

  const currentUserId = profile?.id || user?.id || '';
  const attempts = attemptService.getUserAttempts(currentUserId);
  const createdQuizzes = quizService.getAllQuizzes().filter(q => q.creator_id === currentUserId);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MEXO Scholar';

  const mexoId = profile?.username || user?.email?.split('@')[0] || '927624bit060';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Profile Header Identity Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
          <MexoAvatar
            name={displayName}
            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
            size="lg"
            className="w-20 h-20 text-2xl font-bold border-4 border-white/40 shadow-xl shrink-0"
          />

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{displayName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold text-[10px] uppercase">
                Active
              </span>
            </div>

            <p className="text-xs text-purple-200 font-mono font-bold">MEXO ID: @{mexoId}</p>
            <p className="text-xs text-purple-100">{profile?.primary_address || user?.email}</p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Student & Teacher Enabled</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40 text-[11px] font-bold">
                🔥 {profile?.streak || (attempts.length > 0 ? 1 : 0)} Day Streak
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-center space-y-2 shrink-0">
          <p className="text-[11px] font-extrabold uppercase text-purple-200 tracking-wider">Current Account Mode</p>
          <p className="text-lg font-black capitalize text-yellow-300">{currentMode} Mode</p>

          <button
            onClick={toggleRoleMode}
            className="w-full px-4 py-2 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to {currentMode === 'student' ? 'Teacher' : 'Student'}</span>
          </button>
        </div>
      </div>

      {/* Account KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Total XP</p>
            <p className="text-lg font-black text-slate-900">{profile?.xp || (attempts.length * 50)} XP</p>
            <span className="text-[10px] text-[#7C3AED] font-bold">Level {profile?.level || 1}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Completed Quizzes</p>
            <p className="text-lg font-black text-slate-900">{attempts.length} Submissions</p>
            <span className="text-[10px] text-emerald-600 font-bold">Real Attempts</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Created Resources</p>
            <p className="text-lg font-black text-slate-900">{createdQuizzes.length} Items</p>
            <span className="text-[10px] text-blue-600 font-bold">Quizzes & Lessons</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Certificates</p>
            <p className="text-lg font-black text-slate-900">
              {attempts.filter(a => a.certificate_url).length} Verified
            </p>
            <span className="text-[10px] text-amber-600 font-bold">Earned Badges</span>
          </div>
        </div>
      </div>

      {/* Account Settings Options */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900">Account Management</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/account')}
            className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-[#7C3AED]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED]">MEXO Account Hub</h4>
                <p className="text-[11px] text-slate-500">Manage security, password, recovery & connected apps</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED]" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED]">Quiz Preferences</h4>
                <p className="text-[11px] text-slate-500">App notifications, sound, theme & defaults</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED]" />
          </button>
        </div>
      </div>
    </div>
  );
};
