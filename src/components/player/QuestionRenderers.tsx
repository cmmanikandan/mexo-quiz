import React from 'react';
import { Question } from '../../types/quiz';
import { Check, HelpCircle } from 'lucide-react';

interface QuestionRenderProps {
  question: Question;
  userAnswer: any;
  onChangeAnswer: (ans: any) => void;
}

export const QuestionRenderers: React.FC<QuestionRenderProps> = ({ question, userAnswer, onChangeAnswer }) => {
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
    case 'poll':
      return (
        <div className="space-y-3 pt-2">
          {question.options.map(opt => {
            const isSelected = userAnswer === opt.id || userAnswer === opt.text;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeAnswer(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-purple-50 border-[#7C3AED] text-purple-950 font-bold shadow-mexo-sm ring-2 ring-purple-200'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                      isSelected ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      );

    case 'multiple_select':
      const currentSelected: string[] = Array.isArray(userAnswer) ? userAnswer : [];
      return (
        <div className="space-y-3 pt-2">
          {question.options.map(opt => {
            const isSelected = currentSelected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChangeAnswer(currentSelected.filter(id => id !== opt.id));
                  } else {
                    onChangeAnswer([...currentSelected, opt.id]);
                  }
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 border-[#7C3AED] text-purple-950 font-bold shadow-mexo-sm ring-2 ring-purple-200'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      );

    case 'fill_blank':
    case 'short_answer':
      return (
        <div className="pt-2">
          <input
            type="text"
            value={userAnswer || ''}
            onChange={e => onChangeAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full py-3.5 px-4 text-sm font-semibold rounded-2xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      );

    case 'paragraph':
      return (
        <div className="pt-2">
          <textarea
            rows={5}
            value={userAnswer || ''}
            onChange={e => onChangeAnswer(e.target.value)}
            placeholder="Type your response in detail..."
            className="w-full p-4 text-sm rounded-2xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      );

    case 'dropdown':
      return (
        <div className="pt-2">
          <select
            value={userAnswer || ''}
            onChange={e => onChangeAnswer(e.target.value)}
            className="w-full p-3.5 text-sm font-bold rounded-2xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="">-- Select an option --</option>
            {question.options.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </div>
      );

    case 'matching':
      const currentPairs: Record<string, string> = userAnswer || {};
      return (
        <div className="space-y-3 pt-2">
          {(question.matchingPairs || []).map((pair, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-800">{pair.left}</span>
              <span className="text-slate-400 font-bold hidden sm:inline">➔</span>
              <select
                value={currentPairs[pair.left] || ''}
                onChange={e => onChangeAnswer({ ...currentPairs, [pair.left]: e.target.value })}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900"
              >
                <option value="">Select matching pair...</option>
                {(question.matchingPairs || []).map(p => (
                  <option key={p.right} value={p.right}>
                    {p.right}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      );

    case 'ordering':
      const currentOrder: string[] = Array.isArray(userAnswer)
        ? userAnswer
        : question.orderingSequence || ['Item 1', 'Item 2'];
      return (
        <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-500 mb-2">Reorder items into correct sequence:</p>
          {currentOrder.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-[#7C3AED] text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">{item}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    if (idx === 0) return;
                    const next = [...currentOrder];
                    const tmp = next[idx];
                    next[idx] = next[idx - 1];
                    next[idx - 1] = tmp;
                    onChangeAnswer(next);
                  }}
                  disabled={idx === 0}
                  className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold hover:bg-slate-200 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (idx === currentOrder.length - 1) return;
                    const next = [...currentOrder];
                    const tmp = next[idx];
                    next[idx] = next[idx + 1];
                    next[idx + 1] = tmp;
                    onChangeAnswer(next);
                  }}
                  disabled={idx === currentOrder.length - 1}
                  className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold hover:bg-slate-200 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      );

    case 'code_question':
      return (
        <div className="space-y-4 pt-2">
          {question.codeStarter && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
              <pre>{question.codeStarter}</pre>
            </div>
          )}
          <div className="space-y-2">
            {question.options.map(opt => {
              const isSelected = userAnswer === opt.id || userAnswer === opt.text;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeAnswer(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left font-mono text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-[#7C3AED] text-purple-950 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      );

    case 'math_formula':
      return (
        <div className="space-y-4 pt-2">
          {question.mathLaTeX && (
            <div className="p-4 bg-slate-900 rounded-2xl text-center text-white font-mono text-base border border-slate-800 shadow-md">
              <span className="text-purple-300 font-bold">{question.mathLaTeX}</span>
            </div>
          )}
          <div className="space-y-2">
            {question.options.map(opt => {
              const isSelected = userAnswer === opt.id || userAnswer === opt.text;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeAnswer(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-[#7C3AED] text-purple-950 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-2 pt-2">
          {question.options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeAnswer(opt.id)}
              className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all ${
                userAnswer === opt.id ? 'bg-purple-50 border-[#7C3AED] font-bold' : 'bg-white border-slate-200'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      );
  }
};
