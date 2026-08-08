import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, Question } from '../../types/quiz';
import { attemptService } from '../../services/attemptService';
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
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  X,
  Calculator,
  BookOpen,
  Grid,
  MoreVertical,
  Maximize,
  HelpCircle,
  Sparkles,
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

  const [currentIndex, setCurrentIndex] = useState(0);

  // Restore draft user answers from local storage if available
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
  const [showMobileOverflow, setShowMobileOverflow] = useState(false);

  // Timer setup: restore remaining seconds from local storage if available
  const durationSeconds = (quiz.settings?.quizDurationMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    try {
      const savedTimer = localStorage.getItem(`test_timer_${quiz.id}`);
      if (savedTimer) {
        const val = parseInt(savedTimer, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {}
    return durationSeconds;
  });

  const currentQuestion = quiz.questions[currentIndex] || quiz.questions[0];

  // Intercept window reload & back button navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leave Quiz? Your progress has been saved locally.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  // Countdown timer effect & auto-submit
  useEffect(() => {
    if (quiz.settings?.timerMode === 'none') return;

    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        const next = prev - 1;
        try {
          localStorage.setItem(`test_timer_${quiz.id}`, next.toString());
        } catch (e) {}
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, quiz.settings?.timerMode]);

  const handleSelectOption = (value: any) => {
    if (!currentQuestion) return;
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
      } catch (e) {}
      navigate('/library');
      return;
    }

    const userId = profile?.id || user?.id || 'guest';
    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
      : user?.email || 'Student';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const timeSpent = durationSeconds - secondsRemaining;
    const attempt = attemptService.submitAttempt(quiz, userId, userName, userAvatar, userAnswers, Math.max(1, timeSpent));

    try {
      localStorage.removeItem(`test_draft_${quiz.id}`);
      localStorage.removeItem(`test_timer_${quiz.id}`);
    } catch (e) {}

    setTimeout(() => {
      navigate(`/result/${attempt.id}`, { state: { attempt, quiz } });
    }, 600);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== undefined && userAnswers[k] !== '').length;
  const unansweredCount = Math.max(0, quiz.questions.length - answeredCount);
  const markedCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col select-none overflow-hidden font-sans">
      {/* Network Offline Alert */}
      {isNetworkOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-extrabold flex items-center justify-center space-x-2 shrink-0">
          <WifiOff className="w-4 h-4" />
          <span>Connection interrupted. Saved locally — retrying sync automatically.</span>
        </div>
      )}

      {/* Header Navigation Bar */}
      <header className="h-16 border-b border-slate-800/90 bg-slate-900 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Logo & Quiz Title */}
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
                Test Mode
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {quizTitle}
            </h1>
          </div>
        </div>

        {/* Right Tools Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Timer Display */}
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

          {/* Calculator Button */}
          <button
            onClick={() => setShowCalculator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Open Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden sm:block"
            title="View Instructions"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Question Navigator Grid Button */}
          <button
            onClick={() => setShowNavigator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Question Navigator Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Finish Quiz Action Button */}
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
            {/* Question Header & Type & Points Badge */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-400">
                  Question {currentIndex + 1} of {quiz.questions.length} • {currentQuestion.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-mono">
                  {currentQuestion.points} Points
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed tracking-tight">
                {currentQuestion.title}
              </h2>

              {/* Optional Question Image */}
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
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-xs font-bold cursor-pointer flex items-center space-x-1 border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === quiz.questions.length - 1 ? (
            <button
              onClick={() => setShowFinishModal(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Review & Submit</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
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
              {quiz.questions.map((q, idx) => {
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
                <p className="text-xs text-slate-400">Review your answered status before final submission.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <p className="text-xs text-slate-400 font-bold">Answered</p>
                <p className="text-lg font-black text-emerald-400">{answeredCount} / {quiz.questions.length}</p>
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
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
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
