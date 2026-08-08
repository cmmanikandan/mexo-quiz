import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  HelpCircle,
} from 'lucide-react';
import { Quiz, Question } from '../../types/quiz';
import { attemptService } from '../../services/attemptService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface FullScreenTestPlayerProps {
  quiz: Quiz;
  onClose?: () => void;
}

export const FullScreenTestPlayer: React.FC<FullScreenTestPlayerProps> = ({ quiz, onClose }) => {
  useDocumentTitle(`Exam Mode: ${quiz.settings.title}`);
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);

  // Timer countdown in seconds (default 15 minutes = 900 seconds)
  const durationSeconds = (quiz.settings.quizDurationMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  const currentQuestion = quiz.questions[currentIndex] || quiz.questions[0];

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

  // Countdown timer effect
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleSelectOption = (questionId: string, value: any) => {
    const updated = { ...userAnswers, [questionId]: value };
    setUserAnswers(updated);

    // Auto-save to local recovery state immediately
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

    const userId = profile?.id || user?.id || 'guest';
    const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'Student';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const timeSpent = durationSeconds - secondsRemaining;
    const attempt = attemptService.submitAttempt(quiz, userId, userName, userAvatar, userAnswers, timeSpent);

    try {
      localStorage.removeItem(`test_draft_${quiz.id}`);
    } catch (e) {}

    setTimeout(() => {
      navigate(`/result/${attempt.id}`, { state: { attempt, quiz } });
    }, 800);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col select-none overflow-hidden font-sans">
      {/* Network Reconnect Banner */}
      {isNetworkOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-extrabold flex items-center justify-center space-x-2 animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>Connection interrupted. Retrying automatically... Answers saved locally.</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="MEXO" className="w-7 h-7 object-contain" />
          <div>
            <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Formal Assessment</span>
            <h1 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">{quiz.settings.title}</h1>
          </div>
        </div>

        {/* Question Counter & Timer */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-xs font-bold text-slate-400">
            Question <span className="text-white font-extrabold">{currentIndex + 1}</span> of {quiz.questions.length}
          </div>

          <div
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-black border flex items-center space-x-1.5 ${
              secondsRemaining < 120
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-yellow-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Test Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Title & Points */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 uppercase tracking-wider">
                Question {currentIndex + 1} • {currentQuestion.type.replace('_', ' ')}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mt-2">
                {currentQuestion.title}
              </h2>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 shrink-0">
              {currentQuestion.points} Points
            </span>
          </div>

          {/* Question Media if present */}
          {currentQuestion.mediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-64 bg-slate-900 flex items-center justify-center">
              <img src={currentQuestion.mediaUrl} alt="Question Media" className="max-h-64 object-contain" />
            </div>
          )}

          {/* Options Display */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, optIdx) => {
              const selected = userAnswers[currentQuestion.id] === opt.id || userAnswers[currentQuestion.id] === opt.text;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selected
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md ring-2 ring-purple-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        selected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {selected && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="h-20 border-t border-slate-800 bg-slate-900 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleMarkForReview(currentQuestion.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              markedForReview[currentQuestion.id]
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>

          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            Navigator ({Object.keys(userAnswers).length} / {quiz.questions.length})
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-bold cursor-pointer flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
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

      {/* Question Navigator Drawer */}
      {showNavigator && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Question Navigator</h3>
              <button onClick={() => setShowNavigator(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
              {quiz.questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
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
                        ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400'
                        : isAnswered
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : isMarked
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {isAnswered && <span className="text-[9px] font-extrabold text-emerald-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
