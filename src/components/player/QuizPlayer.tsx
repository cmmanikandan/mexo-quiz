import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { attemptService } from '../../services/attemptService';
import { useAuth } from '../../contexts/AuthContext';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useTimer } from '../../hooks/useTimer';
import { QuestionRenderers } from './QuestionRenderers';
import { CalculatorModal } from '../common/CalculatorModal';
import { MathFormulaModal } from '../common/MathFormulaModal';
import { MexoButton } from '../common/MexoButton';
import { MexoModal } from '../common/MexoModal';
import { FullScreenTestPlayer } from './FullScreenTestPlayer';
import { LessonPlayer } from './LessonPlayer';
import { FlashcardPlayer } from './FlashcardPlayer';
import { InteractiveVideoPlayer } from './InteractiveVideoPlayer';
import {
  Clock, Maximize2, Minimize2, Flag, Calculator, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Grid
} from 'lucide-react';

export const QuizPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  const searchParams = new URLSearchParams(location.search);
  const isTestModeParam = searchParams.get('mode') === 'test';
  const isPreviewParam = searchParams.get('preview') === 'true';

  const [quiz, setQuiz] = useState<Quiz | null>(() => quizService.getQuizById(id || ''));

  useEffect(() => {
    if (id && !quiz) {
      quizService.fetchQuizById(id).then(fetched => {
        if (fetched) setQuiz(fetched);
      });
    }
  }, [id, quiz]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime] = useState(Date.now());

  // Duration in seconds
  const totalDuration = (quiz?.settings.quizDurationMinutes || 10) * 60;
  const { remainingSeconds, formatTime } = useTimer(totalDuration, () => {
    handleSubmitQuiz();
  });

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
        <MexoButton variant="purple" onClick={() => navigate('/library')}>Back to Library</MexoButton>
      </div>
    );
  }

  // Delegate to FullScreenTestPlayer for assessments or test mode
  if (quiz.resource_type === 'assessment' || isTestModeParam) {
    return <FullScreenTestPlayer quiz={quiz} onClose={() => navigate('/')} isTeacherPreview={isPreviewParam} />;
  }

  // For normal quizzes launched in preview mode, also use FullScreenTestPlayer
  if (isPreviewParam) {
    return <FullScreenTestPlayer quiz={quiz} onClose={() => navigate(-1 as any)} isTeacherPreview={true} />;
  }

  if (quiz.resource_type === 'lesson') {
    return <LessonPlayer quiz={quiz} />;
  }

  if (quiz.resource_type === 'flashcards') {
    return <FlashcardPlayer quiz={quiz} />;
  }

  if (quiz.resource_type === 'interactive_video') {
    return <InteractiveVideoPlayer quiz={quiz} />;
  }

  const currentQ = quiz.questions[currentIndex] || quiz.questions[0];
  const progressPct = quiz.questions.length > 0 ? Math.round(((currentIndex + 1) / quiz.questions.length) * 100) : 100;
  const quizTitle = quiz.settings?.title || 'Untitled Quiz';

  const handleAnswerChange = (ans: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitQuiz = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const attempt = attemptService.submitAttempt(
      quiz,
      profile?.id || 'guest',
      profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'Guest User',
      profile?.avatar_url,
      userAnswers,
      timeSpent
    );
    if (isFullscreen) exitFullscreen();
    navigate(`/result/${attempt.id}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col select-none overflow-hidden">
      {/* Player Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img src="/logo.png" alt="MEXO Quiz" className="w-7 h-7 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {quizTitle}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>
        </div>

        {/* Timer & Tools */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {quiz.settings.timerMode !== 'none' && (
            <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-black border ${
              remainingSeconds < 60
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-purple-950/80 border-purple-800 text-purple-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{formatTime()}</span>
            </div>
          )}

          <button
            onClick={() => setShowCalculator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFormulaSheet(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden sm:block"
            title="Formula Sheet"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowPalette(!showPalette)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={isFullscreen ? exitFullscreen : () => enterFullscreen()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden sm:block cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Finish Quiz
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1 shrink-0">
        <div className="bg-gradient-to-r from-[#7C3AED] to-[#0878E8] h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Main Scrollable Content */}
      {currentQ && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
          <div className="space-y-5 pb-8">
            {/* Question Header Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-400">
                  Question {currentIndex + 1} of {quiz.questions.length} · {currentQ.type.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-mono">
                    {currentQ.points} Pts
                  </span>
                  <button
                    onClick={() => toggleFlag(currentQ.id)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      flaggedQuestions[currentQ.id]
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Flag question for review"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed tracking-tight">
                {currentQ.title}
              </h2>

              {/* Question Image */}
              {currentQ.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 max-h-64 flex items-center justify-center">
                  <img src={currentQ.mediaUrl} alt="Question Media" className="max-h-60 object-contain w-full" />
                </div>
              )}

              {/* Question Renderers */}
              <QuestionRenderers
                question={currentQ}
                userAnswer={userAnswers[currentQ.id]}
                onChangeAnswer={handleAnswerChange}
                isDarkTheme={true}
              />
            </div>
          </div>
        </main>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <footer className="h-20 border-t border-slate-800 bg-slate-900 px-4 sm:px-8 flex items-center justify-between shrink-0 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-xs font-bold cursor-pointer flex items-center space-x-1 border border-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Review & Submit</span>
          </button>
        )}
      </footer>

      {/* Question Palette Modal */}
      <MexoModal isOpen={showPalette} onClose={() => setShowPalette(false)} title="Question Overview Grid" maxWidth="md">
        <div className="grid grid-cols-5 gap-2 pt-2">
          {quiz.questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isFlagged = flaggedQuestions[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowPalette(false);
                }}
                className={`h-10 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-purple-500 bg-purple-600 text-white'
                    : isAnswered
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{idx + 1}</span>
                {isFlagged && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </MexoModal>

      {/* Submit Confirmation Modal */}
      <MexoModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Quiz Attempt?" maxWidth="sm">
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-600">
            You have answered <span className="font-bold text-slate-900">{Object.keys(userAnswers).length}</span> of{' '}
            <span className="font-bold text-slate-900">{quiz.questions.length}</span> questions.
          </p>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <MexoButton variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
              Continue Quiz
            </MexoButton>
            <MexoButton variant="purple" size="sm" onClick={handleSubmitQuiz}>
              Submit Now
            </MexoButton>
          </div>
        </div>
      </MexoModal>

      <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <MathFormulaModal isOpen={showFormulaSheet} onClose={() => setShowFormulaSheet(false)} />
    </div>
  );
};
