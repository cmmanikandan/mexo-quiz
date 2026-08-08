import React, { useState } from 'react';
import { Quiz, Question } from '../../types/quiz';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  FileText,
  Radio,
  Globe,
  Lock,
  Calendar,
  Clock,
  Share2,
  ArrowRight,
  Eye,
  BarChart3,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { liveSessionService } from '../../services/liveSessionService';

interface PublishModalProps {
  isOpen: boolean;
  quiz: Quiz;
  onClose: () => void;
  onConfirmPublish: (updatedQuiz: Quiz) => Promise<void>;
}

export type ResourcePublishMode =
  | 'practice'
  | 'assessment'
  | 'assignment'
  | 'live_host'
  | 'public'
  | 'private';

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  quiz,
  onClose,
  onConfirmPublish,
}) => {
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<ResourcePublishMode>('practice');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [createdSessionCode, setCreatedSessionCode] = useState<string | null>(null);

  // Settings for modes
  const [startDate, setStartDate] = useState(
    quiz.settings.startDate || new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    quiz.settings.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [attemptsLimit, setAttemptsLimit] = useState(quiz.settings.attemptsLimit || 1);

  if (!isOpen) return null;

  // 1. Validation Logic
  const validationErrors: string[] = [];
  if (!quiz.settings.title || !quiz.settings.title.trim()) {
    validationErrors.push('Quiz title is required.');
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    validationErrors.push('Quiz must contain at least 1 question.');
  }

  quiz.questions.forEach((q, idx) => {
    if (!q.title || !q.title.trim()) {
      validationErrors.push(`Question ${idx + 1} is missing title text.`);
    }

    if (
      ['multiple_choice', 'true_false', 'dropdown'].includes(q.type) &&
      !q.options.some(o => o.isCorrect)
    ) {
      validationErrors.push(`Question ${idx + 1} needs a correct answer selected.`);
    }

    if (q.type === 'multiple_select' && !q.options.some(o => o.isCorrect)) {
      validationErrors.push(`Question ${idx + 1} needs at least 1 correct checkbox option.`);
    }

    if (q.points < 0) {
      validationErrors.push(`Question ${idx + 1} cannot have negative points.`);
    }
  });

  const hasValidationErrors = validationErrors.length > 0;

  const handleExecutePublish = async () => {
    if (hasValidationErrors) return;
    setIsSubmitting(true);

    try {

    // Determine status (PUBLISHED or SCHEDULED)
    const isScheduled =
      selectedMode === 'assessment' &&
      startDate &&
      new Date(startDate).getTime() > Date.now();
    const finalStatus = isScheduled ? 'scheduled' : 'published';

    const isPublic = selectedMode === 'public';

    const updatedSettings = {
      ...quiz.settings,
      status: finalStatus as any,
      startDate: selectedMode === 'assessment' ? startDate : quiz.settings.startDate,
      endDate: selectedMode === 'assessment' ? endDate : quiz.settings.endDate,
      attemptsLimit: selectedMode === 'assessment' || selectedMode === 'assignment' ? attemptsLimit : quiz.settings.attemptsLimit,
    };

    const updatedQuiz: Quiz = {
      ...quiz,
      is_public: isPublic,
      settings: updatedSettings,
    };

    await onConfirmPublish(updatedQuiz);

    if (selectedMode === 'live_host') {
      try {
        const session = await liveSessionService.createSession(
          updatedQuiz,
          updatedQuiz.creator_id,
          updatedQuiz.creator_name,
          'classic'
        );
        setCreatedSessionCode(session.code);
      } catch (e) {}
    }

    setPublishedSuccess(true);
  } finally {
    setIsSubmitting(false);
  }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(url);
    alert(`Resource link copied to clipboard:\n${url}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!publishedSuccess ? (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Resource</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Publish "{quiz.settings.title || 'Untitled Quiz'}"</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Configure resource mode, schedule, and availability controls.
              </p>
            </div>

            {/* Validation Banner if Invalid */}
            {hasValidationErrors ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Cannot publish yet — {validationErrors.length} issue(s) need fixing:</span>
                </div>

                <ul className="list-disc list-inside space-y-1 text-xs text-rose-800 font-medium pl-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer"
                >
                  Review Questions
                </button>
              </div>
            ) : (
              <>
                {/* Resource Mode Options Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    How do you want to use this quiz?
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedMode('practice')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'practice'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Practice Mode</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Student-paced, instant feedback, optional timer, self-progress.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedMode('assessment')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'assessment'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Assessment Mode</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Timed exam, schedule start/end, attempt limits, anti-cheating.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedMode('assignment')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'assignment'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Assignment Mode</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Assign to specific classes with due date tracking & reminders.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedMode('live_host')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'live_host'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <Radio className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Live Host Mode</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Host multiplayer live room with real-time Join Code.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedMode('public')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'public'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Public Activity</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Discoverable by anyone in the MEXO Quiz ecosystem.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedMode('private')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedMode === 'private'
                          ? 'border-[#7C3AED] bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Private / Link Only</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Restricted access — only users with direct link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Settings per mode */}
                {selectedMode === 'assessment' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Assessment Schedule & Rules
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">End Date & Time</label>
                        <input
                          type="datetime-local"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Summary Card */}
                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="space-y-0.5">
                    <p className="text-slate-900 font-extrabold">Summary before publishing:</p>
                    <p className="text-slate-500">
                      {quiz.questions.length} Questions · Total {quiz.questions.reduce((acc, q) => acc + q.points, 0)} Points
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[11px] font-extrabold capitalize">
                    {selectedMode.replace('_', ' ')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecutePublish}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Publishing...' : 'Publish Quiz Now'}</span>
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* Post-Publish Success Screen */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Published Successfully! ✓</h2>
              <p className="text-xs text-slate-500">
                "{quiz.settings.title}" is now active in database and ready for participation.
              </p>
            </div>

            {createdSessionCode && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 max-w-xs mx-auto space-y-1">
                <p className="text-[11px] font-extrabold text-purple-700 uppercase">Live Host Session Code</p>
                <p className="text-3xl font-black text-[#7C3AED] font-mono tracking-wider">{createdSessionCode}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/host/${createdSessionCode || quiz.id}`);
                }}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-extrabold text-xs border border-purple-200 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all"
              >
                <Radio className="w-5 h-5 text-[#7C3AED]" />
                <span>Host Live</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/assignments');
                }}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Assign Class</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🎮 Join my MEXO Quiz!\n\n📌 Quiz: ${quiz.settings.title}\n🔑 Join Code: ${createdSessionCode || quiz.id.replace(/[^0-9]/g, '').slice(0, 6).padEnd(6, '9')}\n🔗 Link: ${window.location.origin}/quiz/${quiz.id}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all shadow-md"
              >
                <Share2 className="w-5 h-5 text-white" />
                <span>Send WhatsApp</span>
              </a>

              <button
                onClick={handleShareLink}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs border border-emerald-200 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all"
              >
                <Share2 className="w-5 h-5 text-emerald-600" />
                <span>Copy Link</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/quiz/${quiz.id}?preview=true`);
                }}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all"
              >
                <Eye className="w-5 h-5 text-slate-600" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/reports/${quiz.id}`);
                }}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all"
              >
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>View Reports</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/library');
                }}
                className="p-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs flex flex-col items-center justify-center space-y-1 cursor-pointer hover:bg-slate-800 transition-all"
              >
                <ArrowRight className="w-5 h-5 text-purple-300" />
                <span>My Library</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
