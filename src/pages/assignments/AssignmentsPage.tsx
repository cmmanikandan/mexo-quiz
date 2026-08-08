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
} from 'lucide-react';
import { classService } from '../../services/classService';
import { HomeworkAssignment } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const AssignmentsPage: React.FC = () => {
  useDocumentTitle('Assignments & Activities — MEXO Quiz');
  const navigate = useNavigate();

  const [assignments] = useState<HomeworkAssignment[]>(() => classService.getAssignments());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Assignments List */}
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
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {asg.class_name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isDueSoon ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDueSoon ? '⚠️ Due Soon' : 'Active'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{asg.quiz_title}</h3>
                    <p className="text-xs text-slate-500">
                      Attempts allowed: <span className="font-bold text-slate-800">{asg.attempts_allowed}</span> • Late submissions: {asg.allow_late_submission ? 'Allowed' : 'Disabled'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Due {new Date(asg.due_date).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/quiz/${asg.quiz_id}`)}
                      className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Activity</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
