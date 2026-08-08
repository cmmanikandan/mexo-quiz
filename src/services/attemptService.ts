import { Quiz, QuizAttempt, Question } from '../types/quiz';
import { supabase } from '../lib/supabase';

const ATTEMPTS_KEY = 'mexo_quiz_attempts_v1';

export const attemptService = {
  getAllAttempts(): QuizAttempt[] {
    try {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  getUserAttempts(userId: string): QuizAttempt[] {
    return this.getAllAttempts().filter(a => a.user_id === userId);
  },

  getQuizAttempts(quizId: string): QuizAttempt[] {
    return this.getAllAttempts().filter(a => a.quiz_id === quizId);
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
        const correctOpt = q.options.find(o => o.isCorrect);
        isCorrect = correctOpt ? correctOpt.id === userAnswer || correctOpt.text === userAnswer : false;
        break;
      }

      case 'multiple_select': {
        const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        if (Array.isArray(userAnswer)) {
          isCorrect =
            correctIds.length === userAnswer.length &&
            correctIds.every(id => userAnswer.includes(id));
        }
        break;
      }

      case 'fill_blank':
      case 'short_answer': {
        const accepted = q.acceptedBlanks || q.options.filter(o => o.isCorrect).map(o => o.text);
        const userStr = String(userAnswer).trim().toLowerCase();
        isCorrect = accepted.some(a => a.trim().toLowerCase() === userStr);
        break;
      }

      case 'paragraph': {
        // Teacher review / auto-award points if non-empty
        isCorrect = String(userAnswer).trim().length > 10;
        break;
      }

      case 'matching': {
        // userAnswer is Record<leftStr, rightStr>
        if (q.matchingPairs && typeof userAnswer === 'object') {
          const matchCount = q.matchingPairs.filter(p => userAnswer[p.left] === p.right).length;
          isCorrect = matchCount === q.matchingPairs.length;
        }
        break;
      }

      case 'ordering': {
        // userAnswer is Array of string items in order
        if (q.orderingSequence && Array.isArray(userAnswer)) {
          isCorrect = JSON.stringify(q.orderingSequence) === JSON.stringify(userAnswer);
        }
        break;
      }

      case 'hotspot': {
        // userAnswer is { x, y }
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
        // Poll is always recorded
        isCorrect = true;
        break;
      }

      case 'image_question':
      case 'audio_question':
      case 'video_question':
      case 'code_question':
      case 'math_formula': {
        const correctOpt = q.options.find(o => o.isCorrect);
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

    const pointsEarned = isCorrect ? q.points : 0;
    return { isCorrect, pointsEarned };
  },

  submitAttempt(
    quiz: Quiz,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    answers: Record<string, any>,
    timeSpentSeconds: number
  ): QuizAttempt {
    let earnedPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    quiz.questions.forEach(q => {
      maxPoints += q.points;
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
    const isPassed = percentage >= (quiz.settings.passingScorePercentage || 60);

    // XP calculation: 50 base XP + 10 XP per 10% accuracy + 20 bonus for passing
    const xpEarned = 50 + Math.round(percentage / 10) * 10 + (isPassed ? 20 : 0);

    const now = new Date();
    const startTimeDate = new Date(now.getTime() - timeSpentSeconds * 1000);
    const startTimeStr = startTimeDate.toISOString();
    const completedAtStr = now.toISOString();

    const existingUserAttempts = this.getQuizAttempts(quiz.id).filter(a => a.user_id === userId);
    const attemptNumber = existingUserAttempts.length + 1;

    // Calculate security metrics
    const isUnusuallyFast = timeSpentSeconds < 15;
    const tabSwitches = quiz.settings.enableTabSwitchDetection ? 0 : 0;
    const windowBlurs = 0;
    const fullscreenExits = 0;
    const speedAnomalies = isUnusuallyFast ? 1 : 0;

    let integrityScore = 100;
    if (tabSwitches > 0) integrityScore -= tabSwitches * 25;
    if (isUnusuallyFast) integrityScore -= 30;
    if (integrityScore < 0) integrityScore = 0;

    const securityStatus: 'clean' | 'flagged' | 'invalidated' = integrityScore >= 80 ? 'clean' : 'flagged';

    const securityEvents: any[] = [
      {
        id: `evt-${Date.now()}-1`,
        attempt_id: `att-${Date.now()}`,
        student_id: userId,
        quiz_id: quiz.id,
        event_type: 'quiz_started',
        event_time: startTimeStr,
        severity: 'info',
        description: 'Quiz activity session initialized',
      },
    ];

    if (isUnusuallyFast) {
      securityEvents.push({
        id: `evt-${Date.now()}-2`,
        attempt_id: `att-${Date.now()}`,
        student_id: userId,
        quiz_id: quiz.id,
        event_type: 'speed_anomaly',
        event_time: completedAtStr,
        severity: 'warning',
        description: `Unusually rapid completion (${timeSpentSeconds}s)`,
      });
    }

    securityEvents.push({
      id: `evt-${Date.now()}-3`,
      attempt_id: `att-${Date.now()}`,
      student_id: userId,
      quiz_id: quiz.id,
      event_type: 'submitted',
      event_time: completedAtStr,
      severity: 'info',
      description: 'Quiz activity submitted successfully',
    });

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quiz_id: quiz.id,
      quiz_title: quiz.settings?.title || 'Untitled Quiz',
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      score: earnedPoints,
      max_score: maxPoints,
      percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      xp_earned: xpEarned,
      time_spent_seconds: timeSpentSeconds,
      answers,
      is_passed: isPassed,
      start_time: startTimeStr,
      completed_at: completedAtStr,
      attempt_number: attemptNumber,
      tab_switch_count: tabSwitches,
      window_blur_count: windowBlurs,
      fullscreen_exit_count: fullscreenExits,
      copy_attempt_count: 0,
      paste_attempt_count: 0,
      speed_anomaly_count: speedAnomalies,
      integrity_score: integrityScore,
      security_status: securityStatus,
      security_events: securityEvents,
    };

    if (isPassed && quiz.settings.certificate?.enabled) {
      attempt.certificate_url = `CERT-${quiz.id.slice(0, 6)}-${userId.slice(0, 6)}`;
    }

    const list = this.getAllAttempts();
    list.unshift(attempt);
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list));
    } catch (e) {}

    (async () => {
      try {
        await supabase.from('quiz_attempts').insert({
          id: attempt.id,
          quiz_id: attempt.quiz_id,
          quiz_title: attempt.quiz_title,
          user_id: attempt.user_id,
          user_name: attempt.user_name,
          score: attempt.score,
          max_score: attempt.max_score,
          percentage: attempt.percentage,
          correct_count: attempt.correct_count,
          incorrect_count: attempt.incorrect_count,
          skipped_count: attempt.skipped_count,
          xp_earned: attempt.xp_earned,
          time_spent_seconds: attempt.time_spent_seconds,
          is_passed: attempt.is_passed,
          completed_at: attempt.completed_at,
        });
      } catch (e) {}
    })();

    return attempt;
  },
};
