import React, { useState } from 'react';
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
} from 'lucide-react';
import { classService } from '../../services/classService';
import { quizService } from '../../services/quizService';
import { HomeworkAssignment, Quiz } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../../components/common/MexoButton';
import { MexoModal } from '../../components/common/MexoModal';

export const AssignmentsPage: React.FC = () => {
  useDocumentTitle('Assignments & Activities — MEXO Quiz');
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(() => classService.getAssignments());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');
  const [selectedClassName, setSelectedClassName] = useState<string>('Grade 10 Science');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );
  const [attemptsAllowed, setAttemptsAllowed] = useState<number>(1);

  const handleCreateAssignment = () => {
    const targetQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];
    if (!targetQuiz) return;

    const newAssignment: HomeworkAssignment = {
      id: `asg-${Date.now()}`,
      quiz_id: targetQuiz.id,
      quiz_title: targetQuiz.settings.title,
      class_id: 'c101',
      class_name: selectedClassName,
      teacher_id: 't1',
      due_date: new Date(dueDate).toISOString(),
      attempts_allowed: attemptsAllowed,
      allow_late_submission: true,
      auto_remind: true,
      assigned_at: new Date().toISOString(),
      status: 'active',
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    setShowCreateModal(false);
  };

  const filtered = assignments.filter(asg => {
    if (filterStatus !== 'all' && asg.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asg.quiz_title.toLowerCase().includes(q) ||
        asg.class_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>MEXO Assignments</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Your Assignments & Homework</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Track assigned activities, self-paced homework deadlines, allowed attempts, and accommodations across all your classes.
          </p>
        </div>

        <MexoButton
          variant="purple"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          + Assign New Quiz
        </MexoButton>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assignments or classes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'active', 'due_soon', 'completed', 'expired'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer transition-all ${
                filterStatus === status
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No assignments match your filter</h3>
            <p className="text-xs text-slate-500">Check back when your teacher assigns new homework or practice quizzes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(asg => {
              const isDueSoon = new Date(asg.due_date).getTime() - Date.now() < 86400000 * 2;
              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase">
                        {asg.class_name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          asg.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : asg.status === 'due_soon' || isDueSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {asg.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug">{asg.quiz_title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{asg.attempts_allowed === 1 ? '1 Attempt Only' : `${asg.attempts_allowed} Attempts`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">Assigned by {asg.teacher_id}</span>
                    <button
                      onClick={() => navigate(`/quiz/${asg.quiz_id}?mode=test`)}
                      className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Assignment</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Assignment Modal */}
      {showCreateModal && (
        <MexoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Assign Quiz to Class"
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Select Quiz Activity</label>
              <select
                value={selectedQuizId}
                onChange={e => setSelectedQuizId(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-hidden"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.settings.title} ({q.questions.length} Qs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Target Class</label>
              <select
                value={selectedClassName}
                onChange={e => setSelectedClassName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-hidden"
              >
                <option value="Grade 10 Science">Grade 10 Science</option>
                <option value="Grade 11 Mathematics">Grade 11 Mathematics</option>
                <option value="AP Physics Prep">AP Physics Prep</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Attempts Allowed</label>
                <select
                  value={attemptsAllowed}
                  onChange={e => setAttemptsAllowed(parseInt(e.target.value, 10))}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-hidden"
                >
                  <option value={1}>1 Attempt Only (Strict Exam)</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                  <option value={0}>Unlimited Attempts (Practice)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <MexoButton variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </MexoButton>
              <MexoButton variant="purple" size="sm" onClick={handleCreateAssignment}>
                Publish Assignment
              </MexoButton>
            </div>
          </div>
        </MexoModal>
      )}
    </div>
  );
};
