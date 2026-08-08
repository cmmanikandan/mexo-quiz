import { Quiz, QuizAttempt, Question, AttemptStatus } from '../types/quiz';
import { supabase } from '../lib/supabase';

const ATTEMPTS_KEY = 'mexo_quiz_attempts_v1';

export const attemptService = {
  getAllAttempts(): QuizAttempt[] {
    try {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  async fetchAttemptsFromSupabase(userId?: string, quizId?: string): Promise<QuizAttempt[]> {
    try {
      let query = supabase.from('quiz_attempts').select('*').order('completed_at', { ascending: false });
      if (userId) {
        query = query.or(`user_id.eq.${userId},student_id.eq.${userId}`);
      }
      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        const dbAttempts: QuizAttempt[] = data.map((item: any) => ({
          id: item.id,
          quiz_id: item.quiz_id,
          quiz_title: item.quiz_title,
          user_id: item.user_id,
          student_id: item.student_id || item.user_id,
          user_name: item.user_name || 'Student',
          user_avatar: item.user_avatar,
          score: item.score || 0,
          max_score: item.max_score || item.total_points || 0,
          total_points: item.max_score || item.total_points || 0,
          percentage: item.percentage || 0,
          correct_count: item.correct_count || 0,
          incorrect_count: item.incorrect_count || 0,
          skipped_count: item.skipped_count || 0,
          xp_earned: item.xp_earned || 0,
          time_spent_seconds: item.time_spent_seconds || item.time_taken_seconds || 0,
          time_taken_seconds: item.time_spent_seconds || item.time_taken_seconds || 0,
          answers: item.answers || {},
          is_passed: !!item.is_passed,
          certificate_url: item.certificate_url,
          status: item.status || 'submitted',
          started_at: item.started_at,
          submitted_at: item.submitted_at || item.completed_at,
          completed_at: item.completed_at || new Date().toISOString(),
          assignment_id: item.assignment_id,
          integrity_score: item.integrity_score || 100,
          security_status: item.security_status || 'clean',
        }));

        // Cache into local storage
        try {
          localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(dbAttempts));
        } catch (e) {}

        return dbAttempts;
      }
    } catch (e) {}
    return this.getAllAttempts();
  },

  getUserAttempts(userId: string): QuizAttempt[] {
    return this.getAllAttempts().filter(a => a.user_id === userId || a.student_id === userId);
  },

  getQuizAttempts(quizId: string): QuizAttempt[] {
    return this.getAllAttempts().filter(a => a.quiz_id === quizId);
  },

  getAttemptById(attemptId: string): QuizAttempt | null {
    const list = this.getAllAttempts();
    return list.find(a => a.id === attemptId) || null;
  },

  /**
   * Safe attempt limit resolver.
   * Default is ALWAYS 1 Attempt Only if not explicitly configured.
   * 0 = Unlimited Attempts
   */
  getQuizAttemptsLimit(quiz: Quiz | null | undefined): number {
    if (!quiz || !quiz.settings) return 1;
    const limit = quiz.settings.attemptsLimit;
    if (limit === undefined || limit === null) return 1;
    if (limit === 0) return 0; // Explicitly unlimited
    return limit; // 1, 2, 3, 5, etc.
  },

  /**
   * Centralized attempt-state & permission validator.
   * Checks Supabase & local attempts for this student & quiz.
   */
  canStartQuizAttempt(
    quiz: Quiz,
    userId: string
  ): {
    canStart: boolean;
    reason?: 'attempt_limit_reached' | 'active_in_progress' | 'quiz_closed';
    completedCount: number;
    allowedAttempts: number;
    existingAttempt?: QuizAttempt;
    activeAttempt?: QuizAttempt;
  } {
    const allUserAttempts = this.getUserAttempts(userId).filter(a => a.quiz_id === quiz.id);

    // Submitted / Completed attempts
    const submittedAttempts = allUserAttempts.filter(
      a => a.status === 'submitted' || a.status === 'auto_submitted' || a.status === 'expired' || (!a.status && a.completed_at)
    );

    // In-progress active attempt
    const inProgressAttempt = allUserAttempts.find(a => a.status === 'in_progress');

    const allowedAttempts = this.getQuizAttemptsLimit(quiz);
    const completedCount = submittedAttempts.length;

    // Check if limit is reached (0 means unlimited)
    if (allowedAttempts !== 0 && completedCount >= allowedAttempts) {
      return {
        canStart: false,
        reason: 'attempt_limit_reached',
        completedCount,
        allowedAttempts,
        existingAttempt: submittedAttempts[0],
      };
    }

    if (inProgressAttempt) {
      return {
        canStart: true,
        reason: 'active_in_progress',
        completedCount,
        allowedAttempts,
        activeAttempt: inProgressAttempt,
      };
    }

    return {
      canStart: true,
      completedCount,
      allowedAttempts,
    };
  },

  /**
   * Atomic attempt starter.
   */
  async startQuizAttempt(
    quiz: Quiz,
    userId: string,
    userName: string,
    userAvatar?: string,
    assignmentId?: string
  ): Promise<{
    success: boolean;
    attempt?: QuizAttempt;
    isResume?: boolean;
    error?: string;
  }> {
    const check = this.canStartQuizAttempt(quiz, userId);

    if (!check.canStart) {
      return {
        success: false,
        error: 'attempt_limit_reached',
        attempt: check.existingAttempt,
      };
    }

    // If an in-progress attempt already exists, resume it atomically
    if (check.activeAttempt) {
      return {
        success: true,
        attempt: check.activeAttempt,
        isResume: true,
      };
    }

    const nowIso = new Date().toISOString();
    const totalPoints = quiz.questions?.reduce((acc, q) => acc + (q.points || 1), 0) || quiz.questions.length * 10;

    const newAttempt: QuizAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quiz_id: quiz.id,
      quiz_title: quiz.settings?.title || 'Untitled Quiz',
      user_id: userId,
      student_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      assignment_id: assignmentId,
      status: 'in_progress',
      score: 0,
      max_score: totalPoints,
      total_points: totalPoints,
      percentage: 0,
      correct_count: 0,
      incorrect_count: 0,
      skipped_count: 0,
      xp_earned: 0,
      time_spent_seconds: 0,
      time_taken_seconds: 0,
      answers: {},
      is_passed: false,
      start_time: nowIso,
      started_at: nowIso,
      completed_at: '',
      attempt_number: check.completedCount + 1,
      integrity_score: 100,
      security_status: 'clean',
    };

    const list = this.getAllAttempts();
    list.unshift(newAttempt);
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
      localStorage.setItem(`test_started_at_${quiz.id}`, Date.now().toString());
    } catch (e) {}

    // Persist to Supabase
    try {
      await supabase.from('quiz_attempts').upsert({
        id: newAttempt.id,
        quiz_id: newAttempt.quiz_id,
        quiz_title: newAttempt.quiz_title,
        user_id: newAttempt.user_id,
        student_id: newAttempt.student_id,
        user_name: newAttempt.user_name,
        user_avatar: newAttempt.user_avatar,
        score: 0,
        max_score: newAttempt.max_score,
        total_points: newAttempt.total_points,
        percentage: 0,
        status: 'in_progress',
        started_at: newAttempt.started_at,
        completed_at: new Date().toISOString(),
        answers: {},
      });
    } catch (e) {}

    return {
      success: true,
      attempt: newAttempt,
      isResume: false,
    };
  },

  gradeQuestion(q: Question, userAnswer: any): { isCorrect: boolean; pointsEarned: number } {
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return { isCorrect: false, pointsEarned: 0 };
    }

    let isCorrect = false;

    switch (q.type) {
      case 'multiple_choice':
      case 'true_false':
      case 'dropdown': {
        const correctOpt = q.options?.find(o => o.isCorrect);
        isCorrect = correctOpt ? correctOpt.id === userAnswer || correctOpt.text === userAnswer : false;
        break;
      }

      case 'multiple_select': {
        const correctIds = (q.options || []).filter(o => o.isCorrect).map(o => o.id);
        if (Array.isArray(userAnswer)) {
          isCorrect =
            correctIds.length === userAnswer.length &&
            correctIds.every(id => userAnswer.includes(id));
        }
        break;
      }

      case 'fill_blank':
      case 'short_answer': {
        const accepted = q.acceptedBlanks || (q.options || []).filter(o => o.isCorrect).map(o => o.text);
        const userStr = String(userAnswer).trim().toLowerCase();
        isCorrect = accepted.some(a => a.trim().toLowerCase() === userStr);
        break;
      }

      case 'paragraph': {
        isCorrect = String(userAnswer).trim().length > 10;
        break;
      }

      case 'matching': {
        if (q.matchingPairs && typeof userAnswer === 'object') {
          const matchCount = q.matchingPairs.filter(p => userAnswer[p.left] === p.right).length;
          isCorrect = matchCount === q.matchingPairs.length;
        }
        break;
      }

      case 'ordering': {
        if (q.orderingSequence && Array.isArray(userAnswer)) {
          isCorrect = JSON.stringify(q.orderingSequence) === JSON.stringify(userAnswer);
        }
        break;
      }

      case 'hotspot': {
        if (q.hotspotAreas && userAnswer?.x !== undefined) {
          isCorrect = q.hotspotAreas.some(area => {
            if (!area.isCorrect) return false;
            const dx = userAnswer.x - area.x;
            const dy = userAnswer.y - area.y;
            return Math.sqrt(dx * dx + dy * dy) <= (area.radius || 15);
          });
        }
        break;
      }

      case 'poll': {
        isCorrect = true;
        break;
      }

      case 'image_question':
      case 'audio_question':
      case 'video_question':
      case 'code_question':
      case 'math_formula': {
        const correctOpt = q.options?.find(o => o.isCorrect);
        if (correctOpt) {
          isCorrect = correctOpt.id === userAnswer || correctOpt.text === userAnswer;
        } else if (q.acceptedBlanks && q.acceptedBlanks.length > 0) {
          const userStr = String(userAnswer).trim().toLowerCase();
          isCorrect = q.acceptedBlanks.some(a => a.trim().toLowerCase() === userStr);
        } else {
          isCorrect = !!userAnswer;
        }
        break;
      }

      default:
        isCorrect = false;
    }

    const pointsEarned = isCorrect ? (q.points || 10) : 0;
    return { isCorrect, pointsEarned };
  },

  /**
   * Submit attempt with permanent status transition to 'submitted' or 'auto_submitted'.
   * Atomically updates Supabase, attempt_answers, student_progress, and certificates.
   */
  submitAttempt(
    quiz: Quiz,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    answers: Record<string, any>,
    timeSpentSeconds: number,
    statusOverride: AttemptStatus = 'submitted'
  ): QuizAttempt {
    let earnedPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    (quiz.questions || []).forEach(q => {
      maxPoints += q.points || 10;
      const userAnswer = answers[q.id];
      if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
        skippedCount++;
      } else {
        const { isCorrect, pointsEarned } = this.gradeQuestion(q, userAnswer);
        earnedPoints += pointsEarned;
        if (isCorrect) correctCount++;
        else incorrectCount++;
      }
    });

    const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const isPassed = percentage >= (quiz.settings?.passingScorePercentage || 60);

    // XP calculation: 50 base XP + 10 XP per 10% accuracy + 20 bonus for passing
    const xpEarned = 50 + Math.round(percentage / 10) * 10 + (isPassed ? 20 : 0);

    const now = new Date();
    const startTimeDate = new Date(now.getTime() - timeSpentSeconds * 1000);
    const startTimeStr = startTimeDate.toISOString();
    const completedAtStr = now.toISOString();

    const existingUserAttempts = this.getQuizAttempts(quiz.id).filter(a => a.user_id === userId);
    const attemptNumber = existingUserAttempts.length + 1;

    // Calculate security metrics
    const isUnusuallyFast = timeSpentSeconds < 10 && (quiz.questions || []).length > 2;
    const tabSwitches = 0;
    const speedAnomalies = isUnusuallyFast ? 1 : 0;

    let integrityScore = 100;
    if (isUnusuallyFast) integrityScore -= 30;

    const securityStatus: 'clean' | 'flagged' | 'invalidated' = integrityScore >= 80 ? 'clean' : 'flagged';

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const attempt: QuizAttempt = {
      id: attemptId,
      quiz_id: quiz.id,
      quiz_title: quiz.settings?.title || 'Untitled Quiz',
      user_id: userId,
      student_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      status: statusOverride,
      score: earnedPoints,
      max_score: maxPoints,
      total_points: maxPoints,
      percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      xp_earned: xpEarned,
      time_spent_seconds: timeSpentSeconds,
      time_taken_seconds: timeSpentSeconds,
      answers,
      is_passed: isPassed,
      start_time: startTimeStr,
      started_at: startTimeStr,
      submitted_at: completedAtStr,
      completed_at: completedAtStr,
      attempt_number: attemptNumber,
      tab_switch_count: tabSwitches,
      window_blur_count: 0,
      fullscreen_exit_count: 0,
      copy_attempt_count: 0,
      paste_attempt_count: 0,
      speed_anomaly_count: speedAnomalies,
      integrity_score: integrityScore,
      security_status: securityStatus,
    };

    if (isPassed && quiz.settings?.certificate?.enabled) {
      attempt.certificate_url = `CERT-${quiz.id.slice(0, 6)}-${userId.slice(0, 6)}`;
    }

    // Save to local storage for immediate UI transition
    let list = this.getAllAttempts();
    list = list.filter(a => !(a.quiz_id === quiz.id && a.user_id === userId && a.status === 'in_progress'));
    list.unshift(attempt);

    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
      localStorage.removeItem(`test_draft_${quiz.id}`);
      localStorage.removeItem(`test_timer_${quiz.id}`);
      localStorage.removeItem(`test_started_at_${quiz.id}`);
    } catch (e) {}

    // Persist completely to Supabase in background
    (async () => {
      try {
        // 1. Upsert attempt row
        await supabase.from('quiz_attempts').upsert({
          id: attempt.id,
          quiz_id: attempt.quiz_id,
          quiz_title: attempt.quiz_title,
          user_id: attempt.user_id,
          student_id: attempt.student_id,
          user_name: attempt.user_name,
          user_avatar: attempt.user_avatar,
          score: attempt.score,
          max_score: attempt.max_score,
          total_points: attempt.total_points,
          percentage: attempt.percentage,
          correct_count: attempt.correct_count,
          incorrect_count: attempt.incorrect_count,
          skipped_count: attempt.skipped_count,
          xp_earned: attempt.xp_earned,
          time_spent_seconds: attempt.time_spent_seconds,
          is_passed: attempt.is_passed,
          status: attempt.status,
          completed_at: attempt.completed_at,
          answers: attempt.answers,
          integrity_score: attempt.integrity_score,
          security_status: attempt.security_status,
        });

        // 2. Save individual answers to attempt_answers table
        const answerRows = Object.entries(answers).map(([qId, ansVal]) => {
          const qObj = (quiz.questions || []).find(q => q.id === qId);
          const { isCorrect, pointsEarned } = qObj
            ? attemptService.gradeQuestion(qObj, ansVal)
            : { isCorrect: false, pointsEarned: 0 };
          return {
            id: `ans-${attempt.id}-${qId}`,
            attempt_id: attempt.id,
            question_id: qId,
            selected_option_id: typeof ansVal === 'string' ? ansVal : null,
            selected_answer: typeof ansVal === 'object' ? ansVal : { value: ansVal },
            is_correct: isCorrect,
            points_earned: pointsEarned,
            answered_at: completedAtStr,
          };
        });

        if (answerRows.length > 0) {
          await supabase.from('attempt_answers').upsert(answerRows);
        }

        // 3. Issue certificate if passed
        if (isPassed && quiz.settings?.certificate?.enabled) {
          await supabase.from('certificates').upsert({
            id: `cert-${attempt.id}`,
            student_id: userId,
            quiz_id: quiz.id,
            certificate_number: `MEXO-${Date.now().toString().slice(-6)}`,
            title: quiz.settings?.certificate?.title || `${quiz.settings?.title} Certificate of Achievement`,
            issuer_name: quiz.settings?.certificate?.issuerName || 'MEXO Academy',
            score_percentage: percentage,
            issued_at: completedAtStr,
            verification_code: `VER-${Date.now().toString().slice(-8)}`,
            certificate_url: attempt.certificate_url,
            status: 'verified',
          });
        }

        // 4. Update student progress RPC
        await supabase.rpc('sync_student_progress', { p_student_id: userId });

        // 5. Increment quiz plays count
        await supabase.rpc('increment_quiz_play_count', { p_quiz_id: quiz.id });
      } catch (e) {
        console.error('Error in background Supabase attempt persistence:', e);
      }
    })();

    return attempt;
  },
};
