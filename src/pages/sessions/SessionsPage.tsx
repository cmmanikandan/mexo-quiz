import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Plus,
  Play,
  Users,
  QrCode,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { liveSessionService } from '../../services/liveSessionService';
import { quizService } from '../../services/quizService';
import { LiveSession, Quiz } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { JoinLiveQuizModal } from '../../components/live/JoinLiveQuizModal';

export const SessionsPage: React.FC = () => {
  useDocumentTitle('Live Interactive Sessions — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [sessions] = useState<LiveSession[]>(() => liveSessionService.getLocalSessions());
  const [quizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');
  const [selectedMode, setSelectedMode] = useState<LiveSession['mode']>('classic');

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User';

  const handleStartNewLiveSession = async () => {
    const quiz = quizService.getQuizById(selectedQuizId);
    if (!quiz) return;

    const newSession = await liveSessionService.createSession(quiz, currentUserId, currentUserName, selectedMode);
    navigate(`/host/${newSession.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-rose-300 animate-pulse" />
            <span>MEXO Realtime Live Sessions</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Multiplayer & Live Sessions</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Host live teacher-paced or student-paced quiz sessions with real-time scoreboards, QR codes, and participant response feeds powered by Supabase.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2 border border-white/30"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Join Live Room</span>
          </button>
        </div>
      </div>

      {/* Start Live Session Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
          <Radio className="w-5 h-5 text-rose-500" />
          <span>Launch a New Live Session</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Activity to Host</label>
            <select
              value={selectedQuizId}
              onChange={e => setSelectedQuizId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden bg-white"
            >
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.settings.title} ({q.questions.length} Qs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Session Mode</label>
            <select
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden bg-white"
            >
              <option value="classic">Classic (Individual Speed & Accuracy)</option>
              <option value="teacher_paced">Teacher-Paced (Instructor controls slides/questions)</option>
              <option value="student_paced">Student-Paced (Self-paced room)</option>
              <option value="team">Team Mode (Group score aggregation)</option>
              <option value="mastery">Mastery Mode (Retry until correct)</option>
              <option value="test">Test Mode (Strict timed test)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleStartNewLiveSession}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Live Session Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active & Recent Sessions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Your Live Sessions History</h3>

        {sessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Radio className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No active or past live sessions</h3>
            <p className="text-xs text-slate-500">Launch a live session above to host multiplayer quizzes with instant live leaderboards.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => navigate(`/host/${s.id}`)}
                className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase font-mono">
                      Code: {s.code}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{s.title}</h4>
                  <p className="text-xs text-slate-500">Mode: {s.mode.replace('_', ' ')} • Host: {s.host_name}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>Re-open Lobby</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <JoinLiveQuizModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
};
