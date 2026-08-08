import { supabase } from '../lib/supabase';
import { QuizAttempt } from '../types/quiz';

export interface StudentProgressStats {
  totalCompleted: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  totalPassed: number;
}

export interface WeeklyTrendItem {
  date: string;
  dayName: string;
  score: number;
  attemptsCount: number;
}

export interface SubjectMasteryItem {
  subject: string;
  score: number;
  count: number;
}

export const progressService = {
  /**
   * Fetch real student progress statistics directly from Supabase.
   */
  async getStudentProgress(studentId: string): Promise<StudentProgressStats> {
    if (!studentId) {
      return {
        totalCompleted: 0,
        overallAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXp: 0,
        level: 1,
        totalPassed: 0,
      };
    }

    try {
      // 1. Fetch submitted attempts from quiz_attempts
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', studentId)
        .in('status', ['submitted', 'auto_submitted']);

      if (error || !attempts || attempts.length === 0) {
        return {
          totalCompleted: 0,
          overallAccuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalXp: 0,
          level: 1,
          totalPassed: 0,
        };
      }

      const totalCompleted = attempts.length;
      const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const totalMaxScore = attempts.reduce((acc, curr) => acc + (curr.max_score || 0), 0);
      const totalXp = attempts.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0);
      const totalPassed = attempts.filter(a => a.is_passed).length;

      const overallAccuracy = totalMaxScore > 0
        ? Math.round((totalScore / totalMaxScore) * 100)
        : Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalCompleted);

      const level = Math.max(1, Math.floor(totalXp / 250) + 1);

      // Calculate streak from distinct completed dates
      const distinctDates = new Set(
        attempts.map(a => new Date(a.completed_at || a.submitted_at).toISOString().slice(0, 10))
      );
      const currentStreak = distinctDates.size;

      return {
        totalCompleted,
        overallAccuracy,
        currentStreak,
        longestStreak: currentStreak,
        totalXp,
        level,
        totalPassed,
      };
    } catch (e) {
      console.error('Exception in getStudentProgress:', e);
      return {
        totalCompleted: 0,
        overallAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXp: 0,
        level: 1,
        totalPassed: 0,
      };
    }
  },

  /**
   * Calculate real weekly score trend (Sun-Sat) from actual Supabase attempts.
   * Days with no activity return score 0 (NO mock data).
   */
  async getWeeklyScoreTrend(studentId: string): Promise<WeeklyTrendItem[]> {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (!studentId) {
      return daysOfWeek.map((day, idx) => ({
        date: day,
        dayName: fullDays[idx],
        score: 0,
        attemptsCount: 0,
      }));
    }

    try {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', studentId)
        .in('status', ['submitted', 'auto_submitted']);

      const attemptsList = attempts || [];

      return daysOfWeek.map((day, idx) => {
        const dayAttempts = attemptsList.filter(a => {
          const d = new Date(a.completed_at || a.submitted_at);
          return d.getDay() === idx;
        });

        const score = dayAttempts.length > 0
          ? Math.round(dayAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / dayAttempts.length)
          : 0;

        return {
          date: day,
          dayName: fullDays[idx],
          score,
          attemptsCount: dayAttempts.length,
        };
      });
    } catch (e) {
      return daysOfWeek.map((day, idx) => ({
        date: day,
        dayName: fullDays[idx],
        score: 0,
        attemptsCount: 0,
      }));
    }
  },

  /**
   * Calculate subject performance breakdown directly from Supabase attempts.
   */
  async getSubjectPerformance(studentId: string): Promise<SubjectMasteryItem[]> {
    if (!studentId) return [];

    try {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', studentId)
        .in('status', ['submitted', 'auto_submitted']);

      if (!attempts || attempts.length === 0) return [];

      const map: Record<string, { totalPct: number; count: number }> = {};

      attempts.forEach(a => {
        const title = (a.quiz_title || '').toLowerCase();
        let subj = 'General';
        if (title.includes('math') || title.includes('geometry') || title.includes('algebra')) subj = 'Mathematics';
        else if (title.includes('science') || title.includes('physics') || title.includes('bio') || title.includes('chem')) subj = 'Science';
        else if (title.includes('code') || title.includes('web') || title.includes('program') || title.includes('tech')) subj = 'Technology';
        else if (title.includes('history') || title.includes('world') || title.includes('geography')) subj = 'History';
        else if (title.includes('english') || title.includes('language') || title.includes('grammar')) subj = 'Languages';

        if (!map[subj]) map[subj] = { totalPct: 0, count: 0 };
        map[subj].totalPct += a.percentage || 0;
        map[subj].count += 1;
      });

      return Object.entries(map).map(([subject, data]) => ({
        subject,
        score: Math.round(data.totalPct / data.count),
        count: data.count,
      }));
    } catch (e) {
      return [];
    }
  },
};
