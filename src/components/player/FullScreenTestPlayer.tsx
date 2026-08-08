import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, Question, QuestionOption } from '../../types/quiz';
import { attemptService } from '../../services/attemptService';
import { audioService } from '../../utils/audioService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { QuestionRenderers } from './QuestionRenderers';
import { CalculatorModal } from '../common/CalculatorModal';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Send,
  WifiOff,
  X,
  Calculator,
  BookOpen,
  Grid,
  ShieldAlert,
  Lock,
  Play,
  Sparkles,
  Award,
} from 'lucide-react';

interface FullScreenTestPlayerProps {
  quiz: Quiz;
  onClose?: () => void;
  isTeacherPreview?: boolean;
}

export const FullScreenTestPlayer: React.FC<FullScreenTestPlayerProps> = ({
  quiz,
  onClose,
  isTeacherPreview = false,
}) => {
  const quizTitle = quiz.settings?.title || 'Untitled Quiz';
  useDocumentTitle(`${isTeacherPreview ? '[PREVIEW] ' : ''}Exam Mode: ${quizTitle}`);
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  // State machine for start flow: 'welcome' | 'countdown' | 'in_progress' | 'submitted'
  const [sessionState, setSessionState] = useState<'welcome' | 'countdown' | 'in_progress' | 'submitted'>(() => {
    if (isTeacherPreview) return 'in_progress';
    try {
      const savedStart = localStorage.getItem(`test_started_at_${quiz.id}`);
      if (savedStart) return 'in_progress';
    } catch (e) {}
    return 'welcome';
  });

  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [isStarting, setIsStarting] = useState(false);

  // Prepared shuffled questions & options for this session
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => {
    let qList = [...quiz.questions];

    // 1. Shuffle Questions if setting enabled
    if (quiz.settings?.shuffleQuestions) {
      qList = [...qList].sort(() => Math.random() - 0.5);
    }

    // 2. Shuffle Options per question if setting enabled
    if (quiz.settings?.shuffleOptions) {
      qList = qList.map(q => ({
        ...q,
        options: [...(q.options || [])].sort(() => Math.random() - 0.5),
      }));
    }

    return qList;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Restore draft user answers from local storage
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(`test_draft_${quiz.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);

  // Anti-Cheating violation tracking
  const [cheatingViolations, setCheatingViolations] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const maxAllowedViolations = quiz.settings?.maxAllowedViolations || 3;
  const isAntiCheatingEnabled = !!quiz.settings?.enableTabSwitchDetection && !isTeacherPreview;

  // Timestamp-based resilient timer
  const durationSeconds = (quiz.settings?.quizDurationMinutes || 15) * 60;
  const [startedAtTimestamp, setStartedAtTimestamp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`test_started_at_${quiz.id}`);
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return Date.now();
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (quiz.settings?.timerMode === 'none') return durationSeconds;
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAtTimestamp) / 1000));
    return Math.max(0, durationSeconds - elapsed);
  });

  const currentQuestion = sessionQuestions[currentIndex] || sessionQuestions[0];

  // Intercept window reload & back button navigation
  useEffect(() => {
    if (sessionState !== 'in_progress') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leave Quiz? Your progress has been saved locally.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionState]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsNetworkOffline(false);
    const handleOffline = () => setIsNetworkOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Anti-Cheating: Tab Switch & Window Blur Detection
  useEffect(() => {
    if (!isAntiCheatingEnabled || sessionState !== 'in_progress') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatingViolations(prev => {
          const next = prev + 1;
          setShowCheatingWarning(true);
          if (next >= maxAllowedViolations) {
            handleFinalSubmit();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAntiCheatingEnabled, maxAllowedViolations, sessionState]);

  // Resilient Timestamp-Based Timer Loop
  useEffect(() => {
    if (sessionState !== 'in_progress' || quiz.settings?.timerMode === 'none') return;

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAtTimestamp) / 1000));
      const remaining = Math.max(0, durationSeconds - elapsed);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleFinalSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState, startedAtTimestamp, durationSeconds, quiz.settings?.timerMode]);

  // Intercept Android & Browser Back Button during active test
  useEffect(() => {
    if (sessionState === 'in_progress') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [sessionState]);

  // Start Quiz Handler (Launches 3-2-1 Countdown & Atomic Start)
  const handlePressStartQuiz = async () => {
    if (isStarting) return;
    setIsStarting(true);

    const userId = profile?.id || user?.id || 'guest';
    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
      : user?.email || 'Student';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

    // Atomic start attempt
    const res = await attemptService.startQuizAttempt(quiz, userId, userName, userAvatar);
    if (!res.success && res.error === 'attempt_limit_reached') {
      setIsStarting(false);
      return;
    }

    setSessionState('countdown');

    let count = 3;
    setCountdownNum(3);
    audioService.playTickSound();

    const timer = setInterval(() => {
      count -= 1;
      if (count === 0) {
        setCountdownNum('GO!');
        audioService.playCorrectSound();
      } else if (count < 0) {
        clearInterval(timer);
        const now = Date.now();
        setStartedAtTimestamp(now);
        try {
          localStorage.setItem(`test_started_at_${quiz.id}`, now.toString());
        } catch (e) {}
        setSessionState('in_progress');
        setIsStarting(false);
      } else {
        setCountdownNum(count);
        audioService.playTickSound();
      }
    }, 1000);
  };

  const handleSelectOption = (value: any) => {
    if (!currentQuestion) return;
    audioService.playTickSound();
    const updated = { ...userAnswers, [currentQuestion.id]: value };
    setUserAnswers(updated);

    try {
      localStorage.setItem(`test_draft_${quiz.id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (isTeacherPreview) {
      try {
        localStorage.removeItem(`test_draft_${quiz.id}`);
        localStorage.removeItem(`test_timer_${quiz.id}`);
        localStorage.removeItem(`test_started_at_${quiz.id}`);
      } catch (e) {}
      navigate('/library', { replace: true });
      return;
    }

    const userId = profile?.id || user?.id || 'guest';
    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
      : user?.email || 'Student';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const timeSpent = Math.max(1, Math.floor((Date.now() - startedAtTimestamp) / 1000));
    const attempt = attemptService.submitAttempt(quiz, userId, userName, userAvatar, userAnswers, timeSpent, 'submitted');

    // Play Victory Audio
    audioService.playVictoryFanfare();

    try {
      localStorage.removeItem(`test_draft_${quiz.id}`);
      localStorage.removeItem(`test_timer_${quiz.id}`);
      localStorage.removeItem(`test_started_at_${quiz.id}`);
    } catch (e) {}

    // Replace history entry so Android/browser Back button cannot reopen the test
    setTimeout(() => {
      navigate(`/result/${attempt.id}`, { state: { attempt, quiz }, replace: true });
    }, 400);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== undefined && userAnswers[k] !== '').length;
  const unansweredCount = Math.max(0, sessionQuestions.length - answeredCount);
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  const currentUserId = profile?.id || user?.id || 'guest';
  const canStartCheck = attemptService.canStartQuizAttempt(quiz, currentUserId);
  const isAttemptLimitReached = !isTeacherPreview && !canStartCheck.canStart;

  if (isAttemptLimitReached) {
    const lastAttempt = canStartCheck.existingAttempt;
    return (
      <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Quiz Completed ✓</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have already used your only attempt ({canStartCheck.completedCount} of {canStartCheck.allowedAttempts === 0 ? 'Unlimited' : `${canStartCheck.allowedAttempts} attempt`} used). Your submission has been recorded successfully.
            </p>
          </div>

          {lastAttempt && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Your Last Submission Score</span>
              <p className="text-3xl font-black text-purple-400 font-mono">
                {lastAttempt.score} / {lastAttempt.max_score} ({lastAttempt.percentage}%)
              </p>
              <p className="text-[11px] text-slate-400">
                Completed on {new Date(lastAttempt.completed_at || lastAttempt.submitted_at || Date.now()).toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {lastAttempt && (
              <button
                onClick={() => navigate(`/result/${lastAttempt.id}`, { state: { attempt: lastAttempt, quiz }, replace: true })}
                className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>View Result</span>
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 13. ASSIGNED QUIZ WELCOME SCREEN */
  if (sessionState === 'welcome') {
    const questionsCount = quiz.questions?.length || 0;
    const totalPoints = quiz.questions?.reduce((acc, q) => acc + (q.points || 1), 0) || questionsCount;
    const durationMins = quiz.settings?.quizDurationMinutes || 10;
    const attemptsLimit = attemptService.getQuizAttemptsLimit(quiz);
    const passingScore = quiz.settings?.passingScorePercentage || 60;
    const isResume = canStartCheck.reason === 'active_in_progress';

    return (
      <div className="fixed inset-0 bg-slate-950 text-white z-50 flex items-center justify-center p-4 select-none font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 absolute top-0 left-0 right-0" />

          <div className="flex items-center justify-center space-x-2 pt-2">
            <img src="/logo.png" alt="MEXO" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black tracking-tight">
              MEXO <span className="text-[#7C3AED]">Quiz</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{quizTitle}</h1>
            <p className="text-xs text-purple-200 font-mono font-bold">
              {quiz.settings?.subject || 'General'} • {quiz.resource_type || 'Quiz'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
              <p className="text-lg font-black text-white mt-0.5">{questionsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Points</p>
              <p className="text-lg font-black text-amber-400 mt-0.5">{totalPoints}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
              <p className="text-lg font-black text-purple-400 mt-0.5">{durationMins} Mins</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Allowed Attempts:</span>
              <span className="font-bold text-amber-300">{attemptsLimit === 0 ? 'Unlimited' : `${attemptsLimit} Attempt Only`}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Passing Score:</span>
              <span className="font-bold text-emerald-400">{passingScore}%</span>
            </div>
          </div>

          {isResume ? (
            <p className="text-xs text-amber-200 bg-amber-950/60 p-3 rounded-2xl border border-amber-800/60 font-semibold">
              🔔 You have an unfinished attempt in progress. Click below to resume your test.
            </p>
          ) : (
            <p className="text-xs text-purple-200 bg-purple-950/60 p-3 rounded-2xl border border-purple-800/60">
              🔔 Your attempt & timer will begin only after you press <span className="font-bold text-white">{isResume ? 'Resume Quiz' : 'Start Quiz'}</span>.
            </p>
          )}

          <button
            onClick={handlePressStartQuiz}
            disabled={isStarting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-75"
          >
            {isStarting ? (
              <span>Starting...</span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{isResume ? 'Resume Quiz' : 'Start Quiz'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* 15. 3-2-1 COUNTDOWN SCREEN */
  if (sessionState === 'countdown') {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col items-center justify-center p-4 select-none font-sans">
        <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
          <p className="text-sm font-black uppercase tracking-widest text-purple-400">GET READY</p>
          <div className="w-40 h-40 rounded-full bg-purple-600/20 border-4 border-[#7C3AED] flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30">
            <span className="text-7xl font-black text-white font-mono animate-pulse">{countdownNum}</span>
          </div>
          <p className="text-xs text-slate-400">Your exam session is starting now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col select-none overflow-hidden font-sans">
      {/* Anti-Cheating Violation Warning Banner */}
      {showCheatingWarning && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shrink-0 shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-yellow-300" />
            <span>
              ⚠️ Anti-Cheating Violation: Tab switch detected! (Attempt {cheatingViolations} of {maxAllowedViolations})
            </span>
          </div>
          <button
            onClick={() => setShowCheatingWarning(false)}
            className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-extrabold"
          >
            Acknowledge
          </button>
        </div>
      )}
      {isNetworkOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-extrabold flex items-center justify-center space-x-2 shrink-0">
          <WifiOff className="w-4 h-4" />
          <span>Connection interrupted. Saved locally — retrying sync automatically.</span>
        </div>
      )}

      {/* Header Navigation Bar */}
      <header className="h-16 border-b border-slate-800/90 bg-slate-900 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <img src="/logo.png" alt="MEXO Quiz" className="w-7 h-7 object-contain shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              {isTeacherPreview && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                  Preview Mode
                </span>
              )}
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest hidden sm:inline">
                Exam Mode
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {quizTitle}
            </h1>
          </div>
        </div>

        {/* Right Tools Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {quiz.settings?.timerMode !== 'none' && (
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border flex items-center space-x-1.5 ${
                secondsRemaining < 60
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                  : secondsRemaining < 180
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-yellow-400 border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={() => setShowCalculator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Open Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInstructions(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden sm:block"
            title="View Instructions"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowNavigator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Question Navigator Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFinishModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Finish Quiz
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Test"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Centered Question Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col justify-between select-text">
        {currentQuestion && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-400">
                  Question {currentIndex + 1} of {sessionQuestions.length} • {currentQuestion.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-mono">
                  {currentQuestion.points} Points
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed tracking-tight">
                {currentQuestion.title}
              </h2>

              {currentQuestion.mediaUrl && (
                <div
                  onClick={() => setZoomedImage(currentQuestion.mediaUrl || null)}
                  className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 cursor-pointer group flex items-center justify-center max-h-64"
                >
                  <img
                    src={currentQuestion.mediaUrl}
                    alt="Question Media"
                    className="max-h-60 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              )}

              {/* Question Renderers Component */}
              <QuestionRenderers
                question={currentQuestion}
                userAnswer={userAnswers[currentQuestion.id]}
                onChangeAnswer={handleSelectOption}
                isDarkTheme={true}
                showImmediateFeedback={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Action Navigation Bar */}
      <footer className="h-20 border-t border-slate-800 bg-slate-900 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleMarkForReview(currentQuestion.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              markedForReview[currentQuestion.id]
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">
              {markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              audioService.playNextQuestionSound();
              setCurrentIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0 || quiz.settings?.attemptsLimit === 1}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-xs font-bold cursor-pointer flex items-center space-x-1 border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === sessionQuestions.length - 1 ? (
            <button
              onClick={() => setShowFinishModal(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Review & Submit</span>
            </button>
          ) : (
            <button
              onClick={() => {
                audioService.playNextQuestionSound();
                setCurrentIndex(prev => Math.min(sessionQuestions.length - 1, prev + 1));
              }}
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* Question Navigator Grid Modal */}
      {showNavigator && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Question Navigator Grid</h3>
              <button onClick={() => setShowNavigator(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {sessionQuestions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                const isMarked = markedForReview[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavigator(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                      currentIndex === idx
                        ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                        : isMarked
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {isAnswered && <span className="text-[9px] font-black text-emerald-400">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between font-bold">
              <span className="text-purple-400">● Current</span>
              <span className="text-emerald-400">● Answered ({answeredCount})</span>
              <span className="text-amber-400">● Marked ({markedCount})</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Quiz Instructions</h3>
              <button onClick={() => setShowInstructions(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {quiz.settings?.instructions || quiz.settings?.description || 'Read all questions carefully before selecting your answers.'}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-extrabold cursor-pointer"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish & Review Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-900/60 text-purple-300">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Submit Quiz Assessment?</h3>
                <p className="text-xs text-slate-400">
                  You have answered <span className="font-bold text-white">{answeredCount}</span> of{' '}
                  <span className="font-bold text-white">{sessionQuestions.length}</span> questions. Once submitted, you cannot change your answers.
                </p>
              </div>
            </div>

            {attemptService.getQuizAttemptsLimit(quiz) === 1 && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⚠️ You have 1 attempt only. Once submitted, you cannot return to this test.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <p className="text-xs text-slate-400 font-bold">Answered</p>
                <p className="text-lg font-black text-emerald-400">{answeredCount} / {sessionQuestions.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">Unanswered</p>
                <p className="text-lg font-black text-rose-400">{unansweredCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">Marked</p>
                <p className="text-lg font-black text-amber-400">{markedCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowFinishModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}

      {/* Zoomed Image Preview Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={zoomedImage} alt="Enlarged Media" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
