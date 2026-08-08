import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { QuizAttempt, Quiz } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const ReportsPage: React.FC = () => {
  useDocumentTitle('Reports & Analytics — MEXO Quiz');
  const navigate = useNavigate();

  const [attempts] = useState<QuizAttempt[]>(() => attemptService.getAllAttempts());
  const [quizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());
  const [searchQuery, setSearchQuery] = useState('');

  // Group attempts by quiz to generate reports
  const reportSummaries = quizzes.map(q => {
    const quizAttempts = attempts.filter(a => a.quiz_id === q.id);
    const totalStudents = quizAttempts.length;
    const avgScore = totalStudents > 0
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents)
      : 0;
    const passedCount = quizAttempts.filter(a => a.is_passed).length;
    const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

    return {
      quiz: q,
      totalStudents,
      avgScore,
      passRate,
      lastAttempted: quizAttempts[0]?.completed_at || q.updated_at,
    };
  });

  const filtered = reportSummaries.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.quiz.settings.title.toLowerCase().includes(q) ||
      r.quiz.settings.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>MEXO Analytics & Reports</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Performance Reports</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Auto-generated real-time analytics from student submissions stored in Supabase. Export performance data to CSV or PDF.
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
            placeholder="Search report title or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => (
          <div
            key={r.quiz.id}
            onClick={() => navigate(`/reports/${r.quiz.id}`)}
            className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] uppercase">
                  {r.quiz.settings.subject}
                </span>
                <span className="text-xs text-slate-400">{r.totalStudents} Submissions</span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                {r.quiz.settings.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</p>
                <p className="text-lg font-black text-[#7C3AED]">{r.avgScore}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</p>
                <p className="text-lg font-black text-emerald-600">{r.passRate}%</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#7C3AED]">
              <span>View Full Item Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
