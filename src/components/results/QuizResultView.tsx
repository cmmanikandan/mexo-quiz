import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { quizService } from '../../services/quizService';
import { QuizAttempt, Quiz } from '../../types/quiz';
import { MexoButton } from '../common/MexoButton';
import { CertificateViewer } from './CertificateViewer';
import confetti from 'canvas-confetti';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  Trophy, Award, Clock, Zap, CheckCircle2, XCircle, RotateCcw, Home, Share2, Check, ArrowRight
} from 'lucide-react';

export const QuizResultView: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt] = useState<QuizAttempt | null>(() => {
    const list = attemptService.getAllAttempts();
    return list.find(a => a.id === attemptId) || list[0] || null;
  });

  const [quiz] = useState<Quiz | null>(() => {
    if (!attempt) return null;
    return quizService.getQuizById(attempt.quiz_id);
  });

  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (attempt?.is_passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }, [attempt]);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Attempt Record Not Found</h2>
        <MexoButton variant="purple" onClick={() => navigate('/')}>Back to Home</MexoButton>
      </div>
    );
  }

  const chartData = [
    { name: 'Score %', value: attempt.percentage, fill: '#7C3AED' },
    { name: 'Target %', value: quiz?.settings.passingScorePercentage || 60, fill: '#cbd5e1' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none pb-16">
      {/* Top Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-mexo-lg ${
        attempt.is_passed
          ? 'bg-gradient-to-tr from-emerald-500 via-teal-600 to-[#0878E8] text-white border-emerald-400'
          : 'bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 text-white border-purple-800'
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-3xl shadow-lg">
          {attempt.is_passed ? '🎉' : '💪'}
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            {attempt.is_passed ? 'Quiz Passed — Congratulations!' : 'Keep Practicing!'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {attempt.quiz_title}
          </h1>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] text-white/80 uppercase font-bold">Total Score</p>
            <p className="text-xl font-extrabold">{attempt.score} / {attempt.max_score}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] text-white/80 uppercase font-bold">Accuracy</p>
            <p className="text-xl font-extrabold">{attempt.percentage}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] text-white/80 uppercase font-bold">XP Earned</p>
            <p className="text-xl font-extrabold text-amber-300">+{attempt.xp_earned} XP</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] text-white/80 uppercase font-bold">Time Spent</p>
            <p className="text-xl font-extrabold">{Math.floor(attempt.time_spent_seconds / 60)}m {attempt.time_spent_seconds % 60}s</p>
          </div>
        </div>

        {attempt.is_passed && quiz?.settings.certificate?.enabled && (
          <div className="pt-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg hover:bg-amber-300 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>View Official Certificate</span>
            </button>
          </div>
        )}
      </div>

      {/* Chart & Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Bar Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white">Score vs Required Passing Score</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses Analysis */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Questions Answered: {Object.keys(attempt.answers || {}).length}</p>
                <p className="text-[11px] text-emerald-500">Correct: {attempt.correct_count} · Incorrect: {attempt.incorrect_count} · Skipped: {attempt.skipped_count}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-300">XP & Streak Bonus Applied</p>
                <p className="text-[11px] text-purple-400">+{attempt.xp_earned} XP added · Time: {Math.floor(attempt.time_spent_seconds / 60)}m {attempt.time_spent_seconds % 60}s</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Review Section */}
      {quiz && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Detailed Answer Review</h3>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const userAnswer = attempt.answers[q.id];
              const { isCorrect } = attemptService.gradeQuestion(q, userAnswer);
              const correctOption = q.options?.find(o => o.isCorrect);

              const formatAnswerText = (val: any) => {
                if (val === undefined || val === null || val === '') return 'Skipped / Unanswered';
                if (typeof val === 'string') {
                  const matchOpt = q.options?.find(o => o.id === val || o.text === val);
                  return matchOpt ? matchOpt.text : val;
                }
                if (Array.isArray(val)) {
                  return val.map(v => {
                    const matchOpt = q.options?.find(o => o.id === v || o.text === v);
                    return matchOpt ? matchOpt.text : v;
                  }).join(', ');
                }
                return String(val);
              };

              return (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Q{idx + 1}. {q.title}
                    </span>
                    {isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-extrabold flex items-center space-x-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>✓ Correct</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 text-[10px] font-extrabold flex items-center space-x-1 shrink-0">
                        <XCircle className="w-3 h-3" />
                        <span>✗ Incorrect</span>
                      </span>
                    )}
                  </div>

                  {/* Student Answer vs Correct Answer Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200 font-semibold'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-200 font-semibold'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Your Response:</p>
                      <p className="mt-0.5">{formatAnswerText(userAnswer)}</p>
                    </div>

                    {!isCorrect && correctOption && (
                      <div className="p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-800/60 text-emerald-200 font-semibold">
                        <p className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer Key:</p>
                        <p className="mt-0.5">{correctOption.text}</p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-sans">
                      💡 <span className="font-bold text-amber-300">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer flex items-center space-x-2 border border-slate-700"
        >
          <Home className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex space-x-2">
          {quiz && (
            <button
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          )}
        </div>
      </div>

      {quiz && (
        <CertificateViewer
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          userName={attempt.user_name}
          quizTitle={attempt.quiz_title}
          scorePercentage={attempt.percentage}
          completedAt={attempt.completed_at}
        />
      )}
      </div>
    </div>
  );
};
