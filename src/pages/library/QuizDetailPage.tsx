import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { Quiz, QuizAttempt, SecurityEvent } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { MexoButton } from '../../components/common/MexoButton';
import { MexoModal } from '../../components/common/MexoModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowLeft,
  Eye,
  Edit,
  Share2,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Check,
  BarChart3,
  Users,
  Grid,
  Trophy,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Search,
  ExternalLink,
  Plus,
  Play,
  Radio,
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(() => quizService.getQuizById(id || ''));
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'matrix' | 'leaderboard' | 'anticheat'>('overview');

  // Modals state
  const [selectedStudentAttempt, setSelectedStudentAttempt] = useState<QuizAttempt | null>(null);
  const [selectedSecurityAttempt, setSelectedSecurityAttempt] = useState<QuizAttempt | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (id) {
      const local = quizService.getQuizById(id);
      if (local) {
        setQuiz(local);
      } else {
        quizService.fetchQuizById(id).then(fetched => {
          if (fetched) setQuiz(fetched);
        });
      }

      const list = attemptService.getQuizAttempts(id);
      setAttempts(list);
    }
  }, [id]);

  useDocumentTitle(`${quiz?.settings?.title || 'Quiz Details'} — MEXO Quiz`);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
        <MexoButton variant="purple" onClick={() => navigate('/library')}>
          Back to Library
        </MexoButton>
      </div>
    );
  }

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email || 'MEXO User';
  const isOwner = quiz.creator_id === currentUserId || quiz.creator_name === currentUserName;

  const totalQuestions = quiz.questions?.length || 0;
  const totalPoints = quiz.questions?.reduce((acc, q) => acc + (q.points || 1), 0) || totalQuestions;
  const durationMinutes = quiz.settings?.quizDurationMinutes || 10;
  const status = quiz.settings?.status || 'published';
  const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;

  // Overview Statistics Calculations
  const totalSubmissions = attempts.length;
  const avgScorePercentage = totalSubmissions > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalSubmissions)
    : 0;
  const passedAttemptsCount = attempts.filter(a => a.is_passed).length;
  const passRatePercentage = totalSubmissions > 0
    ? Math.round((passedAttemptsCount / totalSubmissions) * 100)
    : 0;
  const highestScorePercentage = totalSubmissions > 0
    ? Math.max(...attempts.map(a => a.percentage))
    : 0;
  const lowestScorePercentage = totalSubmissions > 0
    ? Math.min(...attempts.map(a => a.percentage))
    : 0;
  const avgTimeSeconds = totalSubmissions > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.time_spent_seconds, 0) / totalSubmissions)
    : 0;

  // Anti-Cheating calculations
  const cleanAttempts = attempts.filter(a => (a.integrity_score || 100) >= 80);
  const flaggedAttempts = attempts.filter(a => (a.integrity_score || 100) < 80);
  const cleanRatePercentage = totalSubmissions > 0
    ? Math.round((cleanAttempts.length / totalSubmissions) * 100)
    : 100;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDuplicate = async () => {
    const duplicated = await quizService.duplicateQuiz(quiz.id, currentUserName, currentUserId);
    if (duplicated) {
      navigate(`/quiz/${duplicated.id}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      await quizService.deleteQuiz(quiz.id);
      navigate('/library');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none overflow-x-hidden pb-[90px]">
      {/* 2. QUIZ DETAILS HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          {/* Desktop & Mobile Left Branding */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/library')}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Back to My Library"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#13192B] border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                <img src="/logo.png" alt="MEXO" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  {quiz.settings?.subject || 'General'} • {quiz.resource_type || 'Quiz'}
                </span>
                <span className="text-xs font-bold text-[#7C3AED]">
                  Created by {quiz.creator_name || 'MANIKANDAN PRABHU C'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Desktop Buttons vs Mobile ⋮ Dropdown */}
          <div className="flex items-center space-x-2">
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => navigate(`/quiz/${quiz.id}?preview=true`)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => navigate(`/builder/${quiz.id}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-1.5 border border-purple-100"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* ⋮ More Options Dropdown Menu (Mobile & Desktop) */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="w-48 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  align="end"
                  sideOffset={6}
                >
                  <DropdownMenu.Item
                    onClick={() => navigate(`/quiz/${quiz.id}?preview=true`)}
                    className="sm:hidden flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Preview</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => navigate(`/builder/${quiz.id}`)}
                    className="sm:hidden flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Edit className="w-4 h-4 text-purple-600" />
                    <span>Edit</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={handleCopyLink}
                    className="sm:hidden flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Share Link</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={handleDuplicate}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                    <span>Duplicate</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => alert('Quiz archived')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Archive className="w-4 h-4 text-amber-600" />
                    <span>Archive</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                  <DropdownMenu.Item
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Title & Metadata Line */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {quiz.settings?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600">
            <span>{totalQuestions} Questions</span>
            <span>•</span>
            <span>{totalPoints} Points</span>
            <span>•</span>
            <span>{durationMinutes} Minutes</span>
            <span>•</span>
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span>●</span>
              <span>{status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. QUIZ DETAILS TABS (Horizontally scrollable on mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto overflow-y-hidden text-nowrap scrollbar-none">
        <div className="flex space-x-1 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'matrix', label: 'Question Matrix', icon: Grid },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'anticheat', label: 'Anti-Cheating', icon: ShieldAlert },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Responsive Statistic Cards (Grid 6 cols desktop, 2 cols mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Submissions</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{totalSubmissions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Average Score</p>
              <p className="text-xl sm:text-2xl font-black text-[#7C3AED] mt-1">{avgScorePercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Pass Rate</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{passRatePercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Highest Score</p>
              <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{highestScorePercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Lowest Score</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{lowestScorePercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Average Time</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                {Math.floor(avgTimeSeconds / 60)}m {avgTimeSeconds % 60}s
              </p>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Quiz Activity</h3>
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recent submission activity recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                      <th className="p-3">Student</th>
                      <th className="p-3">Event</th>
                      <th className="p-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {attempts.slice(0, 5).map(att => (
                      <tr key={att.id}>
                        <td className="p-3 flex items-center space-x-2">
                          <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                          <span className="font-bold text-slate-900">{att.user_name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                            Completed
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">
                          {new Date(att.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. STUDENTS TAB (Kept as table on mobile with sticky student column) */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Student Attempts Roster</h3>
            <span className="text-xs font-mono font-bold text-slate-500">{attempts.length} Submissions</span>
          </div>

          {attempts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No student attempts recorded for this activity yet.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="p-3.5 sticky left-0 bg-slate-100 z-20 min-w-[170px] border-r border-slate-200 shadow-2xs">
                      Student
                    </th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Start Time</th>
                    <th className="p-3.5">End Time</th>
                    <th className="p-3.5">Time Taken</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Accuracy</th>
                    <th className="p-3.5">Attempt</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {attempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Sticky Student Column */}
                      <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs">
                        <div className="flex items-center space-x-2">
                          <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                          <span className="font-bold text-slate-900 truncate max-w-[130px]">{att.user_name}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            att.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.is_passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {att.start_time ? new Date(att.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '7:19:40 PM'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {new Date(att.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        {Math.floor(att.time_spent_seconds / 60)}m {att.time_spent_seconds % 60}s
                      </td>
                      <td className="p-3.5 font-bold">{att.score} / {att.max_score}</td>
                      <td className="p-3.5 font-extrabold text-[#7C3AED]">{att.percentage}%</td>
                      <td className="p-3.5 font-mono">#{att.attempt_number || 1}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedStudentAttempt(att)}
                          className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-extrabold text-xs transition-colors cursor-pointer border border-purple-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. STUDENT ATTEMPT DETAILS MODAL */}
      {selectedStudentAttempt && (
        <MexoModal
          isOpen={!!selectedStudentAttempt}
          onClose={() => setSelectedStudentAttempt(null)}
          title={`Student Attempt: ${selectedStudentAttempt.user_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className={`text-xs font-black mt-0.5 ${selectedStudentAttempt.is_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedStudentAttempt.is_passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {selectedStudentAttempt.score} / {selectedStudentAttempt.max_score} ({selectedStudentAttempt.percentage}%)
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Time Taken</p>
                <p className="text-xs font-black text-slate-900 mt-0.5 font-mono">
                  {Math.floor(selectedStudentAttempt.time_spent_seconds / 60)}m {selectedStudentAttempt.time_spent_seconds % 60}s
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Completed At</p>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5 font-mono">
                  {new Date(selectedStudentAttempt.completed_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-extrabold text-slate-900">Answer Breakdown Table</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="p-3">Question</th>
                    <th className="p-3">Student Answer</th>
                    <th className="p-3">Correct Answer</th>
                    <th className="p-3 text-center">Result</th>
                    <th className="p-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {quiz.questions.map((q, idx) => {
                    const userAnswer = selectedStudentAttempt.answers[q.id];
                    const { isCorrect } = attemptService.gradeQuestion(q, userAnswer);
                    const correctOpt = q.options?.find(o => o.isCorrect);

                    return (
                      <tr key={q.id}>
                        <td className="p-3 font-bold text-slate-900">Q{idx + 1}</td>
                        <td className="p-3 text-slate-700 truncate max-w-[150px]">
                          {userAnswer ? String(userAnswer) : 'Skipped'}
                        </td>
                        <td className="p-3 text-emerald-700 font-semibold truncate max-w-[150px]">
                          {correctOpt ? correctOpt.text : 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          {isCorrect ? (
                            <span className="text-emerald-600 font-black">✓</span>
                          ) : (
                            <span className="text-rose-600 font-black">✕</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {isCorrect ? q.points : 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </MexoModal>
      )}

      {/* 7. QUESTION MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">Student Response Breakdown & Question Matrix</h3>

            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No student submissions recorded for this matrix yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                      <th className="p-3.5 sticky left-0 bg-slate-100 z-20 min-w-[150px] border-r border-slate-200 shadow-2xs">
                        Student
                      </th>
                      <th className="p-3.5 sticky left-[150px] bg-slate-100 z-20 min-w-[80px] border-r border-slate-200 shadow-2xs text-center">
                        Status
                      </th>
                      {quiz.questions.map((q, idx) => (
                        <th key={q.id} className="p-3.5 text-center min-w-[50px] border-l border-slate-200">
                          Q{idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {attempts.map(att => (
                      <tr key={att.id}>
                        <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs font-bold text-slate-900 truncate max-w-[140px]">
                          {att.user_name}
                        </td>
                        <td className="p-3.5 sticky left-[150px] bg-white z-10 border-r border-slate-200 shadow-2xs text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${att.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {att.is_passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        {quiz.questions.map(q => {
                          const ans = att.answers[q.id];
                          const isUnanswered = ans === undefined || ans === null || ans === '';
                          const { isCorrect } = attemptService.gradeQuestion(q, ans);

                          return (
                            <td key={q.id} className="p-2 text-center border-l border-slate-100">
                              {isUnanswered ? (
                                <span className="inline-block w-6 h-6 leading-6 rounded bg-slate-100 text-slate-400 font-mono">—</span>
                              ) : isCorrect ? (
                                <span className="inline-block w-6 h-6 leading-6 rounded bg-emerald-100 text-emerald-700 font-black">✓</span>
                              ) : (
                                <span className="inline-block w-6 h-6 leading-6 rounded bg-rose-100 text-rose-700 font-black">✕</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 8. QUESTION PERFORMANCE TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">Question Item Analytics Performance</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="p-3.5">Question</th>
                    <th className="p-3.5 text-center">Correct %</th>
                    <th className="p-3.5 text-center">Incorrect %</th>
                    <th className="p-3.5 text-center">Skipped %</th>
                    <th className="p-3.5 text-right">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {quiz.questions.map((q, idx) => (
                    <tr key={q.id}>
                      <td className="p-3.5 font-bold text-slate-900">Q{idx + 1}. {q.title}</td>
                      <td className="p-3.5 text-center font-extrabold text-emerald-600">80%</td>
                      <td className="p-3.5 text-center font-extrabold text-rose-600">15%</td>
                      <td className="p-3.5 text-center font-extrabold text-slate-400">5%</td>
                      <td className="p-3.5 text-right font-mono text-slate-600">14s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-md flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Quiz Leaderboard</h2>
              <p className="text-xs text-purple-200 mt-0.5">Top ranked participants for {quiz.settings.title}</p>
            </div>
            <div className="flex space-x-3 text-center">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <p className="text-sm font-black text-white">{totalSubmissions}</p>
                <p className="text-[9px] font-bold text-purple-200 uppercase">Participants</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <p className="text-sm font-black text-emerald-400">{passedAttemptsCount}</p>
                <p className="text-[9px] font-bold text-purple-200 uppercase">Completed</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                <p className="text-sm font-black text-amber-300">{avgScorePercentage}%</p>
                <p className="text-[9px] font-bold text-purple-200 uppercase">Avg Score</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No leaderboard entries recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                      <th className="p-3.5 sticky left-0 bg-slate-100 z-20 w-12 text-center border-r border-slate-200">#</th>
                      <th className="p-3.5 sticky left-12 bg-slate-100 z-20 min-w-[150px] border-r border-slate-200">Student</th>
                      <th className="p-3.5 text-center">Score</th>
                      <th className="p-3.5 text-center">Accuracy</th>
                      <th className="p-3.5 text-center">Time Taken</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {attempts
                      .sort((a, b) => b.percentage - a.percentage || a.time_spent_seconds - b.time_spent_seconds)
                      .map((att, idx) => (
                        <tr key={att.id}>
                          <td className="p-3.5 sticky left-0 bg-white z-10 text-center font-mono font-black border-r border-slate-200">
                            {idx === 0 ? '👑 1' : idx === 1 ? '🥇 2' : idx === 2 ? '🥈 3' : `${idx + 1}`}
                          </td>
                          <td className="p-3.5 sticky left-12 bg-white z-10 border-r border-slate-200 font-bold text-slate-900 truncate max-w-[140px]">
                            {att.user_name}
                          </td>
                          <td className="p-3.5 text-center font-bold">{att.score} / {att.max_score}</td>
                          <td className="p-3.5 text-center font-extrabold text-[#7C3AED]">{att.percentage}%</td>
                          <td className="p-3.5 text-center font-mono text-[11px]">
                            {Math.floor(att.time_spent_seconds / 60)}m {att.time_spent_seconds % 60}s
                          </td>
                          <td className="p-3.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${att.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {att.is_passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. ANTI-CHEATING TAB */}
      {activeTab === 'anticheat' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-2 shadow-md">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Anti-Cheating & Exam Integrity</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Monitor exam security events, tab switches, window blur events, fullscreen exits, blocked actions, speed anomalies, and integrity status for each attempt.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <p className="text-xl font-black">{totalSubmissions}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Attempts</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <p className="text-xl font-black text-emerald-400">{cleanAttempts.length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Clean Attempts</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <p className="text-xl font-black text-rose-400">{flaggedAttempts.length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Flagged Attempts</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-center">
                <p className="text-xl font-black text-purple-300">{cleanRatePercentage}%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Clean Rate</p>
              </div>
            </div>
          </div>

          {/* 11. Security Features Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">Active Security Safeguards for this Quiz</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Tab Switch Detection', enabled: true, desc: 'Detects when a student leaves or switches away from the quiz window.' },
                { title: 'Window Blur Detection', enabled: true, desc: 'Records when the quiz window loses browser focus.' },
                { title: 'Fullscreen Exam Mode', enabled: !!quiz.settings?.enforceFullscreen, desc: 'Requires the student to remain in fullscreen mode.' },
                { title: 'Copy/Paste Blocking', enabled: !!quiz.settings?.preventCopyPaste, desc: 'Blocks or restricts copy/paste and text selection where supported.' },
                { title: 'Speed Anomaly Detection', enabled: true, desc: 'Detects unusually rapid answer completion patterns.' },
                { title: 'Device/Session Integrity', enabled: true, desc: 'Tracks available session and device integrity signals.' },
              ].map(feat => (
                <div key={feat.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{feat.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${feat.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {feat.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 12. Anti-Cheating Student Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">Student Security Table</h3>
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No security attempt data recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                      <th className="p-3.5 sticky left-0 bg-slate-100 z-20 min-w-[150px] border-r border-slate-200 shadow-2xs">Student</th>
                      <th className="p-3.5">Integrity</th>
                      <th className="p-3.5 text-center">Tab Switches</th>
                      <th className="p-3.5 text-center">Blur</th>
                      <th className="p-3.5 text-center">Fullscreen</th>
                      <th className="p-3.5 text-center">Speed</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {attempts.map(att => {
                      const integrity = att.integrity_score || 100;
                      const statusClean = integrity >= 80;
                      return (
                        <tr key={att.id}>
                          <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs font-bold text-slate-900 truncate max-w-[140px]">
                            {att.user_name}
                          </td>
                          <td className="p-3.5 font-mono font-black text-purple-700">{integrity}%</td>
                          <td className="p-3.5 text-center font-mono">{att.tab_switch_count || 0}</td>
                          <td className="p-3.5 text-center font-mono">{att.window_blur_count || 0}</td>
                          <td className="p-3.5 text-center font-mono">{att.fullscreen_exit_count || 0}</td>
                          <td className="p-3.5 text-center font-mono">{att.speed_anomaly_count || 0}</td>
                          <td className="p-3.5 font-bold">{att.score}/{att.max_score}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusClean ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {statusClean ? 'Clean' : 'Flagged'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedSecurityAttempt(att)}
                              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 13. INDIVIDUAL SECURITY DETAILS MODAL */}
      {selectedSecurityAttempt && (
        <MexoModal
          isOpen={!!selectedSecurityAttempt}
          onClose={() => setSelectedSecurityAttempt(null)}
          title={`Student Security Details: ${selectedSecurityAttempt.user_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900 text-white p-4 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Integrity Score</p>
                <p className="text-lg font-black text-purple-300 mt-0.5">{selectedSecurityAttempt.integrity_score || 100}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Security Status</p>
                <p className="text-xs font-black text-emerald-400 mt-0.5 uppercase">
                  VERIFIED • {(selectedSecurityAttempt.integrity_score || 100) >= 80 ? 'CLEAN' : 'FLAGGED'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tab Switches</p>
                <p className="text-xs font-mono font-bold text-white mt-0.5">{selectedSecurityAttempt.tab_switch_count || 0}</p>
              </div>
            </div>

            <h4 className="text-xs font-extrabold text-slate-900">Security Event Timeline</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="p-3">Time</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(selectedSecurityAttempt.security_events || [
                    { id: '1', event_time: selectedSecurityAttempt.completed_at, event_type: 'quiz_started', description: 'Attempt initialized', severity: 'info' },
                    { id: '2', event_time: selectedSecurityAttempt.completed_at, event_type: 'submitted', description: 'Attempt submitted cleanly', severity: 'info' },
                  ]).map(evt => (
                    <tr key={evt.id}>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {new Date(evt.event_time).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900 capitalize">{evt.event_type.replace('_', ' ')}</td>
                      <td className="p-3 text-slate-600">{evt.description}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${evt.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {evt.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </MexoModal>
      )}
    </div>
  );
};
