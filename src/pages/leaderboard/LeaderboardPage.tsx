import React, { useState } from 'react';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Trophy, Flame, Award, Star, ShieldCheck } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Global Quiz Leaderboard — MEXO Quiz');
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly' | 'global'>('weekly');

  const leaderboards = [
    { rank: 1, name: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', xp: 4820, streak: 24, badge: '👑' },
    { rank: 2, name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', xp: 4210, streak: 18, badge: '🥇' },
    { rank: 3, name: 'Prof. Sofia Rossi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', xp: 3950, streak: 14, badge: '🥈' },
    { rank: 4, name: 'Marcus Chen', xp: 3200, streak: 12, badge: '🥉' },
    { rank: 5, name: 'Sarah Jenkins', xp: 2900, streak: 9, badge: '⭐' },
    { rank: 6, name: 'David Miller', xp: 2650, streak: 7, badge: '⭐' },
    { rank: 7, name: 'MEXO Scholar (You)', xp: 1250, streak: 7, badge: '⚡', isUser: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leaderboard Champions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Top scholars ranked by XP points, accuracy, and study streaks.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit text-xs font-bold">
        {['daily', 'weekly', 'monthly', 'global'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-xl capitalize transition-all cursor-pointer ${
              tab === t ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {leaderboards.slice(0, 3).map(user => (
          <div
            key={user.rank}
            className={`p-5 rounded-3xl border text-center space-y-2 shadow-mexo-card ${
              user.rank === 1 ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 ring-2 ring-amber-300' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-2xl">{user.badge}</div>
            <MexoAvatar name={user.name} src={user.avatar} size="lg" className="w-12 h-12 mx-auto border-2 border-white shadow-md" />
            <div>
              <p className="text-xs font-extrabold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs font-bold text-[#7C3AED] font-mono mt-0.5">{user.xp} XP</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">🔥 {user.streak}d Streak</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-mexo-card space-y-2">
        {leaderboards.map(user => (
          <div
            key={user.rank}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
              user.isUser ? 'bg-purple-50 border-purple-200 font-bold' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">#{user.rank}</span>
              <MexoAvatar name={user.name} src={user.avatar} size="sm" className="w-8 h-8 text-xs" />
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">🔥 {user.streak} days streak</p>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-xs text-[#7C3AED]">
              {user.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
