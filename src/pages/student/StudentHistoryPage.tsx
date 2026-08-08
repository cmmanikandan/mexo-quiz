import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { useAuth } from '../../contexts/AuthContext';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Clock, Award, CheckCircle2, XCircle } from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  useDocumentTitle('Quiz History & Results — MEXO Quiz');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [attempts] = useState(() => attemptService.getAllAttempts());

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quiz History & Results</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track your past quiz attempts, scores, and accuracy progress.</p>
      </div>

      <div className="space-y-4">
        {attempts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No quiz attempts yet. Start a quiz from the library!</p>
        ) : (
          attempts.map(att => (
            <div key={att.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{att.quiz_title}</h3>
                  {att.is_passed ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Passed</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">Needs Practice</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Completed {new Date(att.completed_at).toLocaleDateString()} · Score: {att.score}/{att.max_score} ({att.percentage}%) · Time: {Math.floor(att.time_spent_seconds / 60)}m
                </p>
              </div>
              <MexoButton variant="outline" size="xs" onClick={() => navigate(`/result/${att.id}`)}>
                View Report
              </MexoButton>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
