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
  Play, Plus, Trophy, BookOpen, Flame, Award, Clock, Star, Zap, ArrowRight, CheckCircle2, Users, Layers, BarChart3, HelpCircle, FileText, Compass, Sparkles, Radio, Target, Search, PlusCircle, Bookmark
} from 'lucide-react';
import { Quiz } from '../../types/quiz';

export const DashboardPage: React.FC = () => {
  useDocumentTitle('MEXO Quiz — Unified Interactive Learning Platform');
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

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO Scholar';

  // Dynamic filter: Has user created content?
  const myCreatedActivities = quizzes.filter(q => q.creator_id === (profile?.id || user?.id) || q.creator_name === displayName);
  const hasCreatedContent = myCreatedActivities.length > 0;

  // Dynamic filter: Has user enrolled or assigned items?
  const myAttempts = attempts.filter(a => a.user_id === (profile?.id || user?.id));
  const hasStudentHistory = myAttempts.length > 0 || assignments.length > 0;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <span>🔥 {profile?.streak ?? (myAttempts.length > 0 ? 1 : 0)} Day Streak</span>
            <span>·</span>
            <span>Level {profile?.level ?? (myAttempts.length > 0 ? 2 : 1)} Scholar</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {greeting}, {displayName}!
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Create interactive quizzes, host live multiplayer sessions, join classes, and track your personal learning progress with one unified MEXO account.
          </p>

          {/* Header Action Buttons */}
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-[#7C3AED] font-extrabold text-xs shadow-md hover:bg-purple-50 transition-all cursor-pointer flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
              <span>+ Create Resource</span>
            </button>

            <button
              onClick={() => setShowLiveModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-900/90 text-white font-extrabold text-xs shadow-md hover:bg-slate-900 transition-all cursor-pointer flex items-center space-x-2 border border-white/10"
            >
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Join Live Quiz</span>
            </button>

            <button
              onClick={() => navigate('/discover')}
              className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 font-extrabold text-xs shadow-md hover:bg-white/30 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Activities</span>
            </button>
          </div>
        </div>

        {/* User Rank Card */}
        <div className="z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-2 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-xl mx-auto">
            🏆
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Scholar Rank</p>
          <p className="text-2xl font-black text-white">Level {profile?.level || (attempts.length > 0 ? 2 : 1)}</p>
          <p className="text-[10px] text-purple-200 font-mono">{profile?.xp || (attempts.length * 50)} Total XP</p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <form onSubmit={handleGlobalSearch} className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search MEXO Quiz resources, topics, public quizzes, classes, or reports..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-100 text-sm font-medium text-slate-900 outline-hidden"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Daily Study Streak</p>
            <p className="text-sm font-bold text-slate-900">7 Days Active</p>
            <span className="text-[10px] font-bold text-[#7C3AED]">Double XP Bonus Active</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">My Library</p>
            <p className="text-sm font-bold text-slate-900">{quizzes.length} Items Available</p>
            <span className="text-[10px] font-bold text-blue-600">Quizzes, Lessons & Decks</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">Completed Quizzes</p>
            <p className="text-sm font-bold text-slate-900">{attempts.length} Submissions</p>
            <span className="text-[10px] font-bold text-emerald-600">92% Avg Accuracy</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-extrabold uppercase">My Classrooms</p>
            <p className="text-sm font-bold text-slate-900">{classes.length} Enrolled / Taught</p>
            <span className="text-[10px] font-bold text-amber-600">Unified Account</span>
          </div>
        </div>
      </div>

      {/* Creator Section: My Created Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-lg font-bold text-slate-900">
              {hasCreatedContent ? 'My Created Activities' : 'Create Your First Learning Resource'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center space-x-1"
          >
            <span>My Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!hasCreatedContent ? (
          /* Smart Empty State for Creator */
          <div className="p-8 rounded-3xl bg-white border border-dashed border-purple-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No created activities yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't created any quizzes, lessons, or flashcards deck yet. Use the MEXO builder or MEXO AI to generate content in seconds.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] text-white text-xs font-extrabold shadow-md hover:bg-purple-700 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {myCreatedActivities.map(q => (
              <div
                key={q.id}
                onClick={() => navigate(`/builder/${q.id}`)}
                className="bg-white rounded-3xl border border-slate-200 p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] uppercase">
                      {q.resource_type || 'quiz'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{q.questions.length} Questions</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                    {q.settings.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{q.settings.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 mt-4">
                  <span>{q.plays_count} plays</span>
                  <span className="text-[#7C3AED] hover:underline">Edit Activity →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Section: Assigned Homework & Learning Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-sm font-bold text-slate-900">Your Assignments & Homework</h3>
            </div>
            <button onClick={() => navigate('/assignments')} className="text-xs font-bold text-[#7C3AED] hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No pending homework assignments.</p>
            ) : (
              assignments.map(asg => (
                <div key={asg.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{asg.quiz_title}</p>
                    <p className="text-[11px] text-slate-500">
                      {asg.class_name} • Due {new Date(asg.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/quiz/${asg.quiz_id}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Start Activity
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Classes */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">My Classes</h3>
            </div>
            <button onClick={() => navigate('/classes')} className="text-xs font-bold text-[#7C3AED] hover:underline">
              Manage Classes
            </button>
          </div>

          <div className="space-y-3">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                      {cls.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{cls.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Teacher: {cls.teacher_name} • {cls.students_count} Students
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Public Discover Resources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Discover Activities</h2>
            <p className="text-xs text-slate-500">Explore public resources created by teachers and experts.</p>
          </div>
          <button
            onClick={() => navigate('/discover')}
            className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.slice(0, 3).map(q => (
            <div
              key={q.id}
              onClick={() => navigate(`/quiz/${q.id}`)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
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
                    <span className="text-slate-400 font-normal">({q.rating_count}) • {q.plays_count} plays</span>
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
                  <span>Play</span>
                  <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <JoinLiveQuizModal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} />
      <CreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};

