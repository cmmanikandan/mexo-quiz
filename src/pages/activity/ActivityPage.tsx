import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Trophy,
  Users,
  FileText,
  Clock,
  Zap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { classService } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface ActivityItem {
  id: string;
  type: 'quiz_completed' | 'quiz_created' | 'class_joined' | 'assignment_submitted';
  title: string;
  subtitle: string;
  date: string;
  badgeText: string;
  badgeColor: string;
  icon: any;
  link?: string;
}

export const ActivityPage: React.FC = () => {
  useDocumentTitle('Account Activity Log — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const currentUserId = profile?.id || user?.id || '';
    const attempts = attemptService.getUserAttempts(currentUserId);
    const createdQuizzes = quizService.getAllQuizzes().filter(q => q.creator_id === currentUserId);
    const assignments = classService.getAssignments();

    const items: ActivityItem[] = [];

    // Map attempts
    attempts.forEach(a => {
      items.push({
        id: `act-att-${a.id}`,
        type: 'quiz_completed',
        title: `Completed ${a.quiz_title}`,
        subtitle: `Scored ${a.score}/${a.max_score} (${a.percentage}%) • Earned +${a.xp_earned} XP`,
        date: a.completed_at,
        badgeText: a.is_passed ? 'PASSED' : 'COMPLETED',
        badgeColor: a.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
        icon: CheckCircle2,
        link: `/result/${a.id}`,
      });
    });

    // Map created resources
    createdQuizzes.forEach(q => {
      items.push({
        id: `act-create-${q.id}`,
        type: 'quiz_created',
        title: `Created ${q.settings.title}`,
        subtitle: `${q.questions.length} questions • ${q.resource_type || 'quiz'} format`,
        date: q.created_at,
        badgeText: 'CREATED',
        badgeColor: 'bg-purple-100 text-[#7C3AED]',
        icon: BookOpen,
        link: `/quiz/${q.id}`,
      });
    });

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivityList(items);
  }, [profile, user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase">
            <ActivityIcon className="w-4 h-4" />
            <span>Activity Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Recent Learning Activity</h1>
          <p className="text-xs text-purple-100">
            Chronological history of completed quizzes, created resources, and earned achievements.
          </p>
        </div>
      </div>

      {activityList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <ActivityIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No account activity recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take a quiz, create a learning activity, or join a live session to record your progress timeline.
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] text-white text-xs font-extrabold shadow-md cursor-pointer"
          >
            Discover Quizzes
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="space-y-3">
            {activityList.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => item.link && navigate(item.link)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 rounded-2xl bg-purple-100 text-[#7C3AED] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                          {item.title}
                        </h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badgeText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
