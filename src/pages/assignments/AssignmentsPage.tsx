import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Layers,
  Search,
  Plus,
  X,
  Users,
  Copy,
  Check,
  Link,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { useAuth } from '../../contexts/AuthContext';
import { HomeworkAssignment, Quiz } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../../components/common/MexoButton';
import { MexoModal } from '../../components/common/MexoModal';
import { supabase } from '../../lib/supabase';

export const AssignmentsPage: React.FC = () => {
  useDocumentTitle('Assignments — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const currentUserId = profile?.id || user?.id || '';

  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'assigned_by_me' | 'assigned_to_me' | 'completed' | 'pending' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [assignMode, setAssignMode] = useState<'students' | 'link' | 'code'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [mockStudents, setMockStudents] = useState<{ id: string; name: string; username: string }[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadAssignmentsData = async () => {
    setIsLoading(true);
    try {
      const [qz, { data: asgData }, { data: profilesData }] = await Promise.all([
        quizService.fetchQuizzesFromSupabase(),
        supabase.from('homework_assignments').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, first_name, last_name, username').limit(20),
      ]);

      setQuizzes(qz);
      if (qz.length > 0 && !selectedQuizId) setSelectedQuizId(qz[0].id);

      if (asgData) {
        setAssignments(asgData as any);
      }

      if (profilesData && profilesData.length > 0) {
        setMockStudents(profilesData.map(p => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username || 'Student',
          username: p.username || 'student',
        })));
      } else {
        setMockStudents([
          { id: 's1', name: 'Arun Kumar', username: 'arun_k' },
          { id: 's2', name: 'Priya Sharma', username: 'priya_s' },
          { id: 's3', name: 'Kavin Raj', username: 'kavin_r' },
          { id: 's4', name: 'Divya Patel', username: 'divya_p' },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentsData();
  }, []);

  const handleOpenAssignModal = (quizId?: string) => {
    if (quizId) setSelectedQuizId(quizId);
    else if (quizzes.length > 0) setSelectedQuizId(quizzes[0].id);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setGeneratedLink(`${window.location.origin}/quiz/${quizId || quizzes[0]?.id || 'quiz'}?joinCode=${code}`);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = async () => {
    const targetQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];
    if (!targetQuiz) return;

    const newAsg: HomeworkAssignment = {
      id: `asg-${Date.now()}`,
      quiz_id: targetQuiz.id,
      quiz_title: targetQuiz.settings?.title || 'Untitled Quiz',
      class_id: 'direct',
      class_name: assignMode === 'students' ? `${selectedStudentIds.length} Students` : assignMode === 'code' ? `Code: ${generatedCode}` : 'Share Link',
      teacher_id: currentUserId,
      due_date: new Date(dueDate).toISOString(),
      attempts_allowed: attemptsAllowed,
      allow_late_submission: true,
      auto_remind: true,
      assigned_at: new Date(startDate).toISOString(),
      status: 'active',
    };

    try {
      await supabase.from('homework_assignments').insert(newAsg);
    } catch (e) {}

    setAssignments(prev => [newAsg, ...prev]);
    setShowAssignModal(false);
  };

  const filtered = assignments.filter(asg => {
    if (activeTab === 'assigned_by_me' && asg.teacher_id !== currentUserId) return false;
    if (activeTab === 'assigned_to_me' && asg.teacher_id === currentUserId) return false;
    if (activeTab === 'pending' && asg.status !== 'active') return false;
    if (activeTab === 'completed' && asg.status !== 'completed') return false;
    if (activeTab === 'expired' && new Date(asg.due_date).getTime() > Date.now()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return asg.quiz_title.toLowerCase().includes(q) || (asg.class_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>MEXO Assignment Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Assignments & Deadlines</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Assign quizzes directly to individual students, generate share links, or distribute 6-digit join codes with enforced attempt limits.
          </p>
        </div>

        <MexoButton
          variant="purple"
          size="lg"
          onClick={() => handleOpenAssignModal()}
          leftIcon={<Plus className="w-5 h-5" />}
          className="bg-white text-[#7C3AED] hover:bg-purple-50 shadow-lg"
        >
          + Assign Quiz
        </MexoButton>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'assigned_by_me', label: 'Assigned by Me' },
            { id: 'assigned_to_me', label: 'Assigned to Me' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'expired', label: 'Expired' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 shadow-2xs outline-hidden"
          />
        </div>
      </div>

      {/* Assignments List / Empty State */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading assignments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No assignments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Assign a quiz to individual students, share via direct link, or join an assigned quiz with your 6-digit code.
          </p>
          <MexoButton variant="purple" size="sm" onClick={() => handleOpenAssignModal()} className="mt-2">
            Assign First Quiz
          </MexoButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(asg => {
            const isDueSoon = new Date(asg.due_date).getTime() - Date.now() < 86400000 * 2;
            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-extrabold uppercase tracking-wider">
                      {asg.class_name || 'Direct Assignment'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDueSoon ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Due {new Date(asg.due_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{asg.quiz_title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {asg.instructions || 'Complete this quiz before the deadline. 1 attempt allowed.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{asg.attempts_allowed || 1} Attempt</span>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${asg.quiz_id}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Start</span>
                    <Play className="w-3 h-3 fill-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Quiz Modal (No Classes) */}
      {showAssignModal && (
        <MexoModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Quiz" maxWidth="md">
          <div className="space-y-4 pt-1">
            {/* Select Quiz */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Quiz to Assign</label>
              <select
                value={selectedQuizId}
                onChange={e => {
                  setSelectedQuizId(e.target.value);
                  const code = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedCode(code);
                  setGeneratedLink(`${window.location.origin}/quiz/${e.target.value}?joinCode=${code}`);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-hidden focus:border-[#7C3AED]"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.settings?.title || 'Untitled Quiz'} ({q.questions?.length || 0} Qs)
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assign Via</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'students', label: 'Specific Students', icon: Users },
                  { id: 'link', label: 'Share Link', icon: Link },
                  { id: 'code', label: 'Join Code', icon: QrCode },
                ].map(m => {
                  const Icon = m.icon;
                  const isSel = assignMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAssignMode(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all ${
                        isSel
                          ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode 1: Specific Students Checklist */}
            {assignMode === 'students' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Students</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Search student by name or username..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-hidden"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {mockStudents
                    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                    .map(s => {
                      const isChecked = selectedStudentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-white cursor-pointer text-xs font-semibold text-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedStudentIds(prev =>
                                isChecked ? prev.filter(x => x !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="rounded text-[#7C3AED] focus:ring-purple-500"
                          />
                          <span>{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">(@{s.username})</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Mode 2: Share Link */}
            {assignMode === 'link' && (
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <label className="text-xs font-bold text-slate-700">Direct Quiz Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-800 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 cursor-pointer flex items-center space-x-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: 6-Digit Join Code */}
            {assignMode === 'code' && (
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center space-y-2">
                <label className="text-xs font-bold text-slate-700">6-Digit Join Code</label>
                <div className="text-2xl font-mono font-black tracking-widest text-[#7C3AED]">
                  {generatedCode}
                </div>
                <p className="text-[11px] text-slate-500">Students enter this code at Join Quiz on their dashboard.</p>
              </div>
            )}

            {/* Dates & Attempts */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Allowed Attempts (Default: 1)</label>
              <select
                value={attemptsAllowed}
                onChange={e => setAttemptsAllowed(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
              >
                <option value={1}>1 Attempt Only (Default)</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <MexoButton variant="ghost" size="sm" onClick={() => setShowAssignModal(false)}>
                Cancel
              </MexoButton>
              <MexoButton variant="purple" size="sm" onClick={handleSaveAssignment}>
                Assign Quiz
              </MexoButton>
            </div>
          </div>
        </MexoModal>
      )}
    </div>
  );
};
