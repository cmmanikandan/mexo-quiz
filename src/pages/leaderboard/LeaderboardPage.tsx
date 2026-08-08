import React, { useState, useEffect } from 'react';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Trophy, Flame, Award, Star, ShieldCheck, User } from 'lucide-react';
import { attemptService } from '../../services/attemptService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  streak: number;
  badge: string;
  isUser?: boolean;
}

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Global Quiz Leaderboard — MEXO Quiz');
  const { profile, user } = useAuth();

  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly' | 'global'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Query profiles ordered by XP from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url, xp, streak')
          .order('xp', { ascending: false })
          .limit(20);

        if (data && data.length > 0 && !error) {
          const mapped: LeaderboardUser[] = data.map((p, idx) => {
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username;
            const badges = ['👑', '🥇', '🥈', '🥉', '⭐'];
            return {
              rank: idx + 1,
              name: fullName,
              avatar: p.avatar_url,
              xp: p.xp || 0,
              streak: p.streak || 0,
              badge: badges[idx] || '⭐',
              isUser: p.id === (profile?.id || user?.id),
            };
          });
          setLeaderboard(mapped);
          return;
        }
      } catch (e) {}

      // Fallback: derive from local attempts
      const attempts = attemptService.getAllAttempts();
      if (attempts.length > 0) {
        const userMap: Record<string, { name: string; avatar?: string; totalScore: number }> = {};
        attempts.forEach(a => {
          if (!userMap[a.user_id]) {
            userMap[a.user_id] = { name: a.user_name, avatar: a.user_avatar, totalScore: 0 };
          }
          userMap[a.user_id].totalScore += a.xp_earned || a.score;
        });

        const sorted = Object.entries(userMap)
          .sort((a, b) => b[1].totalScore - a[1].totalScore)
          .map(([id, u], idx) => ({
            rank: idx + 1,
            name: u.name,
            avatar: u.avatar,
            xp: u.totalScore,
            streak: 1,
            badge: idx === 0 ? '👑' : idx === 1 ? '🥇' : idx === 2 ? '🥈' : '⭐',
            isUser: id === (profile?.id || user?.id),
          }));
        setLeaderboard(sorted);
      } else {
        setLeaderboard([]);
      }
    })();
  }, [profile, user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leaderboard Champions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Top scholars ranked by XP points, accuracy, and study streaks.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit text-xs font-bold shadow-xs">
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

      {leaderboard.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No leaderboard rankings available yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete quizzes and learning activities to earn XP points and claim your spot on the leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              {leaderboard.slice(0, 3).map(userItem => (
                <div
                  key={userItem.rank}
                  className={`p-5 rounded-3xl border text-center space-y-2 shadow-sm ${
                    userItem.rank === 1 ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 ring-2 ring-amber-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-2xl">{userItem.badge}</div>
                  <MexoAvatar name={userItem.name} src={userItem.avatar} size="lg" className="w-12 h-12 mx-auto border-2 border-white shadow-md" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 truncate">{userItem.name}</p>
                    <p className="text-xs font-bold text-[#7C3AED] font-mono mt-0.5">{userItem.xp} XP</p>
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">🔥 {userItem.streak}d Streak</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
            {leaderboard.map(userItem => (
              <div
                key={userItem.rank}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                  userItem.isUser ? 'bg-purple-50 border-purple-200 font-bold' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">#{userItem.rank}</span>
                  <MexoAvatar name={userItem.name} src={userItem.avatar} size="sm" className="w-8 h-8 text-xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{userItem.name}</p>
                    <p className="text-[10px] text-slate-500">🔥 {userItem.streak} days streak</p>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-xs text-[#7C3AED]">
                  {userItem.xp} XP
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
