import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileText,
  Upload,
  BrainCircuit,
  CheckCircle2,
  Trash2,
  Edit3,
  RefreshCw,
  Plus,
  Wand2,
} from 'lucide-react';
import { Question, ResourceType } from '../../types/quiz';
import { quizService } from '../../services/quizService';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questions: Question[], metadata: any) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
}) => {
  const [step, setStep] = useState<'prompt' | 'review'>('prompt');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('General Knowledge');
  const [grade, setGrade] = useState('High School');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [resourceType, setResourceType] = useState<ResourceType>('quiz');
  const [language, setLanguage] = useState('English');
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Review State
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic && !pastedText) return;
    setIsGenerating(true);

    try {
      const res = await quizService.generateResourceWithAI({
        topic: topic || 'Custom Document',
        subject,
        grade,
        difficulty,
        count: questionCount,
        resourceType,
      });

      setGeneratedQuestions(res.questions);
      setStep('review');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (index: number) => {
    const updated = [...generatedQuestions];
    try {
      const res = await quizService.generateResourceWithAI({
        topic: `${topic} variant ${Date.now()}`,
        subject,
        grade,
        difficulty,
        count: 1,
        resourceType,
      });
      if (res.questions.length > 0) {
        updated[index] = res.questions[0];
        setGeneratedQuestions(updated);
      }
    } catch (e) {}
  };

  const handleDeleteQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAcceptAndImport = () => {
    onGenerated(generatedQuestions, {
      title: topic ? `MEXO AI: ${topic}` : 'AI Generated Resource',
      subject,
      grade,
      difficulty,
      resourceType,
      language,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Create with MEXO AI</h2>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'prompt'
                  ? 'Configure topic or upload text/file to generate questions'
                  : 'Review & edit AI questions before importing into creator'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 'prompt' ? (
            <>
              {/* Form Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Topic or Prompt *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, World War II Causes, Python Asyncio, Solar System"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-100 text-sm outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value="General Knowledge">General Knowledge</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Grade</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value="Elementary">Elementary School</option>
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                      <option value="College">College / Higher Ed</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resource Type</label>
                    <select
                      value={resourceType}
                      onChange={e => setResourceType(e.target.value as ResourceType)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value="quiz">Interactive Quiz</option>
                      <option value="assessment">Formal Assessment</option>
                      <option value="lesson">Interactive Lesson</option>
                      <option value="flashcards">Flashcard Deck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Question Count</label>
                    <select
                      value={questionCount}
                      onChange={e => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Language</label>
                    <input
                      type="text"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or Paste Source Material / Article
                  </label>
                  <textarea
                    rows={3}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste textbook notes, essay content, or transcript here..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-100 text-xs outline-hidden font-mono resize-none"
                  />
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!topic && !pastedText)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>MEXO AI generating questions...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 text-yellow-300" />
                    <span>Generate Content with MEXO AI</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Review Step */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-900">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Generated {generatedQuestions.length} AI Questions for review</span>
                </div>
                <button
                  onClick={() => setStep('prompt')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline"
                >
                  Change Options
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                          Q{idx + 1} • {q.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleRegenerateQuestion(idx)}
                          title="Regenerate Question"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Delete Question"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                            opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {opt.isCorrect && <span className="text-[10px] font-extrabold text-emerald-700">✓ Correct</span>}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] italic text-slate-500">
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  <span className="font-bold text-amber-600">Note:</span> AI content is not auto-published until saved in Builder.
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptAndImport}
                    disabled={generatedQuestions.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-purple-500/20"
                  >
                    Import into Editor ({generatedQuestions.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
