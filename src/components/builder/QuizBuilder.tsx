import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Quiz, Question, QuestionType, QuizSettings, ResourceType } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { QuestionTypeEditors } from './QuestionTypeEditors';
import { QuizSettingsTab } from './QuizSettingsTab';
import { BulkImportModal } from './BulkImportModal';
import { QuestionBankSelector } from './QuestionBankSelector';
import { MexoButton } from '../common/MexoButton';
import { MexoInput } from '../common/MexoInput';
import {
  Save, Eye, ArrowLeft, Plus, Copy, Trash2, GripVertical, Settings, Layers, Upload, Database, CheckCircle2, ChevronUp, ChevronDown, Clock, HelpCircle, FileText, Sparkles
} from 'lucide-react';

export const QuizBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const resourceTypeParam = (searchParams.get('type') || 'quiz') as ResourceType;

  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [isSaved, setIsSaved] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (id && id !== 'new') {
      const existing = quizService.getQuizById(id);
      if (existing) return existing;
    }

    const aiState = location.state as { aiQuestions?: Question[]; aiMetadata?: any } | null;
    const initialQuestions: Question[] = aiState?.aiQuestions && aiState.aiQuestions.length > 0
      ? aiState.aiQuestions
      : [
          {
            id: 'q-initial-1',
            type: 'multiple_choice',
            title: 'Sample Question 1: Enter your question title here...',
            options: [
              { id: 'o1', text: 'Option A (Correct)', isCorrect: true, explanation: 'Correct choice explanation.' },
              { id: 'o2', text: 'Option B', isCorrect: false },
              { id: 'o3', text: 'Option C', isCorrect: false },
            ],
            points: 10,
            isRequired: true,
          },
        ];

    const currentUserId = profile?.id || user?.id || 'mexo-user';
    const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'Teacher';

    return {
      id: `quiz-${Date.now()}`,
      resource_type: resourceTypeParam,
      creator_id: currentUserId,
      creator_name: currentUserName,
      creator_avatar: profile?.avatar_url,
      is_public: true,
      plays_count: 0,
      rating_avg: 5.0,
      rating_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        title: aiState?.aiMetadata?.topic ? `Quiz: ${aiState.aiMetadata.topic}` : `Untitled ${resourceTypeParam.toUpperCase()}`,
        description: 'Interactive learning resource description and instructions...',
        subject: aiState?.aiMetadata?.subject || 'General',
        difficulty: aiState?.aiMetadata?.difficulty || 'medium',
        language: 'English',
        grade: aiState?.aiMetadata?.grade || 'K-12',
        tags: [resourceTypeParam, 'Interactive'],
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
      questions: initialQuestions,
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
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handlePreview = () => {
    handleSaveQuiz('draft');
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-body select-none">
      {/* Top Builder Sticky Header */}
      <div className="h-16 bg-white border-b border-app-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-mexo-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/library')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to My Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={quiz.settings.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="text-base font-extrabold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7C3AED] focus:bg-white px-1.5 py-0.5 rounded-md outline-hidden transition-all"
            />
            <p className="text-[11px] text-slate-400 font-semibold px-1.5 flex items-center space-x-2">
              <span>{quiz.questions.length} Questions</span>
              <span>·</span>
              <span>Total {quiz.questions.reduce((acc, q) => acc + q.points, 0)} Points</span>
              <span>·</span>
              <span className={isSaved ? 'text-emerald-600 font-bold flex items-center space-x-1' : 'text-amber-600 font-bold'}>
                {isSaved ? <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> : null}
                <span>{isSaved ? 'Saved to Cloud' : 'Unsaved changes'}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              Saved Successfully!
            </span>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => setShowBankModal(true)}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#0878E8]" />
            <span>Question Bank</span>
          </button>

          <MexoButton variant="outline" size="sm" onClick={handlePreview} leftIcon={<Eye className="w-4 h-4" />}>
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
                      className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-transparent outline-hidden cursor-pointer"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="multiple_select">Multiple Select</option>
                      <option value="true_false">True / False</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="paragraph">Paragraph</option>
                      <option value="matching">Matching</option>
                      <option value="ordering">Ordering Sequence</option>
                      <option value="poll">Poll (No right/wrong)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === quiz.questions.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateQuestion(index)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Duplicate Question"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      disabled={quiz.questions.length <= 1}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 disabled:opacity-30 cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Editor */}
                <QuestionTypeEditors question={q} onChange={updated => handleUpdateQuestion(index, updated)} />
              </div>
            ))}

            {/* Add Question Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
              <MexoButton
                variant="purple"
                size="md"
                onClick={() => handleAddQuestion('multiple_choice')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Add Question
              </MexoButton>

              <MexoButton
                variant="outline"
                size="md"
                onClick={() => handleAddQuestion('true_false')}
              >
                + True / False
              </MexoButton>

              <MexoButton
                variant="outline"
                size="md"
                onClick={() => handleAddQuestion('multiple_select')}
              >
                + Checkbox Select
              </MexoButton>
            </div>
          </div>
        )}
      </div>

      {showImportModal && (
        <BulkImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={importedQuestions => {
            setQuiz(prev => ({ ...prev, questions: [...prev.questions, ...importedQuestions] }));
            setIsSaved(false);
            setShowImportModal(false);
          }}
        />
      )}

      {showBankModal && (
        <QuestionBankSelector
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          onSelectQuestions={bankQuestions => {
            setQuiz(prev => ({ ...prev, questions: [...prev.questions, ...bankQuestions] }));
            setIsSaved(false);
            setShowBankModal(false);
          }}
        />
      )}
    </div>
  );
};
