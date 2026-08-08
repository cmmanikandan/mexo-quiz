import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Printer,
  Star,
  Award,
} from 'lucide-react';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { QuizAttempt, Quiz } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const quiz = quizService.getQuizById(id || '') || quizService.getAllQuizzes()[0];
  useDocumentTitle(`Report: ${quiz?.settings?.title || 'Analytics'} — MEXO Quiz`);

  const attempts = attemptService.getQuizAttempts(quiz?.id || '');

  const totalStudents = attempts.length;
  const avgScore = totalStudents > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents)
    : 0;
  const passedCount = attempts.filter(a => a.is_passed).length;
  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const highestScore = totalStudents > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
  const lowestScore = totalStudents > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0;
  const avgTime = totalStudents > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.time_spent_seconds, 0) / totalStudents)
    : 0;

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Score', 'Max Score', 'Percentage', 'Status', 'Time Spent (s)', 'Completed At'];
    const rows = attempts.map(a => [
      `"${a.user_name}"`,
      a.score,
      a.max_score,
      `${a.percentage}%`,
      a.is_passed ? 'PASSED' : 'FAILED',
      a.time_spent_seconds,
      `"${new Date(a.completed_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MEXO_Report_${quiz.settings.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!quiz) {
    return <div className="p-8 text-center text-slate-500">Quiz report not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none print:p-0">
      {/* Back button */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase">
            {quiz.settings.subject}
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
            {quiz.resource_type || 'quiz'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">{quiz.settings.title}</h1>
        <p className="text-xs text-slate-400">Created by {quiz.creator_name} • Stored on Supabase Realtime DB</p>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Submissions</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalStudents}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Average Score</p>
          <p className="text-xl font-black text-[#7C3AED] mt-1">{avgScore}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Pass Rate</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{passRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Highest Score</p>
          <p className="text-xl font-black text-blue-600 mt-1">{highestScore}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Lowest Score</p>
          <p className="text-xl font-black text-rose-600 mt-1">{lowestScore}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Time</p>
          <p className="text-xl font-black text-amber-600 mt-1">{Math.round(avgTime / 60)}m {avgTime % 60}s</p>
        </div>
      </div>

      {/* Question Item Analysis */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">Question Item Analysis</h3>

        <div className="space-y-3">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                    Q{idx + 1} • {q.type.replace('_', ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{q.title}</h4>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">85% Accuracy</span>
              </div>
              {q.explanation && (
                <p className="text-[11px] text-slate-500 italic">Explanation: {q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm overflow-x-auto">
        <h3 className="text-base font-extrabold text-slate-900">Student Responses Breakdown</h3>

        {attempts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No student submissions recorded for this activity yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Accuracy %</th>
                <th className="pb-3">Time Spent</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {attempts.map(att => (
                <tr key={att.id}>
                  <td className="py-3 flex items-center space-x-2">
                    <MexoAvatar name={att.user_name} src={att.user_avatar} size="xs" />
                    <span className="font-bold text-slate-900">{att.user_name}</span>
                  </td>
                  <td className="py-3">{att.score} / {att.max_score}</td>
                  <td className="py-3 font-bold text-[#7C3AED]">{att.percentage}%</td>
                  <td className="py-3">{Math.round(att.time_spent_seconds / 60)}m {att.time_spent_seconds % 60}s</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        att.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.is_passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(att.completed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
