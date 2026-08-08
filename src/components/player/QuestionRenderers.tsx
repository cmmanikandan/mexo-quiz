import React from 'react';
import { Question } from '../../types/quiz';
import { Check, HelpCircle } from 'lucide-react';

interface QuestionRenderProps {
  question: Question;
  userAnswer: any;
  onChangeAnswer: (ans: any) => void;
  isDarkTheme?: boolean;
}

export const QuestionRenderers: React.FC<QuestionRenderProps> = ({
  question,
  userAnswer,
  onChangeAnswer,
  isDarkTheme = false,
}) => {
  const containerStyle = isDarkTheme
    ? 'bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800/80 hover:border-slate-700'
    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';

  const selectedStyle = isDarkTheme
    ? 'bg-purple-600/30 border-purple-500 text-white font-extrabold shadow-md ring-2 ring-purple-500/40'
    : 'bg-purple-50 border-[#7C3AED] text-purple-950 font-bold shadow-sm ring-2 ring-purple-200';

  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
    case 'poll':
      return (
        <div className="space-y-3 pt-2">
          {question.options.map((opt, idx) => {
            const isSelected = userAnswer === opt.id || userAnswer === opt.text;
            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => onChangeAnswer(opt.id || opt.text)}
                className={`w-full min-h-[58px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                  isSelected ? selectedStyle : containerStyle
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border font-mono font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm'
                        : isDarkTheme
                        ? 'border-slate-700 bg-slate-800 text-slate-400'
                        : 'border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed overflow-wrap-anywhere">{opt.text}</span>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );

    case 'multiple_select': {
      const currentSelected: string[] = Array.isArray(userAnswer) ? userAnswer : [];
      return (
        <div className="space-y-3 pt-2">
          {question.options.map((opt, idx) => {
            const isSelected = currentSelected.includes(opt.id) || currentSelected.includes(opt.text);
            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => {
                  const itemVal = opt.id || opt.text;
                  if (isSelected) {
                    onChangeAnswer(currentSelected.filter(id => id !== itemVal));
                  } else {
                    onChangeAnswer([...currentSelected, itemVal]);
                  }
                }}
                className={`w-full min-h-[58px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? selectedStyle : containerStyle
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                        : isDarkTheme
                        ? 'border-slate-700 bg-slate-800'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed overflow-wrap-anywhere">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    case 'fill_blank':
    case 'short_answer':
      return (
        <div className="pt-2">
          <input
            type="text"
            value={userAnswer || ''}
            onChange={e => onChangeAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className={`w-full py-3.5 px-4 text-xs sm:text-sm font-semibold rounded-2xl border outline-hidden transition-all ${
              isDarkTheme
                ? 'bg-slate-900 border-slate-800 text-white focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-900/40'
                : 'bg-white border-slate-300 text-slate-900 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100'
            }`}
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
            placeholder="Write your explanation or detailed answer here..."
            className={`w-full p-4 text-xs sm:text-sm font-medium rounded-2xl border outline-hidden transition-all ${
              isDarkTheme
                ? 'bg-slate-900 border-slate-800 text-white focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-900/40'
                : 'bg-white border-slate-300 text-slate-900 focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100'
            }`}
          />
        </div>
      );

    case 'matching':
      const currentPairs: Record<string, string> = typeof userAnswer === 'object' && userAnswer !== null ? userAnswer : {};
      return (
        <div className="space-y-3 pt-2">
          {question.matchingPairs?.map((pair, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{pair.left}</span>
              <select
                value={currentPairs[pair.left] || ''}
                onChange={e =>
                  onChangeAnswer({
                    ...currentPairs,
                    [pair.left]: e.target.value,
                  })
                }
                className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-hidden cursor-pointer ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Select matching pair...</option>
                {question.matchingPairs?.map(p => (
                  <option key={p.right} value={p.right}>
                    {p.right}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="space-y-3 pt-2">
          {question.options?.map((opt, idx) => {
            const isSelected = userAnswer === opt.id || userAnswer === opt.text;
            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => onChangeAnswer(opt.id || opt.text)}
                className={`w-full min-h-[56px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? selectedStyle : containerStyle
                }`}
              >
                <span className="text-xs sm:text-sm leading-relaxed overflow-wrap-anywhere">{opt.text}</span>
                {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
              </button>
            );
          })}
        </div>
      );
  }
};
