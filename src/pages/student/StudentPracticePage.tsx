import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CheckSquare, Flame, Zap, Award } from 'lucide-react';

export const StudentPracticePage: React.FC = () => {
  useDocumentTitle('Practice Mode — MEXO Quiz');
  const navigate = useNavigate();

  const modes = [
    { title: 'Flashcards & Rapid Recall', desc: 'Quick fire question cards for memorizing terms and formulas.', icon: Zap, color: 'bg-purple-50 text-[#7C3AED]' },
    { title: 'Weak Topics Workout', desc: 'Targeted practice questions based on your past quiz mistakes.', icon: Flame, color: 'bg-rose-50 text-rose-600' },
    { title: 'Untimed Master Class', desc: 'No pressure, unlimited time per question with instant explanations.', icon: CheckSquare, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Practice & Self-Study</h1>
        <p className="text-xs text-slate-500 mt-0.5">Sharpen your knowledge at your own pace without timer pressure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-mexo-card space-y-4 hover:border-purple-300 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
              <MexoButton variant="purple" size="xs" onClick={() => navigate('/library')}>
                Start Practice Session
              </MexoButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
