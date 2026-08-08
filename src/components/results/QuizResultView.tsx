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
    <div className="min-h-screen bg-app-bg p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-mexo-card space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Score vs Required Passing Score</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip />
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Strong Proficiency Demonstrated</p>
                <p className="text-[11px] text-emerald-700">Excellent grasp of core concepts and multiple choice items.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center space-x-3">
              <Zap className="w-5 h-5 text-[#7C3AED] shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-900">XP & Streak Bonus Applied</p>
                <p className="text-[11px] text-purple-700">Added {attempt.xp_earned} XP points to your profile total.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Review Section */}
      {quiz && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Detailed Answer Review</h3>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const { isCorrect } = attemptService.gradeQuestion(q, attempt.answers[q.id]);
              return (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Q{idx + 1}. {q.title}
                    </span>
                    {isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-sans">
                      💡 <span className="font-bold">Explanation:</span> {q.explanation}
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
        <MexoButton variant="outline" size="md" onClick={() => navigate('/')} leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </MexoButton>

        <div className="flex space-x-2">
          {quiz && (
            <MexoButton variant="purple" size="md" onClick={() => navigate(`/quiz/${quiz.id}`)} leftIcon={<RotateCcw className="w-4 h-4" />}>
              Retry Quiz
            </MexoButton>
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
  );
};
