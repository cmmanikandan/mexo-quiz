import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Key,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { classService } from '../../services/classService';
import { ClassRoom } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const ClassesPage: React.FC = () => {
  useDocumentTitle('MEXO Classrooms — Unified Class Management');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [classes, setClasses] = useState<ClassRoom[]>(() => classService.getClasses());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create Form State
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [grade, setGrade] = useState('High School');
  const [description, setDescription] = useState('');

  // Join Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ success?: boolean; text?: string }>({});

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User';

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newCls = classService.addClass({
      name: className.trim(),
      subject,
      grade,
      description,
      teacher_id: currentUserId,
      teacher_name: currentUserName,
    });

    setClasses(classService.getClasses());
    setShowCreateModal(false);
    setClassName('');
    setDescription('');
    navigate(`/classes/${newCls.id}`);
  };

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const res = classService.joinClassByCode(joinCode.trim(), currentUserId, currentUserName);
    if (res.success && res.classObj) {
      setJoinMsg({ success: true, text: res.message });
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinCode('');
        setJoinMsg({});
        navigate(`/classes/${res.classObj!.id}`);
      }, 1000);
    } else {
      setJoinMsg({ success: false, text: res.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>MEXO Classrooms</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Classes & Classroom Hub</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Create classrooms to assign activities and track performance, or join classes with a 6-character code using the same MEXO account.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-blue-700" />
            <span>Create Class</span>
          </button>
        </div>
      </div>

      {/* Class List Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Your Active Classrooms</h2>

        {classes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No active classrooms</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a classroom to assign homework to students or join an existing teacher class using a code.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => {
              const isTeacher = cls.teacher_id === currentUserId || cls.teacher_name === currentUserName;
              return (
                <div
                  key={cls.id}
                  onClick={() => navigate(`/classes/${cls.id}`)}
                  className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold font-mono uppercase">
                        Code: {cls.code}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isTeacher ? 'bg-purple-100 text-[#7C3AED]' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                      {cls.name}
                    </h3>

                    {cls.description && <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.students_count} Students</span>
                    </span>
                    <span className="text-[#7C3AED] flex items-center space-x-1">
                      <span>Enter Class</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Create New Classroom</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Classroom Name *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="e.g. Physics Honors 302"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Class guidelines or summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Join Classroom with Code</h3>
            <form onSubmit={handleJoinClass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter Class Code *</label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-401 or MX-8492"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-base font-extrabold text-center tracking-widest font-mono uppercase focus:border-[#7C3AED] outline-hidden"
                />
              </div>

              {joinMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    joinMsg.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  {joinMsg.text}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinMsg({});
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Join Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
