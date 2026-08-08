import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Trophy,
  BarChart3,
  Copy,
  Check,
  ArrowLeft,
  Plus,
  Play,
  Share2,
  BookOpen,
} from 'lucide-react';
import { classService } from '../../services/classService';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { ClassRoom, HomeworkAssignment, Quiz } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../lib/supabase';

interface StudentRosterItem {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
}

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const classObj = classService.getClassById(id || '') || classService.getClasses()[0];
  useDocumentTitle(`${classObj?.name || 'Classroom'} — MEXO Quiz`);

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students' | 'leaderboard'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [assignments, setAssignments] = useState(() =>
    classService.getAssignments().filter(a => a.class_id === classObj?.id)
  );

  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [classLeaderboard, setClassLeaderboard] = useState<any[]>([]);

  const [quizzes] = useState(() => quizService.getAllQuizzes());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User';
  const isTeacher = classObj?.teacher_id === currentUserId || classObj?.teacher_name === currentUserName;

  // Fetch actual enrolled students and class leaderboard from Supabase
  useEffect(() => {
    if (!classObj) return;

    (async () => {
      try {
        const { data } = await supabase
          .from('classroom_students')
          .select('student_id, joined_at, profiles(id, username, first_name, last_name, avatar_url)')
          .eq('class_id', classObj.id);

        if (data && data.length > 0) {
          const mapped: StudentRosterItem[] = data.map((item: any) => ({
            id: item.student_id,
            name: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() || item.profiles?.username || 'Student',
            avatar: item.profiles?.avatar_url,
            joinedAt: item.joined_at,
          }));
          setStudents(mapped);
        }
      } catch (e) {}

      // Calculate class leaderboard from real attempts
      const allAttempts = attemptService.getAllAttempts();
      const classQuizIds = assignments.map(a => a.quiz_id);
      const relevantAttempts = allAttempts.filter(a => classQuizIds.includes(a.quiz_id));

      if (relevantAttempts.length > 0) {
        const scoresMap: Record<string, { name: string; avatar?: string; score: number }> = {};
        relevantAttempts.forEach(att => {
          if (!scoresMap[att.user_id]) {
            scoresMap[att.user_id] = { name: att.user_name, avatar: att.user_avatar, score: 0 };
          }
          scoresMap[att.user_id].score += att.xp_earned || att.score;
        });

        const sorted = Object.values(scoresMap).sort((a, b) => b.score - a.score);
        setClassLeaderboard(sorted);
      } else {
        setClassLeaderboard([]);
      }
    })();
  }, [classObj, assignments]);

  const handleCopyCode = () => {
    if (!classObj) return;
    navigator.clipboard.writeText(classObj.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const quiz = quizService.getQuizById(selectedQuizId);
    if (!quiz || !classObj) return;

    classService.addAssignment({
      quiz_id: quiz.id,
      quiz_title: quiz.settings.title,
      class_id: classObj.id,
      class_name: classObj.name,
      teacher_id: currentUserId,
      due_date: new Date(dueDate).toISOString(),
      attempts_allowed: 2,
      allow_late_submission: true,
      auto_remind: true,
    });

    setAssignments(classService.getAssignments().filter(a => a.class_id === classObj.id));
    setShowAssignModal(false);
  };

  if (!classObj) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 m-6">
        <Users className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Classroom not found</h3>
        <button onClick={() => navigate('/classes')} className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold">
          Back to Classrooms
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/classes')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Classrooms</span>
      </button>

      {/* Class Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold font-mono uppercase">
              Class Code: {classObj.code}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              {classObj.subject}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{classObj.name}</h1>
          <p className="text-xs sm:text-sm text-purple-100">
            Teacher: {classObj.teacher_name} • {students.length || classObj.students_count} Students enrolled
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2 border border-white/30"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Invite Code'}</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Dashboard Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'assignments', label: 'Assignments & Homework', icon: FileText },
          { id: 'students', label: 'Students Roster', icon: Users },
          { id: 'leaderboard', label: 'Class Leaderboard', icon: Trophy },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900">Classroom Information</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {classObj.description || 'Welcome to this interactive classroom. Complete assigned homework quizzes, test your knowledge, and compete on the class leaderboard.'}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Class Code:</span>
                <span className="font-bold text-slate-900 font-mono">{classObj.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Instructor:</span>
                <span className="font-bold text-slate-900">{classObj.teacher_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Subject Area:</span>
                <span className="font-bold text-slate-900">{classObj.subject}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Active Homework Assignments</h3>
              <span className="text-xs text-slate-500">{assignments.length} assigned</span>
            </div>

            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No active homework assignments yet.</p>
              ) : (
                assignments.map(asg => (
                  <div key={asg.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{asg.quiz_title}</h4>
                      <p className="text-[11px] text-slate-500">Due {new Date(asg.due_date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/quiz/${asg.quiz_id}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Start Activity
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Class Assignments List</h3>
            {isTeacher && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                + Assign New Resource
              </button>
            )}
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No homework assigned to this class yet.</p>
            ) : (
              assignments.map(asg => (
                <div key={asg.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{asg.quiz_title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Allowed Attempts: {asg.attempts_allowed} • Due: {new Date(asg.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/quiz/${asg.quiz_id}`)}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Start Activity
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900">Enrolled Students ({students.length})</h3>
          {students.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No students enrolled in this classroom yet. Share class code <span className="font-bold font-mono text-slate-900">{classObj.code}</span> to invite students.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {students.map(st => (
                <div key={st.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center space-x-3">
                  <MexoAvatar name={st.name} src={st.avatar} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.name}</p>
                    <p className="text-[10px] text-slate-500">Enrolled {new Date(st.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900">Class Leaderboard</h3>
          {classLeaderboard.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No responses submitted for this class yet. Student scores will rank here.</p>
          ) : (
            <div className="space-y-2">
              {classLeaderboard.map((row, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <MexoAvatar name={row.name} src={row.avatar} size="xs" />
                    <p className="text-xs font-bold text-slate-900">{row.name}</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#7C3AED]">{row.score} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Assign Resource to {classObj.name}</h3>
            {quizzes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Create a quiz first before assigning to class.</p>
            ) : (
              <form onSubmit={handleCreateAssignment} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Activity</label>
                  <select
                    value={selectedQuizId}
                    onChange={e => setSelectedQuizId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
                  >
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.settings.title} ({q.resource_type || 'quiz'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    Assign to Class
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
