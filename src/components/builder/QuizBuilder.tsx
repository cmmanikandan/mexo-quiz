import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Quiz, Question, QuestionType, ResourceType } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { QuestionTypeEditors } from './QuestionTypeEditors';
import { QuizSettingsTab } from './QuizSettingsTab';
import { BulkImportModal } from './BulkImportModal';
import { QuestionBankSelector } from './QuestionBankSelector';
import { AIGeneratorModal } from '../create/AIGeneratorModal';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { PublishModal } from './PublishModal';
import { MexoButton } from '../common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Settings,
  Layers,
  Upload,
  Database,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  Share2,
  FileCheck,
  Radio,
} from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed';

export const QuizBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const resourceTypeParam = (searchParams.get('type') || 'quiz') as ResourceType;

  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Unsaved Changes Leave Protection Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Reference to last successfully saved quiz state for reversion on "Leave Without Saving"
  const lastSavedQuizRef = useRef<Quiz | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (id && id !== 'new') {
      const existing = quizService.getQuizById(id);
      if (existing) {
        lastSavedQuizRef.current = JSON.parse(JSON.stringify(existing));
        return existing;
      }
    }

    const aiState = location.state as { aiQuestions?: Question[]; aiMetadata?: any } | null;
    const initialQuestions: Question[] =
      aiState?.aiQuestions && aiState.aiQuestions.length > 0
        ? aiState.aiQuestions
        : [
            {
              id: `q-initial-1-${Date.now()}`,
              type: 'multiple_choice',
              title: '',
              options: [
                { id: `opt-1-${Date.now()}`, text: 'Option 1', isCorrect: true },
                { id: `opt-2-${Date.now()}`, text: 'Option 2', isCorrect: false },
                { id: `opt-3-${Date.now()}`, text: 'Option 3', isCorrect: false },
                { id: `opt-4-${Date.now()}`, text: 'Option 4', isCorrect: false },
              ],
              points: 10,
              isRequired: true,
            },
          ];

    const currentUserId = profile?.id || user?.id || 'mexo-user';
    const currentUserName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
      : user?.email || 'Teacher';

    const newQuizObj: Quiz = {
      id: id && id !== 'new' ? id : `quiz-${Date.now()}`,
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
        title: aiState?.aiMetadata?.topic ? `${aiState.aiMetadata.topic}` : '',
        description: '',
        instructions: '',
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

    lastSavedQuizRef.current = JSON.parse(JSON.stringify(newQuizObj));
    return newQuizObj;
  });

  useDocumentTitle(`${quiz.settings.title || 'Untitled Quiz'} (Editor) — MEXO Quiz`);

  // Core Async Database Save Execution
  const executeDatabaseSave = useCallback(
    async (quizToSave: Quiz): Promise<boolean> => {
      setSaveStatus('saving');
      setSaveErrorMessage(null);

      try {
        const res = await quizService.saveQuiz(quizToSave);
        if (res.success) {
          setSaveStatus('saved');
          lastSavedQuizRef.current = JSON.parse(JSON.stringify(res.quiz));
          return true;
        } else {
          setSaveStatus('failed');
          setSaveErrorMessage('Save failed. Check database connection.');
          return false;
        }
      } catch (err) {
        setSaveStatus('failed');
        setSaveErrorMessage('Network error during save.');
        return false;
      }
    },
    []
  );

  // Debounced Auto-Save Trigger
  const triggerAutoSaveDebounced = useCallback(
    (updatedQuiz: Quiz) => {
      setSaveStatus('unsaved');
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        executeDatabaseSave(updatedQuiz);
      }, 750); // 750ms debounce
    },
    [executeDatabaseSave]
  );

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Intercept Browser Close / Refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' || saveStatus === 'failed') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Protected Navigation Wrapper
  const navigateWithProtection = (targetPath: string) => {
    if (saveStatus === 'unsaved' || saveStatus === 'failed') {
      setPendingNavigationTarget(targetPath);
      setShowLeaveModal(true);
    } else {
      navigate(targetPath);
    }
  };

  // State Updates Handlers
  const handleTitleChange = (title: string) => {
    const updated = {
      ...quiz,
      settings: { ...quiz.settings, title },
    };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  const handleAddQuestion = (type: QuestionType = 'multiple_choice') => {
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: `New ${type.replace('_', ' ')} Question`,
      options: [
        { id: `opt-1-${Date.now()}`, text: 'Option 1', isCorrect: true },
        { id: `opt-2-${Date.now()}`, text: 'Option 2', isCorrect: false },
      ],
      points: 10,
      isRequired: true,
    };

    const updated = { ...quiz, questions: [...quiz.questions, newQ] };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  const handleUpdateQuestion = (index: number, updatedQ: Question) => {
    const questions = [...quiz.questions];
    questions[index] = updatedQ;
    const updated = { ...quiz, questions };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  const handleDuplicateQuestion = (index: number) => {
    const q = quiz.questions[index];
    const dup: Question = {
      ...JSON.parse(JSON.stringify(q)),
      id: `q-dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${q.title} (Copy)`,
    };

    const questions = [...quiz.questions];
    questions.splice(index + 1, 0, dup);
    const updated = { ...quiz, questions };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (quiz.questions.length <= 1) {
      alert('A quiz must contain at least 1 question.');
      return;
    }
    const questions = quiz.questions.filter((_, i) => i !== index);
    const updated = { ...quiz, questions };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= quiz.questions.length) return;
    const questions = [...quiz.questions];
    const temp = questions[index];
    questions[index] = questions[targetIdx];
    questions[targetIdx] = temp;

    const updated = { ...quiz, questions };
    setQuiz(updated);
    triggerAutoSaveDebounced(updated);
  };

  // Manual Save Handler
  const handleManualSave = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await executeDatabaseSave(quiz);
  };

  // Leave Modal Handlers
  const handleSaveAndLeave = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const success = await executeDatabaseSave(quiz);
    if (success) {
      setShowLeaveModal(false);
      if (pendingNavigationTarget) navigate(pendingNavigationTarget);
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowLeaveModal(false);
    if (lastSavedQuizRef.current) {
      setQuiz(JSON.parse(JSON.stringify(lastSavedQuizRef.current)));
    }
    if (pendingNavigationTarget) navigate(pendingNavigationTarget);
  };

  // Delete Quiz Handler
  const handleDeleteQuiz = async () => {
    if (window.confirm(`Delete "${quiz.settings.title || 'Untitled Quiz'}"? This action cannot be undone.`)) {
      await quizService.deleteQuiz(quiz.id);
      navigate('/library');
    }
  };

  // Preview Handler
  const handlePreview = async () => {
    await handleManualSave();
    navigate(`/quiz/${quiz.id}?preview=true`);
  };

  // Publish Success Handler from Modal
  const handleConfirmPublishFromModal = async (publishedQuiz: Quiz) => {
    setQuiz(publishedQuiz);
    await executeDatabaseSave(publishedQuiz);
  };

  const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 0), 0);

  return (
    <div className="min-h-screen bg-app-bg text-app-body select-none">
      {/* 1. EDITOR TOP HEADER */}
      <div className="h-16 bg-white border-b border-app-border px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-mexo-sm">
        {/* Title & Back Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 pr-2">
          <button
            onClick={() => navigateWithProtection('/library')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={quiz.settings.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder={`Untitled ${resourceTypeParam.charAt(0).toUpperCase() + resourceTypeParam.slice(1)}`}
              className="w-full text-xs sm:text-base font-extrabold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7C3AED] focus:bg-white px-1.5 py-0.5 rounded-md outline-hidden transition-all truncate"
            />

            <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold px-1.5 flex items-center space-x-2 truncate">
              <span>{quiz.questions.length} Qs</span>
              <span>·</span>
              <span>{totalPoints} Points</span>
              <span>·</span>

              {/* SAVE STATUS INDICATOR */}
              {saveStatus === 'saving' && (
                <span className="text-indigo-600 font-bold flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin inline" />
                  <span>Saving...</span>
                </span>
              )}

              {saveStatus === 'saved' && (
                <span className="text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>Saved ✓</span>
                </span>
              )}

              {saveStatus === 'unsaved' && (
                <span className="text-amber-600 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}

              {saveStatus === 'failed' && (
                <span className="text-rose-600 font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 inline" />
                  <span>Save failed</span>
                  <button
                    onClick={handleManualSave}
                    className="underline text-xs hover:text-rose-700 cursor-pointer ml-1"
                  >
                    Retry
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Desktop & Compact Mobile) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={() => setShowAiModal(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-extrabold text-[#7C3AED] hover:bg-purple-100 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>AI Generate</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setShowBankModal(true)}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#0878E8]" />
            <span>Bank</span>
          </button>

          {/* Preview Button */}
          <MexoButton variant="outline" size="sm" onClick={handlePreview} leftIcon={<Eye className="w-4 h-4" />}>
            Preview
          </MexoButton>

          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Separate Publish Button */}
          <MexoButton
            variant="purple"
            size="sm"
            onClick={() => setShowPublishModal(true)}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Publish
          </MexoButton>

          {/* Mobile More Options Dropdown Button */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowMobileMoreMenu(prev => !prev)}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMobileMoreMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    setShowAiModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED] rounded-xl flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Generator</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4 text-[#7C3AED]" />
                  <span>Bulk Import</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    setShowBankModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center space-x-2"
                >
                  <Database className="w-4 h-4 text-[#0878E8]" />
                  <span>Question Bank</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    handleDeleteQuiz();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Quiz</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex space-x-6">
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

      {/* 3. MAIN EDITOR TAB CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {activeTab === 'settings' ? (
          <QuizSettingsTab
            settings={quiz.settings}
            onChange={settings => {
              const updated = { ...quiz, settings };
              setQuiz(updated);
              triggerAutoSaveDebounced(updated);
            }}
            onSaveSettings={handleManualSave}
            onCancel={() => navigateWithProtection('/library')}
            isSavingSettings={saveStatus === 'saving'}
          />
        ) : (
          <div className="space-y-6">
            {/* Questions List */}
            {quiz.questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-mexo-card space-y-4 relative group"
              >
                {/* Question Control Toolbar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#7C3AED] font-extrabold text-xs flex items-center justify-center">
                      Q{index + 1}
                    </span>

                    <select
                      value={q.type}
                      onChange={e =>
                        handleUpdateQuestion(index, { ...q, type: e.target.value as QuestionType })
                      }
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

                  {/* Re-order & Actions */}
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

                {/* Question Title Input */}
                <textarea
                  rows={2}
                  value={q.title}
                  onChange={e => handleUpdateQuestion(index, { ...q, title: e.target.value })}
                  placeholder="Type your question prompt here..."
                  className="w-full py-3 px-4 text-sm font-semibold text-slate-900 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none transition-all placeholder:text-slate-400"
                />

                {/* Points & Timing */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-600">Points:</label>
                    <input
                      type="number"
                      value={q.points}
                      min={0}
                      max={100}
                      onChange={e =>
                        handleUpdateQuestion(index, {
                          ...q,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2.5 py-1 text-xs font-bold text-slate-900 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-600">Time Limit:</label>
                    <select
                      value={q.timeLimitSeconds || 0}
                      onChange={e =>
                        handleUpdateQuestion(index, {
                          ...q,
                          timeLimitSeconds: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-bold text-slate-900 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                    >
                      <option value={0}>No limit</option>
                      <option value={15}>15s</option>
                      <option value={30}>30s</option>
                      <option value={45}>45s</option>
                      <option value={60}>60s</option>
                      <option value={90}>90s</option>
                      <option value={120}>2 min</option>
                    </select>
                  </div>
                </div>

                {/* Type Specific Question Options Editor */}
                <QuestionTypeEditors
                  question={q}
                  onChange={updatedQ => handleUpdateQuestion(index, updatedQ)}
                />
              </div>
            ))}

            {/* Add Question Actions */}
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

      {/* Modals */}
      <UnsavedChangesModal
        isOpen={showLeaveModal}
        isSaving={saveStatus === 'saving'}
        saveError={saveErrorMessage}
        onCancel={() => setShowLeaveModal(false)}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveWithoutSaving={handleLeaveWithoutSaving}
      />

      <PublishModal
        isOpen={showPublishModal}
        quiz={quiz}
        onClose={() => setShowPublishModal(false)}
        onConfirmPublish={handleConfirmPublishFromModal}
      />

      {showImportModal && (
        <BulkImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={importedQuestions => {
            const updated = { ...quiz, questions: [...quiz.questions, ...importedQuestions] };
            setQuiz(updated);
            triggerAutoSaveDebounced(updated);
            setShowImportModal(false);
          }}
        />
      )}

      {showBankModal && (
        <QuestionBankSelector
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          onSelectQuestion={(bankQuestion: Question) => {
            const updated = { ...quiz, questions: [...quiz.questions, bankQuestion] };
            setQuiz(updated);
            triggerAutoSaveDebounced(updated);
            setShowBankModal(false);
          }}
        />
      )}

      {showAiModal && (
        <AIGeneratorModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onGenerated={(generatedQs, metadata) => {
            const updated = {
              ...quiz,
              questions: [...quiz.questions, ...generatedQs],
              settings: {
                ...quiz.settings,
                title: quiz.settings.title || metadata.title,
                subject: quiz.settings.subject || metadata.subject,
              },
            };
            setQuiz(updated);
            triggerAutoSaveDebounced(updated);
            setShowAiModal(false);
          }}
        />
      )}
    </div>
  );
};
