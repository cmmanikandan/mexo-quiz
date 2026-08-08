import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  Clock, Maximize2, Minimize2, Flag, Calculator, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Grid
} from 'lucide-react';

export const QuizPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  const [quiz, setQuiz] = useState<Quiz | null>(() => quizService.getQuizById(id || ''));
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
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Quiz Not Found</h2>
        <MexoButton variant="purple" onClick={() => navigate('/library')}>Back to Library</MexoButton>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col select-none">
      {/* Player Distraction-Free Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="MEXO Quiz" className="w-7 h-7 object-contain" />
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {quiz.settings.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>
        </div>

        {/* Timer & Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {quiz.settings.timerMode !== 'none' && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-200 text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>{formatTime()}</span>
            </div>
          )}

          <button
            onClick={() => setShowCalculator(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFormulaSheet(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Formula Sheet"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowPalette(!showPalette)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={isFullscreen ? exitFullscreen : () => enterFullscreen()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <MexoButton variant="purple" size="xs" onClick={() => setShowSubmitModal(true)}>
            Finish Quiz
          </MexoButton>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1">
        <div className="bg-gradient-to-r from-[#7C3AED] to-[#0878E8] h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Question Header & Flag button */}
          <div className="flex items-start justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-purple-900/80 text-purple-300 text-[10px] font-extrabold uppercase">
                {currentQ.type.replace('_', ' ')} · {currentQ.points} Points
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
                {currentQ.title}
              </h2>
            </div>
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`p-2 rounded-xl border transition-all ${
                flaggedQuestions[currentQ.id]
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Flag question for review"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Question Renderer */}
          <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/60 shadow-xl">
            <QuestionRenderers
              question={currentQ}
              userAnswer={userAnswers[currentQ.id]}
              onChangeAnswer={handleAnswerChange}
            />
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
          <MexoButton
            variant="outline"
            size="md"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Previous
          </MexoButton>

          {currentIndex < quiz.questions.length - 1 ? (
            <MexoButton
              variant="purple"
              size="md"
              onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next Question
            </MexoButton>
          ) : (
            <MexoButton variant="purple" size="md" onClick={() => setShowSubmitModal(true)}>
              Review & Submit
            </MexoButton>
          )}
        </div>
      </div>

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
