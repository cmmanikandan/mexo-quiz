import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { classService } from '../../services/classService';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { MexoButton } from '../../components/common/MexoButton';
import { JoinLiveQuizModal } from '../../components/live/JoinLiveQuizModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Play, Plus, Trophy, BookOpen, Flame, Award, Clock, Star, Zap, ArrowRight, CheckCircle2, Users, Layers, BarChart3, HelpCircle, FileText
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  useDocumentTitle('MEXO Quiz — Learn. Play. Compete. Improve.');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { activeRole, switchRole } = useRole();

  const [quizzes] = useState(() => quizService.getAllQuizzes());
  const [attempts] = useState(() => attemptService.getAllAttempts());
  const [assignments] = useState(() => classService.getAssignments());
  const [showLiveModal, setShowLiveModal] = useState(false);

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'MEXO Scholar';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Banner Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878E8] text-white shadow-mexo-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <span>🔥 {profile?.streak || 7} Day Study Streak</span>
            <span>·</span>
            <span>Level {profile?.level || 5}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome back, {displayName}!
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            {activeRole === 'teacher'
              ? 'Create interactive quizzes, assign homework to classes, and track student mastery analytics.'
              : 'Test your skills with daily challenges, earn certificates, and compete on the global leaderboard.'}
          </p>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button
              onClick={() => setShowLiveModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-[#7C3AED] font-extrabold text-xs shadow-md hover:bg-purple-50 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-[#7C3AED]" />
              <span>Join Live Quiz</span>
            </button>

            {activeRole === 'teacher' ? (
              <button
                onClick={() => navigate('/builder/new')}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Quiz</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/library')}
                className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 font-extrabold text-xs shadow-md hover:bg-white/30 transition-all cursor-pointer flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Quiz Library</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Illustration / Trophy badge */}
        <div className="z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-2 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-xl mx-auto">
            🏆
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Global Rank</p>
          <p className="text-2xl font-black text-white">#14 Top 5%</p>
          <p className="text-[10px] text-purple-200 font-mono">1,250 Total XP</p>
        </div>
      </div>

      {/* Daily Challenge & Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-mexo-card flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Daily Challenge</p>
            <p className="text-sm font-bold text-slate-900">Double XP Active</p>
            <span className="text-[10px] font-bold text-[#7C3AED]">Complete 1 Quiz today</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-mexo-card flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0878E8]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Certificates</p>
            <p className="text-sm font-bold text-slate-900">3 Earned</p>
            <span className="text-[10px] font-bold text-emerald-600">Verified Credentials</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-mexo-card flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Quizzes Completed</p>
            <p className="text-sm font-bold text-slate-900">{attempts.length} Finished</p>
            <span className="text-[10px] font-bold text-slate-500">92% Avg Accuracy</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-mexo-card flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Class Rank</p>
            <p className="text-sm font-bold text-slate-900">#2 in CS-401</p>
            <span className="text-[10px] font-bold text-amber-600">Leaderboard Position</span>
          </div>
        </div>
      </div>

      {/* Featured Quizzes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Trending & Featured Quizzes</h2>
            <p className="text-xs text-slate-500">Popular quizzes played across the MEXO network.</p>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <div
              key={q.id}
              onClick={() => navigate(`/quiz/${q.id}`)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-mexo-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img
                    src={q.settings.coverImageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'}
                    alt={q.settings.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                    {q.settings.subject}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{q.rating_avg}</span>
                    <span className="text-slate-400 font-normal">({q.rating_count}) · {q.plays_count} plays</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-2">
                    {q.settings.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {q.settings.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                <div className="flex items-center space-x-2">
                  <MexoAvatar name={q.creator_name} src={q.creator_avatar} size="xs" />
                  <span className="text-xs text-slate-600 font-semibold truncate max-w-[120px]">{q.creator_name}</span>
                </div>
                <span className="text-xs font-bold text-[#7C3AED] flex items-center space-x-1">
                  <span>Start</span>
                  <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homework Assignments Pending */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-slate-900">Upcoming Homework Assignments</h3>
          </div>
          <button onClick={() => navigate('/student/assignments')} className="text-xs font-bold text-[#7C3AED] hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {assignments.map(asg => (
            <div key={asg.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{asg.quiz_title}</p>
                <p className="text-[11px] text-slate-500">{asg.class_name} · Due {new Date(asg.due_date).toLocaleDateString()}</p>
              </div>
              <MexoButton variant="purple" size="xs" onClick={() => navigate(`/quiz/${asg.quiz_id}`)}>
                Take Quiz
              </MexoButton>
            </div>
          ))}
        </div>
      </div>

      <JoinLiveQuizModal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} />
    </div>
  );
};
