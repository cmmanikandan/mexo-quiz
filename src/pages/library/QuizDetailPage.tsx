import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { MexoButton } from '../../components/common/MexoButton';
import { liveSessionService } from '../../services/liveSessionService';
import { QRCodeSVG } from 'qrcode.react';
import {
  Play,
  Edit,
  Radio,
  FileText,
  Copy,
  Check,
  Share2,
  Eye,
  Star,
  BookOpen,
  Clock,
  HelpCircle,
  Award,
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  QrCode,
  Globe,
  Lock,
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const quiz = quizService.getQuizById(id || '') || quizService.getAllQuizzes()[0];
  useDocumentTitle(`${quiz?.settings?.title || 'Resource Details'} — MEXO Quiz`);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showQuestionPreview, setShowQuestionPreview] = useState(true);
  const [showAnswersInPreview, setShowAnswersInPreview] = useState(false);

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User';
  const isOwner = quiz?.creator_id === currentUserId || quiz?.creator_name === currentUserName;

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
        <MexoButton variant="purple" onClick={() => navigate('/library')}>
          Back to Library
        </MexoButton>
      </div>
    );
  }

  // Derive 6-digit Join Code (or generate reproducible code from ID)
  const joinCode = quiz.settings.joinCode || quiz.id.replace(/[^0-9]/g, '').slice(0, 6).padEnd(6, '9');
  const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartLive = async () => {
    const session = await liveSessionService.createSession(quiz, currentUserId, currentUserName, 'classic');
    navigate(`/host/${session.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/library')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Library</span>
        </button>

        <div className="flex items-center space-x-2">
          {isOwner && (
            <MexoButton
              variant="outline"
              size="sm"
              onClick={() => navigate(`/builder/${quiz.id}`)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit Quiz
            </MexoButton>
          )}
          <MexoButton
            variant="outline"
            size="sm"
            onClick={() => navigate(`/quiz/${quiz.id}?preview=true`)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview Engine
          </MexoButton>
        </div>
      </div>

      {/* Main Resource Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-mexo-lg space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-black uppercase tracking-wider">
                {quiz.resource_type || 'Quiz'}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                {quiz.settings.subject}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {quiz.settings.grade || 'K-12'}
              </span>
              {quiz.is_public ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {quiz.settings.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {quiz.settings.description || 'No description provided for this learning activity.'}
            </p>

            {/* Creator Info & Quick Metadata */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <MexoAvatar name={quiz.creator_name} src={quiz.creator_avatar} size="xs" />
                <span className="font-bold text-slate-900">{quiz.creator_name}</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
                <span>{quiz.questions.length} Questions</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{quiz.settings.quizDurationMinutes || 10} Minutes</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{quiz.rating_avg} rating</span>
              </div>
            </div>
          </div>

          {/* Cover Media Image */}
          {quiz.settings.coverImageUrl && (
            <div className="w-full lg:w-64 h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-md shrink-0">
              <img src={quiz.settings.coverImageUrl} alt={quiz.settings.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <MexoButton
              variant="purple"
              size="md"
              onClick={() => navigate(`/quiz/${quiz.id}?mode=test`)}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start Exam Mode
            </MexoButton>

            <button
              onClick={handleStartLive}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Host Live Session</span>
            </button>

            <MexoButton
              variant="outline"
              size="md"
              onClick={() => navigate('/assignments')}
              leftIcon={<FileText className="w-4 h-4 text-blue-600" />}
            >
              Assign Homework
            </MexoButton>
          </div>
        </div>
      </div>

      {/* Share, Join Code & Embed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Join Code Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-purple-600 tracking-wider">6-Digit Join Code</span>
            <QrCode className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setShowQrCode(!showQrCode)} />
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
            <span className="text-2xl font-black font-mono tracking-widest text-[#7C3AED]">{joinCode}</span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center space-x-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Students can join at join page using this unique 6-digit code.</p>
        </div>

        {/* Share Link Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Direct Activity Link</span>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-700 truncate mr-2">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center space-x-1 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Share this direct link with students or post on Google Classroom.</p>
        </div>

        {/* Resource Rules Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Quiz Rules & Anti-Cheating</span>
          <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Passing Score:</span>
              <span className="font-bold">{quiz.settings.passingScorePercentage || 60}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Shuffle Questions:</span>
              <span className="font-bold">{quiz.settings.shuffleQuestions ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Anti-Cheating Safeguard:</span>
              <span className="font-bold text-purple-700">
                {quiz.settings.enableTabSwitchDetection ? 'Active (Tab Switch Detection)' : 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Drawer Modal */}
      {showQrCode && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm mx-auto text-center space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Scan QR Code to Join</h3>
          <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-200">
            <QRCodeSVG value={shareUrl} size={180} />
          </div>
          <p className="text-xs text-slate-500 font-mono">Join Code: {joinCode}</p>
          <button
            onClick={() => setShowQrCode(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Close QR Code
          </button>
        </div>
      )}

      {/* Questions Preview Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-lg font-black text-slate-900">Question List Preview ({quiz.questions.length})</h2>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-600 flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswersInPreview}
                onChange={e => setShowAnswersInPreview(e.target.checked)}
                className="w-4 h-4 accent-[#7C3AED] rounded-md"
              />
              <span>Show Correct Answers</span>
            </label>
            <button
              onClick={() => setShowQuestionPreview(!showQuestionPreview)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {showQuestionPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showQuestionPreview && (
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase">
                      Q{idx + 1} · {q.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{q.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                    {q.points} Pts
                  </span>
                </div>

                {/* Option list preview */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map(opt => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                          showAnswersInPreview && opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {showAnswersInPreview && opt.isCorrect && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            Correct Key
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
