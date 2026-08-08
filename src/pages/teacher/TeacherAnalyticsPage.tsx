import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

export const TeacherAnalyticsPage: React.FC = () => {
  useDocumentTitle('Analytics & Class Reports — Teacher Dashboard');

  const quizPerformanceData = [
    { name: 'Quantum Physics', plays: 1420, avgScore: 84 },
    { name: 'JS Mastery', plays: 3890, avgScore: 88 },
    { name: 'World Capitals', plays: 5120, avgScore: 92 },
  ];

  const gradeDistribution = [
    { name: 'A Grade (90%+)', value: 45, fill: '#10b981' },
    { name: 'B Grade (80%+)', value: 30, fill: '#0878E8' },
    { name: 'C Grade (70%+)', value: 15, fill: '#7C3AED' },
    { name: 'Needs Practice (<70%)', value: 10, fill: '#f43f5e' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Mastery Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">Comprehensive performance analytics, item discrimination, and grade trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Quiz Completion & Plays</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizPerformanceData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="plays" fill="#7C3AED" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Grade & Score Distribution</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
