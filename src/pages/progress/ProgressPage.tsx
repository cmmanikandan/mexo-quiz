import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Flame,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Target,
  Brain,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { progressService, StudentProgressStats, WeeklyTrendItem, SubjectMasteryItem } from '../../services/progressService';
import { certificateService } from '../../services/certificateService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const ProgressPage: React.FC = () => {
  useDocumentTitle('Student Learning Progress — MEXO Quiz');
  const { profile, user } = useAuth();

  const currentUserId = profile?.id || user?.id || '';

  const [stats, setStats] = useState<StudentProgressStats>({
    totalCompleted: 0,
    overallAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
    level: 1,
    totalPassed: 0,
  });
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendItem[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectMasteryItem[]>([]);
  const [certificatesCount, setCertificatesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStudentProgressData = async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [progStats, trend, subjects, certs] = await Promise.all([
        progressService.getStudentProgress(currentUserId),
        progressService.getWeeklyScoreTrend(currentUserId),
        progressService.getSubjectPerformance(currentUserId),
        certificateService.getUserCertificates(currentUserId),
      ]);

      setStats(progStats);
      setWeeklyTrend(trend);
      setSubjectPerformance(subjects);
      setCertificatesCount(certs.length);
    } catch (e) {
      console.error('Error loading student progress:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentProgressData();
  }, [currentUserId]);

  const userStreak = stats.currentStreak || profile?.streak || 0;
  const userLevel = stats.level || profile?.level || 1;
  const userXp = stats.totalXp || profile?.xp || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>MEXO Mastery & Progress</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Learning Progress & Mastery</h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Track your accuracy trends, subject mastery, study streaks, and earned certificates across all learning activities.
          </p>
        </div>

        {/* Streak & XP Widget */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-2 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xl mx-auto">
            ⚡
          </div>
          <p className="text-xs font-bold uppercase text-amber-200">Study Streak</p>
          <p className="text-2xl font-black text-white">{userStreak} Days</p>
          <p className="text-[10px] text-emerald-100">Level {userLevel} Scholar ({userXp} XP)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading progress from Supabase...</p>
        </div>
      ) : stats.totalCompleted === 0 ? (
        /* Empty State for New Users */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <Brain className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No learning progress recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete your first quiz, assessment, or flashcard deck to start building your personal accuracy trends and subject mastery analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Activities Completed</p>
                <p className="text-sm font-bold text-slate-900">{stats.totalCompleted} Submissions</p>
                <span className="text-[10px] font-bold text-[#7C3AED]">{stats.totalPassed} Passed</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Overall Accuracy</p>
                <p className="text-sm font-bold text-slate-900">{stats.overallAccuracy}% Average</p>
                <span className="text-[10px] font-bold text-emerald-600">From verified attempts</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Active Level</p>
                <p className="text-sm font-bold text-slate-900">Level {userLevel} Scholar</p>
                <span className="text-[10px] font-bold text-amber-600">{userXp} XP Total</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Certificates</p>
                <p className="text-sm font-bold text-slate-900">{certificatesCount} Verified</p>
                <span className="text-[10px] font-bold text-blue-600">Credentials</span>
              </div>
            </div>
          </div>

          {/* Score & Accuracy Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Line Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">Weekly Score Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#7C3AED" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Performance Bar Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">Subject Performance Breakdown</h3>
              <div className="h-64">
                {subjectPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#0878E8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No subject breakdown available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
