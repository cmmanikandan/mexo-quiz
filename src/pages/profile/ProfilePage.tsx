import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  User,
  ShieldCheck,
  Award,
  Trophy,
  Settings,
  Layers,
  CheckCircle2,
  BookOpen,
  Edit,
  Mail,
  Target,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  useDocumentTitle('My Profile & Statistics — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const currentUserId = profile?.id || user?.id || '';
  const [attempts, setAttempts] = useState<any[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (currentUserId) {
      attemptService.fetchAttemptsFromSupabase(currentUserId).then(att => setAttempts(att));
      quizService.fetchQuizzesFromSupabase().then(qz => {
        setCreatedQuizzes(qz.filter(q => q.creator_id === currentUserId));
      });
    }
  }, [currentUserId]);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MANIKANDAN PRABHU C';

  const mexoId = profile?.username || '927624bit060';
  const email = profile?.primary_address || user?.email || 'user@mexo.com';

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, c) => a + (c.percentage || 0), 0) / attempts.length)
    : 0;

  const currentStreak = profile?.streak || (attempts.length > 0 ? 1 : 0);
  const totalXp = profile?.xp || attempts.reduce((a, c) => a + (c.xp_earned || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
          <MexoAvatar
            name={displayName}
            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
            size="lg"
            className="w-20 h-20 text-2xl font-bold border-4 border-white/40 shadow-xl shrink-0"
          />

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">{displayName}</h1>
            <p className="text-xs text-purple-200 font-mono font-bold">@{mexoId}</p>
            <p className="text-xs text-purple-100 flex items-center justify-center md:justify-start space-x-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/account')}
          className="px-5 py-2.5 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Statistics Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Quizzes Created</p>
              <p className="text-xl font-black text-slate-900">{createdQuizzes.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Quizzes Taken</p>
              <p className="text-xl font-black text-slate-900">{attempts.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Total Attempts</p>
              <p className="text-xl font-black text-slate-900">{attempts.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Average Score</p>
              <p className="text-xl font-black text-slate-900">{avgScore}%</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">XP</p>
              <p className="text-xl font-black text-slate-900">{totalXp}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Current Streak</p>
              <p className="text-xl font-black text-slate-900">{currentStreak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Shortcut */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-extrabold text-slate-900">Personal Information & Security</h3>
          <p className="text-xs text-slate-500">Update password, change email, or manage session preferences.</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>
    </div>
  );
};
