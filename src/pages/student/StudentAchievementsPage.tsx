import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Trophy, Flame, Zap, Award, Target, Star, CheckCircle2 } from 'lucide-react';

export const StudentAchievementsPage: React.FC = () => {
  useDocumentTitle('Achievements & Badges — MEXO Quiz');

  const badges = [
    { title: 'Speed Demon', desc: 'Answered 5 questions in under 10 seconds each.', icon: '⚡', unlocked: true, category: 'speed' },
    { title: 'Perfectionist', desc: 'Scored 100% on 3 consecutive quizzes.', icon: '🎯', unlocked: true, category: 'accuracy' },
    { title: 'Streak Master', desc: 'Maintained a 7-day study streak.', icon: '🔥', unlocked: true, category: 'streak' },
    { title: 'Quiz Master', desc: 'Completed over 20 quizzes across 5 subjects.', icon: '👑', unlocked: false, category: 'quizzes' },
    { title: 'Leaderboard Titan', desc: 'Reached #1 on class leaderboard.', icon: '🏆', unlocked: false, category: 'social' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Achievements & Badges</h1>
        <p className="text-xs text-slate-500 mt-0.5">Unlock rewards, levels, coins, and special titles as you learn.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {badges.map((b, i) => (
          <div key={i} className={`p-6 rounded-3xl border shadow-mexo-card text-center space-y-3 ${
            b.unlocked ? 'bg-white border-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="text-4xl">{b.icon}</div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{b.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.desc}</p>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
              b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {b.unlocked ? 'Unlocked ✓' : 'Locked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
