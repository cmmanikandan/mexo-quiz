import React from 'react';
import { Question, QuestionOption, QuestionType } from '../../types/quiz';
import { MexoInput } from '../common/MexoInput';
import { MexoButton } from '../common/MexoButton';
import { Plus, Trash2, Check, Code, BookOpen, Image, Volume2, Video, Target } from 'lucide-react';

interface EditorProps {
  question: Question;
  onChange: (updated: Question) => void;
}

export const QuestionTypeEditors: React.FC<EditorProps> = ({ question, onChange }) => {
  // Option updates
  const handleOptionTextChange = (index: number, text: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], text };
    onChange({ ...question, options: updatedOptions });
  };

  const toggleOptionCorrect = (index: number) => {
    let updatedOptions = [...question.options];
    if (question.type === 'multiple_choice' || question.type === 'true_false' || question.type === 'dropdown') {
      updatedOptions = updatedOptions.map((opt, i) => ({ ...opt, isCorrect: i === index }));
    } else {
      updatedOptions[index] = { ...updatedOptions[index], isCorrect: !updatedOptions[index].isCorrect };
    }
    onChange({ ...question, options: updatedOptions });
  };

  const addOption = () => {
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text: `Option ${question.options.length + 1}`,
      isCorrect: false,
    };
    onChange({ ...question, options: [...question.options, newOpt] });
  };

  const removeOption = (index: number) => {
    if (question.options.length <= 2 && (question.type === 'multiple_choice' || question.type === 'true_false')) return;
    const updatedOptions = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: updatedOptions });
  };

  // Type specific renderers
  switch (question.type) {
    case 'multiple_choice':
    case 'multiple_select':
    case 'dropdown':
    case 'poll':
      return (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">Answer Options & Correct Key</label>
          <div className="space-y-2">
            {question.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                {question.type !== 'poll' && (
                  <button
                    type="button"
                    onClick={() => toggleOptionCorrect(idx)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      opt.isCorrect
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 bg-white hover:border-emerald-400'
                    }`}
                    title={opt.isCorrect ? 'Correct Option' : 'Mark as Correct'}
                  >
                    {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                  </button>
                )}
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:bg-white"
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <MexoButton type="button" variant="outline" size="xs" onClick={addOption} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Option
          </MexoButton>
        </div>
      );

    case 'true_false':
      return (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">Select Correct Statement</label>
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOptionCorrect(idx)}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  opt.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{opt.text}</span>
                {opt.isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      );

    case 'fill_blank':
    case 'short_answer':
      return (
        <div className="space-y-3 pt-2">
          <MexoInput
            label="Accepted Answer(s) (comma separated for multiple variations)"
            value={(question.acceptedBlanks || []).join(', ')}
            onChange={e => onChange({ ...question, acceptedBlanks: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="e.g. Oxygen, O2"
          />
        </div>
      );

    case 'paragraph':
      return (
        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900">
          Student will provide a written essay or paragraph response. Points will be automatically awarded or flagged for manual teacher review.
        </div>
      );

    case 'matching':
      return (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">Matching Pairs (Left Item ➔ Right Item)</label>
          {(question.matchingPairs || [
            { left: 'Left 1', right: 'Right 1' },
            { left: 'Left 2', right: 'Right 2' },
          ]).map((pair, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={pair.left}
                onChange={e => {
                  const pairs = [...(question.matchingPairs || [])];
                  pairs[idx].left = e.target.value;
                  onChange({ ...question, matchingPairs: pairs });
                }}
                placeholder="Left item"
                className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
              <span className="text-slate-400 font-bold">➔</span>
              <input
                type="text"
                value={pair.right}
                onChange={e => {
                  const pairs = [...(question.matchingPairs || [])];
                  pairs[idx].right = e.target.value;
                  onChange({ ...question, matchingPairs: pairs });
                }}
                placeholder="Right match"
                className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          ))}
          <MexoButton
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              const pairs = [...(question.matchingPairs || [])];
              pairs.push({ left: `Left ${pairs.length + 1}`, right: `Right ${pairs.length + 1}` });
              onChange({ ...question, matchingPairs: pairs });
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Pair
          </MexoButton>
        </div>
      );

    case 'ordering':
      return (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">Correct Sequence (Ordered top to bottom)</label>
          {(question.orderingSequence || ['Step 1', 'Step 2', 'Step 3']).map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={e => {
                  const seq = [...(question.orderingSequence || [])];
                  seq[idx] = e.target.value;
                  onChange({ ...question, orderingSequence: seq });
                }}
                className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          ))}
          <MexoButton
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              const seq = [...(question.orderingSequence || [])];
              seq.push(`Step ${seq.length + 1}`);
              onChange({ ...question, orderingSequence: seq });
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Step
          </MexoButton>
        </div>
      );

    case 'code_question':
      return (
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-1/3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
              <select
                value={question.codeLanguage || 'python'}
                onChange={e => onChange({ ...question, codeLanguage: e.target.value })}
                className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="html">HTML/CSS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Starter Code Snippet</label>
            <textarea
              rows={4}
              value={question.codeStarter || ''}
              onChange={e => onChange({ ...question, codeStarter: e.target.value })}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-purple-300 rounded-2xl border border-slate-800 focus:outline-none"
              placeholder="def calculate_total(items):..."
            />
          </div>
          {/* Options for code output choice */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Expected Output Options</label>
            {question.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleOptionCorrect(idx)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    opt.isCorrect ? 'bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Output ${idx + 1}`}
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 'math_formula':
      return (
        <div className="space-y-3 pt-2">
          <MexoInput
            label="LaTeX Mathematical Expression"
            value={question.mathLaTeX || ''}
            onChange={e => onChange({ ...question, mathLaTeX: e.target.value })}
            placeholder="e.g. E = m c^2 or \int_{0}^{\infty} e^{-x^2} dx"
            leftIcon={<BookOpen className="w-4 h-4 text-[#7C3AED]" />}
          />
          {question.mathLaTeX && (
            <div className="p-3 bg-slate-900 rounded-2xl text-white font-mono text-xs flex items-center justify-between">
              <span>LaTeX Preview:</span>
              <span className="text-purple-300 font-bold">{question.mathLaTeX}</span>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Multiple Choice Answers</label>
            {question.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleOptionCorrect(idx)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    opt.isCorrect ? 'bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 'image_question':
    case 'audio_question':
    case 'video_question':
      return (
        <div className="space-y-3 pt-2">
          <MexoInput
            label={`Media Attachment URL (${question.type.replace('_question', '')})`}
            value={question.mediaUrl || ''}
            onChange={e =>
              onChange({
                ...question,
                mediaUrl: e.target.value,
                mediaType: question.type.replace('_question', '') as any,
              })
            }
            placeholder="https://images.unsplash.com/... or https://video.mp4"
          />
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Answer Options</label>
            {question.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleOptionCorrect(idx)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    opt.isCorrect ? 'bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-2 pt-2">
          {question.options.map((opt, idx) => (
            <div key={opt.id} className="flex items-center space-x-2">
              <input
                type="text"
                value={opt.text}
                onChange={e => handleOptionTextChange(idx, e.target.value)}
                className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          ))}
        </div>
      );
  }
};
