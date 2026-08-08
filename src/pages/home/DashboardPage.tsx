import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { classService } from '../../services/classService';
import { progressService } from '../../services/progressService';
import { JoinLiveQuizModal } from '../../components/live/JoinLiveQuizModal';
import { CreateModal } from '../../components/create/CreateModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Play,
  Plus,
  Trophy,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  MoreVertical,
  Edit,
  Share2,
  BarChart3,
  Copy,
  Archive,
  Trash2,
  Search,
  PlusCircle,
  FileText,
  Target,
} from 'lucide-react';
import { Quiz, QuizAttempt, HomeworkAssignment } from '../../types/quiz';

export const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [progressStats, setProgressStats] = useState<any>({ totalCompleted: 0, overallAccuracy: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = profile?.id || user?.id || '';
  const displayName = profile
    ? `${profile.first_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'Scholar';

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [qz, att, asg, prog] = await Promise.all([
        quizService.fetchQuizzesFromSupabase(),
        attemptService.fetchAttemptsFromSupabase(currentUserId),
        classService.fetchAssignmentsFromSupabase(),
        progressService.getStudentProgress(currentUserId),
      ]);
      setQuizzes(qz);
      setAttempts(att);
      setAssignments(asg);
      setProgressStats(prog);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUserId]);

  // Quizzes created by the user
  const myCreatedQuizzes = quizzes.filter(
    q => q.creator_id === currentUserId || q.creator_name === displayName
  );

  // Active assignment / upcoming learning item
  const upcomingAssignment = assignments.find(a => a.status === 'active');
  const recommendedQuiz = upcomingAssignment
    ? quizzes.find(q => q.id === upcomingAssignment.quiz_id)
    : quizzes[0];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const handleDuplicate = async (e: React.MouseEvent, q: Quiz) => {
    e.stopPropagation();
    const copy = await quizService.duplicateQuiz(q.id, displayName, currentUserId);
    if (copy) {
      setQuizzes(prev => [copy, ...prev]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      const ok = await quizService.deleteQuiz(id);
      if (ok) {
        setQuizzes(prev => prev.filter(q => q.id !== id));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <span>🔥 {profile?.streak || (attempts.length > 0 ? 1 : 0)} Day Streak</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {greeting}, {displayName.toUpperCase()} 👋
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Create, take and manage your quizzes from one place.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
            <span>+ Create Quiz</span>
          </button>

          <button
            onClick={() => setShowLiveModal(true)}
            className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 border border-white/10"
          >
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Join Quiz</span>
          </button>
        </div>
      </div>

      {/* Quick Overview KPI Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Quick Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Created</p>
              <p className="text-2xl font-black text-slate-900">{myCreatedQuizzes.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Assigned</p>
              <p className="text-2xl font-black text-slate-900">{assignments.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Attempts</p>
              <p className="text-2xl font-black text-slate-900">{attempts.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase">Accuracy</p>
              <p className="text-2xl font-black text-slate-900">
                {progressStats.overallAccuracy || (attempts.length > 0 ? Math.round(attempts.reduce((a, c) => a + c.percentage, 0) / attempts.length) : 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Continue Learning</h2>
        {recommendedQuiz ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-purple-300 transition-all">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase">
                <span>{upcomingAssignment ? 'Assigned Activity' : 'Featured Resource'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{recommendedQuiz.settings?.title}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start space-x-4">
                <span>{recommendedQuiz.questions?.length || 10} Questions</span>
                <span>•</span>
                <span>{recommendedQuiz.settings?.quizDurationMinutes || 15} Minutes</span>
                <span>•</span>
                <span className="text-purple-600 font-bold">1 Attempt (Default)</span>
              </p>
            </div>

            <button
              onClick={() => navigate(`/quiz/${recommendedQuiz.id}`)}
              className="px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 shrink-0"
            >
              <span>Start Quiz</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-800">No active quizzes</p>
            <p className="text-xs text-slate-500">Join a quiz or create your first quiz to get started.</p>
          </div>
        )}
      </div>

      {/* Main Content Grid: Recent Activity & Your Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Activity</h3>
            <button
              onClick={() => navigate('/progress')}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {attempts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No submissions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    <th className="pb-2">Quiz</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Accuracy</th>
                    <th className="pb-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {attempts.slice(0, 5).map(att => (
                    <tr
                      key={att.id}
                      onClick={() => navigate(`/result/${att.id}`)}
                      className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-2 font-bold text-slate-900 truncate max-w-[140px]">{att.quiz_title}</td>
                      <td className="py-3">{att.score}/{att.max_score || att.total_points || 100}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          att.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 text-[11px]">
                        {new Date(att.completed_at || att.submitted_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your Quizzes Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Your Quizzes</h3>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>My Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myCreatedQuizzes.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-slate-400">You have not created any quizzes yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
              >
                + Create First Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    <th className="pb-2">Quiz</th>
                    <th className="pb-2">Plays</th>
                    <th className="pb-2">Avg Score</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {myCreatedQuizzes.slice(0, 5).map(q => (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/library/${q.id}`)}
                      className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-2 font-bold text-slate-900 truncate max-w-[120px]">{q.settings?.title}</td>
                      <td className="py-3 text-slate-500">{q.plays_count || 0}</td>
                      <td className="py-3 text-[#7C3AED] font-bold">{(q.rating_avg ? q.rating_avg * 20 : 80).toFixed(0)}%</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7C3AED] uppercase">
                          {q.settings?.status || 'Published'}
                        </span>
                      </td>
                      <td className="py-3 text-right" onClick={e => e.stopPropagation()}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              className="w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1 space-y-0.5 text-xs font-semibold text-slate-700"
                              align="end"
                            >
                              <DropdownMenu.Item
                                onClick={() => navigate(`/library/${q.id}`)}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer outline-hidden"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Open</span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => navigate(`/builder/${q.id}`)}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer outline-hidden"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => navigate('/assignments')}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer outline-hidden"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Assign</span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => navigate(`/reports/${q.id}`)}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer outline-hidden"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Analytics</span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={e => handleDuplicate(e, q)}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer outline-hidden"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                              <DropdownMenu.Item
                                onClick={e => handleDelete(e, q.id)}
                                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer outline-hidden"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
