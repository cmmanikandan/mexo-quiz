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
  FileText,
  QrCode,
  ListOrdered,
  HelpCircle,
  Power,
  Maximize2,
  Lock,
  Zap,
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(() => quizService.getQuizById(id || ''));
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'matrix' | 'questions' | 'leaderboard' | 'anticheat'>('overview');

  // Modals state
  const [selectedStudentAttempt, setSelectedStudentAttempt] = useState<QuizAttempt | null>(null);
  const [selectedSecurityAttempt, setSelectedSecurityAttempt] = useState<QuizAttempt | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
  const joinCode = quiz.id.replace(/[^0-9]/g, '').slice(0, 6).padEnd(6, '7');

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDuplicate = async () => {
    const duplicated = await quizService.duplicateQuiz(quiz.id, currentUserName, currentUserId);
    if (duplicated) {
      navigate(`/quiz/${duplicated.id}`);
    }
  };

  const handleEndQuiz = async () => {
    if (window.confirm('Are you sure you want to end/archive this quiz session?')) {
      const updated = {
        ...quiz,
        settings: {
          ...quiz.settings,
          status: 'archived' as any,
        },
      };
      await quizService.saveQuiz(updated);
      setQuiz(updated);
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
      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center space-x-2">
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
            </div>

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
                    onClick={handleDuplicate}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                    <span>Duplicate</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={handleEndQuiz}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer outline-none"
                  >
                    <Power className="w-4 h-4 text-amber-600" />
                    <span>End / Archive Quiz</span>
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

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate('/assignments')}
            className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Assign Quiz</span>
          </button>

          <button
            onClick={() => navigate(`/host/${joinCode}`)}
            className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-extrabold text-xs border border-purple-200 flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-2xs"
          >
            <Radio className="w-4 h-4 text-[#7C3AED]" />
            <span>Host Live Room</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Share & QR Code</span>
          </button>

          <button
            onClick={handleEndQuiz}
            className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200 flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-2xs"
          >
            <Power className="w-4 h-4 text-amber-600" />
            <span>End Quiz Session</span>
          </button>
        </div>
      </div>

      {/* QUIZ DETAILS TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto overflow-y-hidden text-nowrap scrollbar-none">
        <div className="flex space-x-1 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'matrix', label: 'Question Matrix', icon: Grid },
            { id: 'questions', label: 'Questions & Answers', icon: ListOrdered },
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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

      {/* STUDENTS TAB */}
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
                    <th className="p-3.5 min-w-[170px] border-r border-slate-200">
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
                      <td className="p-3.5 border-r border-slate-200">
                        <div className="flex items-center space-x-2.5">
                          <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                          <span className="font-bold text-slate-900 truncate max-w-[150px]">{att.user_name}</span>
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

      {/* QUESTIONS & ANSWERS TAB */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Quiz Questions & Answer Keys</h3>
              <p className="text-xs text-slate-500">Full list of questions, option choices, and correct answer keys.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-100 text-xs font-mono font-bold">
              {quiz.questions.length} Questions
            </span>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                      Question {idx + 1} • {q.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.title}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-mono font-bold shrink-0">
                    {q.points} Pts
                  </span>
                </div>

                {q.mediaUrl && (
                  <div className="rounded-xl overflow-hidden max-h-40 bg-slate-900 p-2 flex items-center justify-center">
                    <img src={q.mediaUrl} alt="Question Media" className="max-h-36 object-contain" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map(opt => {
                    const isCorrect = opt.isCorrect;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {isCorrect && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Correct Answer</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                    💡 <span className="font-bold text-amber-800">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION MATRIX TAB */}
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
                      <th className="p-3.5 min-w-[170px] border-r border-slate-200">
                        Student
                      </th>
                      <th className="p-3.5 min-w-[80px] border-r border-slate-200 text-center">
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
                        <td className="p-3.5 border-r border-slate-200">
                          <div className="flex items-center space-x-2">
                            <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                            <span className="font-bold text-slate-900 truncate max-w-[130px]">{att.user_name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 border-r border-slate-200 text-center">
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
        </div>
      )}

      {/* LEADERBOARD TAB */}
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
                      <th className="p-3.5 w-12 text-center border-r border-slate-200">#</th>
                      <th className="p-3.5 min-w-[170px] border-r border-slate-200">Student</th>
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
                          <td className="p-3.5 text-center font-mono font-black border-r border-slate-200">
                            {idx === 0 ? '👑 1' : idx === 1 ? '🥇 2' : idx === 2 ? '🥈 3' : `${idx + 1}`}
                          </td>
                          <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">
                            <div className="flex items-center space-x-2.5">
                              <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                              <span className="truncate max-w-[140px]">{att.user_name}</span>
                            </div>
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

      {/* ANTI-CHEATING TAB */}
      {activeTab === 'anticheat' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Exam Integrity & Anti-Cheating Logs</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {flaggedAttempts.length} Flagged / {attempts.length} Total
              </span>
            </div>

            {/* List of Flagged Cheated Students Summary */}
            {flaggedAttempts.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-extrabold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cheating Flags Detected ({flaggedAttempts.length} Students):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {flaggedAttempts.map(att => (
                    <div
                      key={att.id}
                      onClick={() => setSelectedSecurityAttempt(att)}
                      className="px-3 py-1.5 rounded-xl bg-rose-900/80 border border-rose-500/40 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer hover:bg-rose-800 transition-colors"
                    >
                      <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                      <span>{att.user_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono text-[9px]">
                        {att.integrity_score || 0}% Integrity
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">Student Security Table</h3>
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No security attempt data recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                      <th className="p-3.5 min-w-[170px] border-r border-slate-200">Student</th>
                      <th className="p-3.5">Integrity</th>
                      <th className="p-3.5 text-center">Tab Switches</th>
                      <th className="p-3.5 text-center">Blur</th>
                      <th className="p-3.5 text-center">Fullscreen</th>
                      <th className="p-3.5 text-center">Speed</th>
                      <th className="p-3.5 text-center">Live Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {attempts.map(att => {
                      const integrity = att.integrity_score || 100;
                      const statusClean = integrity >= 80;
                      return (
                        <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">
                            <div className="flex items-center space-x-2.5">
                              <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                              <span className="truncate max-w-[140px]">{att.user_name}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono font-black text-purple-700">{integrity}%</td>
                          <td className="p-3.5 text-center font-mono">
                            <span className={att.tab_switch_count ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                              {att.tab_switch_count || 0}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono">{att.window_blur_count || 0}</td>
                          <td className="p-3.5 text-center font-mono">{att.fullscreen_exit_count || 0}</td>
                          <td className="p-3.5 text-center font-mono">{att.speed_anomaly_count || 0}</td>
                          <td className="p-3.5 text-center font-mono text-[11px]">
                            {Math.floor(att.time_spent_seconds / 60)}m {att.time_spent_seconds % 60}s
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusClean ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {statusClean ? 'Clean' : 'Cheating Flagged'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedSecurityAttempt(att)}
                              className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-extrabold text-xs transition-colors cursor-pointer border border-purple-100"
                            >
                              Security Audit
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

      {/* SHARE & QR CODE MODAL */}
      <MexoModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Quiz & Mobile QR Code"
        maxWidth="md"
      >
        <div className="space-y-5 pt-2 text-center">
          {/* Join Code Display */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
            <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">
              Student Join Code
            </p>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-[#7C3AED] font-mono tracking-widest">
                {joinCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Scannable QR Code */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-white max-w-xs mx-auto shadow-xl">
            <p className="text-xs font-bold text-slate-300">Scan QR Code on Mobile</p>
            <div className="w-48 h-48 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}`}
                alt="MEXO Quiz QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Scan code with smartphone camera to open test</p>
          </div>

          {/* Student Link Input & Buttons */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-700">Direct Student Quiz Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* WhatsApp & External Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `🎮 Join my MEXO Quiz!\n\n📌 Quiz: ${quiz.settings.title}\n🔑 Join Code: ${joinCode}\n🔗 Link: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </a>

            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-extrabold text-xs border border-purple-200 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Student View</span>
            </button>
          </div>
        </div>
      </MexoModal>

      {/* SECURITY AUDIT BREAKDOWN MODAL */}
      {selectedSecurityAttempt && (
        <MexoModal
          isOpen={!!selectedSecurityAttempt}
          onClose={() => setSelectedSecurityAttempt(null)}
          title="Student Security Audit Breakdown"
          maxWidth="lg"
        >
          <div className="space-y-5 pt-2">
            {/* Student Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <MexoAvatar name={selectedSecurityAttempt.user_name} src={selectedSecurityAttempt.user_avatar} size="md" />
                <div>
                  <h4 className="text-sm font-bold">{selectedSecurityAttempt.user_name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Completed at {new Date(selectedSecurityAttempt.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Integrity Score</p>
                <p className={`text-2xl font-black font-mono ${
                  (selectedSecurityAttempt.integrity_score || 100) >= 80 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedSecurityAttempt.integrity_score || 100}%
                </p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Tab Switches</p>
                <p className="text-xl font-black text-rose-600 mt-1 font-mono">
                  {selectedSecurityAttempt.tab_switch_count || 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Window Blur</p>
                <p className="text-xl font-black text-amber-600 mt-1 font-mono">
                  {selectedSecurityAttempt.window_blur_count || 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Fullscreen Exits</p>
                <p className="text-xl font-black text-purple-600 mt-1 font-mono">
                  {selectedSecurityAttempt.fullscreen_exit_count || 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Total Time</p>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">
                  {Math.floor(selectedSecurityAttempt.time_spent_seconds / 60)}m {selectedSecurityAttempt.time_spent_seconds % 60}s
                </p>
              </div>
            </div>

            {/* Security Event Live Log Timeline */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Security Violation Chronological Timeline</span>
              </h5>

              {!selectedSecurityAttempt.security_events || selectedSecurityAttempt.security_events.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                  ✓ Clean Exam — No security violations or tab switches detected during this session.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedSecurityAttempt.security_events.map((ev, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-rose-700 capitalize flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" />
                          <span>{ev.event_type.replace('_', ' ')}</span>
                        </span>
                        <p className="text-[11px] text-slate-600">{ev.description || 'Security threshold alert triggered'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-mono text-[10px] font-black shrink-0">
                        {new Date(ev.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </MexoModal>
      )}

      {/* STUDENT ATTEMPT REVIEW MODAL */}
      {selectedStudentAttempt && (
        <MexoModal
          isOpen={!!selectedStudentAttempt}
          onClose={() => setSelectedStudentAttempt(null)}
          title={`Submission Details — ${selectedStudentAttempt.user_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-900">{selectedStudentAttempt.user_name}</p>
                <p className="text-[11px] text-purple-700 font-mono">
                  Score: {selectedStudentAttempt.score}/{selectedStudentAttempt.max_score} ({selectedStudentAttempt.percentage}%)
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                selectedStudentAttempt.is_passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {selectedStudentAttempt.is_passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {quiz.questions.map((q, idx) => {
                const ans = selectedStudentAttempt.answers[q.id];
                const { isCorrect } = attemptService.gradeQuestion(q, ans);
                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>Q{idx + 1}. {q.title}</span>
                      <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                        {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                      Answer Given: {ans || 'No Answer'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </MexoModal>
      )}
    </div>
  );
};
