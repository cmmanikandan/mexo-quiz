import { supabase } from '../lib/supabase';
import { QuizAttempt } from '../types/quiz';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  xpEarned: number;
}

export const leaderboardService = {
  /**
   * Fetch quiz-specific leaderboard from actual submitted attempts in Supabase.
   */
  async getQuizLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
    if (!quizId) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'auto_submitted'])
        .order('score', { ascending: false })
        .order('time_spent_seconds', { ascending: true });

      if (error || !data) return [];

      return data.map((item: any, idx: number) => ({
        rank: idx + 1,
        studentId: item.user_id,
        studentName: item.user_name || 'Student',
        avatarUrl: item.user_avatar,
        score: item.score || 0,
        maxScore: item.max_score || 0,
        percentage: item.percentage || 0,
        timeSpentSeconds: item.time_spent_seconds || item.time_taken_seconds || 0,
        completedAt: item.completed_at || item.submitted_at || new Date().toISOString(),
        xpEarned: item.xp_earned || 0,
      }));
    } catch (e) {
      console.error('Exception fetching quiz leaderboard from Supabase:', e);
      return [];
    }
  },

  /**
   * Fetch global platform leaderboard from Supabase profiles.
   */
  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

      if (error || !data) return [];

      return data.map((item: any, idx: number) => ({
        rank: idx + 1,
        studentId: item.id,
        studentName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username || 'Scholar',
        avatarUrl: item.avatar_url,
        score: item.xp || 0,
        maxScore: 0,
        percentage: 100,
        timeSpentSeconds: 0,
        completedAt: item.updated_at || item.created_at,
        xpEarned: item.xp || 0,
      }));
    } catch (e) {
      return [];
    }
  },
};
