import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { classService } from '../../services/classService';
import { liveSessionService } from '../../services/liveSessionService';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { JoinLiveQuizModal } from '../../components/live/JoinLiveQuizModal';
import { CreateModal } from '../../components/create/CreateModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Play,
  Plus,
  Trophy,
  BookOpen,
  Flame,
  Award,
  Clock,
  Star,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  BarChart3,
  HelpCircle,
  FileText,
  Compass,
  Sparkles,
  Radio,
  Target,
  Search,
  PlusCircle,
  Bookmark,
} from 'lucide-react';
import { Quiz } from '../../types/quiz';

export const DashboardPage: React.FC = () => {
  useDocumentTitle('MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [quizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());
  const [attempts] = useState(() => attemptService.getAllAttempts());
  const [assignments] = useState(() => classService.getAssignments());
  const [classes] = useState(() => classService.getClasses());
  const [sessions] = useState(() => liveSessionService.getLocalSessions());

  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MEXO User';

  // Dynamic filter: Has user created content?
  const myCreatedActivities = quizzes.filter(
    q => q.creator_id === (profile?.id || user?.id) || q.creator_name === displayName
  );
  const hasCreatedContent = myCreatedActivities.length > 0;

  // Dynamic filter: Has user enrolled or assigned items?
  const myAttempts = attempts.filter(a => a.user_id === (profile?.id || user?.id));

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none box-border overflow-hidden">
      {/* Sleek, Compact Hero Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4 box-border">
        {/* Top Streak Pill */}
        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-white">
            <span>🔥 {profile?.streak ?? (myAttempts.length > 0 ? 1 : 0)} Day Streak</span>
          </div>

          <span className="text-[11px] font-mono font-extrabold text-purple-200">
            MEXO Platform
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 z-10 text-left">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight break-words">
            {greeting}, {displayName}!
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
            Create interactive quizzes, host live multiplayer sessions, join classes, and track your learning progress.
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-1 z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white text-[#7C3AED] font-extrabold text-xs shadow-md hover:bg-purple-50 transition-all cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
            <span>+ Create Resource</span>
          </button>

          <button
            onClick={() => setShowLiveModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white font-extrabold text-xs shadow-md hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center space-x-1.5 border border-white/10 shrink-0"
          >
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Join Live Quiz</span>
          </button>

          <button
            onClick={() => navigate('/discover')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 font-extrabold text-xs shadow-md hover:bg-white/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Activities</span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleGlobalSearch} className="w-full">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search quizzes, assessments, lessons, topics or subjects..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 shadow-sm outline-hidden box-border"
          />
        </div>
      </form>

      {/* Quick KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => navigate('/library')}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-purple-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-mono font-black">{myCreatedActivities.length}</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">My Library</p>
          <p className="text-xs font-black text-slate-900">Created Items</p>
        </div>

        <div
          onClick={() => navigate('/assignments')}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-blue-600">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-mono font-black">{assignments.length}</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Assignments</p>
          <p className="text-xs font-black text-slate-900">Homework Due</p>
        </div>

        <div
          onClick={() => navigate('/sessions')}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-rose-600">
            <Radio className="w-5 h-5" />
            <span className="text-xs font-mono font-black">{sessions.length}</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Live Rooms</p>
          <p className="text-xs font-black text-slate-900">Active Lobbies</p>
        </div>

        <div
          onClick={() => navigate('/progress')}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-emerald-600">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-mono font-black">{myAttempts.length}</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Accuracy</p>
          <p className="text-xs font-black text-slate-900">Progress Stats</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Quizzes & Activities Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-sm font-extrabold text-slate-900">Featured Learning Resources</h3>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizzes.slice(0, 4).map(quiz => (
                <div
                  key={quiz.id}
                  onClick={() => navigate(`/library/${quiz.id}`)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all bg-white cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase">
                        {quiz.resource_type || 'Quiz'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {quiz.questions.length} Qs
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{quiz.settings.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {quiz.settings.description || 'Interactive learning resource.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 text-[11px]">{quiz.settings.subject}</span>
                    <span className="text-[#7C3AED] font-extrabold flex items-center space-x-1">
                      <span>Start</span>
                      <Play className="w-3 h-3 fill-[#7C3AED]" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Quick Actions & Live Session Banner */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-yellow-400 text-xs font-black uppercase">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Live Quiz Room</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Have a 6-Digit Code?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join a live multiplayer quiz session hosted by your teacher or peer.
              </p>
            </div>
            <button
              onClick={() => setShowLiveModal(true)}
              className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              Enter Join Code ⚡
            </button>
          </div>
        </div>
      </div>

      {showLiveModal && (
        <JoinLiveQuizModal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} />
      )}

      {showCreateModal && (
        <CreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
