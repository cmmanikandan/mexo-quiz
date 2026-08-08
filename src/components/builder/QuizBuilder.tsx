import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Quiz, Question, QuestionType, QuizSettings } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { QuestionTypeEditors } from './QuestionTypeEditors';
import { QuizSettingsTab } from './QuizSettingsTab';
import { BulkImportModal } from './BulkImportModal';
import { QuestionBankSelector } from './QuestionBankSelector';
import { MexoButton } from '../common/MexoButton';
import { MexoInput } from '../common/MexoInput';
import {
  Save, Eye, ArrowLeft, Plus, Copy, Trash2, GripVertical, Settings, Layers, Upload, Database, CheckCircle2, ChevronUp, ChevronDown, Clock, HelpCircle, FileText
} from 'lucide-react';

export const QuizBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [isSaved, setIsSaved] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (id && id !== 'new') {
      const existing = quizService.getQuizById(id);
      if (existing) return existing;
    }
    return {
      id: `quiz-${Date.now()}`,
      creator_id: profile?.id || 'mexo-user',
      creator_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'Teacher',
      creator_avatar: profile?.avatar_url,
      is_public: true,
      plays_count: 0,
      rating_avg: 5.0,
      rating_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        title: 'Untitled Quiz',
        description: 'Quiz description and instructions...',
        subject: 'General',
        difficulty: 'medium',
        language: 'English',
        grade: 'K-12',
        tags: ['General', 'Interactive'],
        status: 'draft',
        autoClose: false,
        attemptsLimit: 0,
        shuffleQuestions: true,
        shuffleOptions: true,
        timerMode: 'whole_quiz',
        quizDurationMinutes: 10,
        leaderboardVisibility: 'live',
        showAnswersAfterQuiz: true,
        showScoreAfterQuiz: true,
        showExplanations: true,
        showCorrectAnswersAfterDueDate: false,
        passingScorePercentage: 60,
        negativeMarkingPercentage: 0,
        autoGrading: true,
        certificate: {
          enabled: true,
          title: 'Certificate of Achievement',
          minScorePercentage: 75,
          issuerName: 'MEXO Academy',
          templateStyle: 'gold',
        },
      },
      questions: [
        {
          id: 'q-initial-1',
          type: 'multiple_choice',
          title: 'Sample Question 1: What is the main component of water?',
          options: [
            { id: 'o1', text: 'Hydrogen and Oxygen', isCorrect: true, explanation: 'Water formula is H2O.' },
            { id: 'o2', text: 'Carbon and Nitrogen', isCorrect: false },
            { id: 'o3', text: 'Sodium and Chlorine', isCorrect: false },
          ],
          points: 10,
          explanation: 'H2O consists of two hydrogen atoms bonded to one oxygen atom.',
          hint: 'Think of H2O',
          isRequired: true,
        },
      ],
    };
  });

  const handleTitleChange = (title: string) => {
    setQuiz(prev => ({
      ...prev,
      settings: { ...prev.settings, title },
    }));
    setIsSaved(false);
  };

  const handleAddQuestion = (type: QuestionType = 'multiple_choice') => {
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      title: `New ${type.replace('_', ' ')} Question`,
      options: [
        { id: `opt-1`, text: 'Option 1', isCorrect: true },
        { id: `opt-2`, text: 'Option 2', isCorrect: false },
      ],
      points: 10,
      isRequired: true,
    };
    setQuiz(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    setIsSaved(false);
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const questions = [...quiz.questions];
    questions[index] = updated;
    setQuiz(prev => ({ ...prev, questions }));
    setIsSaved(false);
  };

  const handleDuplicateQuestion = (index: number) => {
    const q = quiz.questions[index];
    const dup: Question = {
      ...q,
      id: `q-dup-${Date.now()}`,
      title: `${q.title} (Copy)`,
    };
    const questions = [...quiz.questions];
    questions.splice(index + 1, 0, dup);
    setQuiz(prev => ({ ...prev, questions }));
    setIsSaved(false);
  };

  const handleDeleteQuestion = (index: number) => {
    if (quiz.questions.length <= 1) return;
    const questions = quiz.questions.filter((_, i) => i !== index);
    setQuiz(prev => ({ ...prev, questions }));
    setIsSaved(false);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= quiz.questions.length) return;
    const questions = [...quiz.questions];
    const temp = questions[index];
    questions[index] = questions[targetIdx];
    questions[targetIdx] = temp;
    setQuiz(prev => ({ ...prev, questions }));
    setIsSaved(false);
  };

  const handleSaveQuiz = (status: 'draft' | 'published' = 'published') => {
    const updatedQuiz = {
      ...quiz,
      settings: { ...quiz.settings, status },
    };
    quizService.saveQuiz(updatedQuiz);
    setQuiz(updatedQuiz);
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-body select-none">
      {/* Top Builder Sticky Header */}
      <div className="h-16 bg-white border-b border-app-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-mexo-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Back to Quizzes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={quiz.settings.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="text-base font-extrabold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7C3AED] focus:bg-white px-1.5 py-0.5 rounded-md outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 font-semibold px-1.5">
              {quiz.questions.length} Questions · Total {quiz.questions.reduce((acc, q) => acc + q.points, 0)} Points ·{' '}
              <span className={isSaved ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {isSaved ? 'Saved to Cloud' : 'Unsaved changes'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => setShowBankModal(true)}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Database className="w-3.5 h-3.5 text-[#0878E8]" />
            <span>Question Bank</span>
          </button>

          <MexoButton variant="outline" size="sm" onClick={() => navigate(`/quiz/${quiz.id}`)} leftIcon={<Eye className="w-4 h-4" />}>
            Preview
          </MexoButton>

          <MexoButton variant="purple" size="sm" onClick={() => handleSaveQuiz('published')} leftIcon={<Save className="w-4 h-4" />}>
            Save & Publish
          </MexoButton>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 flex space-x-6">
        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'questions'
              ? 'border-[#7C3AED] text-[#7C3AED]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Questions ({quiz.questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'border-[#7C3AED] text-[#7C3AED]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Quiz Settings & Rules</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {activeTab === 'settings' ? (
          <QuizSettingsTab settings={quiz.settings} onChange={settings => { setQuiz(prev => ({ ...prev, settings })); setIsSaved(false); }} />
        ) : (
          <div className="space-y-6">
            {/* Questions List */}
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-mexo-card space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#7C3AED] font-extrabold text-xs flex items-center justify-center">
                      Q{index + 1}
                    </span>
                    <select
                      value={q.type}
                      onChange={e => handleUpdateQuestion(index, { ...q, type: e.target.value as QuestionType })}
                      className="py-1 px-3 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="multiple_select">Multiple Select</option>
                      <option value="true_false">True / False</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="paragraph">Paragraph Essay</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="matching">Matching Pairs</option>
                      <option value="ordering">Ordering Sequence</option>
                      <option value="code_question">Code Question</option>
                      <option value="math_formula">Math Formula</option>
                      <option value="poll">Opinion Poll</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 mr-2">
                      <span className="text-xs font-semibold text-slate-500">Points:</span>
                      <input
                        type="number"
                        value={q.points}
                        onChange={e => handleUpdateQuestion(index, { ...q, points: parseInt(e.target.value) || 5 })}
                        className="w-14 py-1 px-2 text-xs font-bold rounded-lg bg-slate-50 border border-slate-200 text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === quiz.questions.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(index)}
                      className="p-1.5 text-slate-400 hover:text-[#7C3AED]"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt Title */}
                <MexoInput
                  label="Question Prompt"
                  value={q.title}
                  onChange={e => handleUpdateQuestion(index, { ...q, title: e.target.value })}
                  placeholder="Type your question here..."
                  required
                />

                {/* Specific Type Editor */}
                <QuestionTypeEditors question={q} onChange={updated => handleUpdateQuestion(index, updated)} />

                {/* Explanation & Hint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <MexoInput
                    label="Explanation (Shown after answering)"
                    value={q.explanation || ''}
                    onChange={e => handleUpdateQuestion(index, { ...q, explanation: e.target.value })}
                    placeholder="Provide clear rationale..."
                  />
                  <MexoInput
                    label="Hint (Optional)"
                    value={q.hint || ''}
                    onChange={e => handleUpdateQuestion(index, { ...q, hint: e.target.value })}
                    placeholder="Clue for students..."
                  />
                </div>
              </div>
            ))}

            {/* Add Question Button Bar */}
            <div className="flex flex-wrap gap-2 justify-center py-6 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
              <MexoButton variant="purple" size="sm" onClick={() => handleAddQuestion('multiple_choice')} leftIcon={<Plus className="w-4 h-4" />}>
                Add Multiple Choice
              </MexoButton>
              <MexoButton variant="outline" size="sm" onClick={() => handleAddQuestion('true_false')} leftIcon={<Plus className="w-4 h-4" />}>
                True / False
              </MexoButton>
              <MexoButton variant="outline" size="sm" onClick={() => handleAddQuestion('fill_blank')} leftIcon={<Plus className="w-4 h-4" />}>
                Fill Blank
              </MexoButton>
              <MexoButton variant="outline" size="sm" onClick={() => handleAddQuestion('code_question')} leftIcon={<Plus className="w-4 h-4" />}>
                Code Question
              </MexoButton>
              <MexoButton variant="outline" size="sm" onClick={() => handleAddQuestion('math_formula')} leftIcon={<Plus className="w-4 h-4" />}>
                Math Formula
              </MexoButton>
            </div>
          </div>
        )}
      </div>

      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={imported => {
          setQuiz(prev => ({ ...prev, questions: [...prev.questions, ...imported] }));
          setIsSaved(false);
        }}
      />

      <QuestionBankSelector
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectQuestion={q => {
          setQuiz(prev => ({ ...prev, questions: [...prev.questions, q] }));
          setIsSaved(false);
        }}
      />
    </div>
  );
};
