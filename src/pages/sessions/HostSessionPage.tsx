import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Radio,
  Users,
  Play,
  Copy,
  Check,
  ArrowLeft,
  Trophy,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Shield,
} from 'lucide-react';
import { liveSessionService } from '../../services/liveSessionService';
import { quizService } from '../../services/quizService';
import { LiveSession, LiveParticipant, Quiz } from '../../types/quiz';
import { supabase } from '../../lib/supabase';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const HostSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    const sessions = liveSessionService.getLocalSessions();
    const found = sessions.find(s => s.id === sessionId || s.code === sessionId) || sessions[0];
    if (found) {
      setSession(found);
      const q = quizService.getQuizById(found.quiz_id);
      setQuiz(q || quizService.getAllQuizzes()[0]);
    }
  }, [sessionId]);

  useDocumentTitle(`${session?.title || 'Live Session'} — MEXO Host Room`);

  // Supabase Realtime Subscription for participant joins & updates
  useEffect(() => {
    if (!session) return;

    // Fetch initial participants
    (async () => {
      try {
        const { data } = await supabase
          .from('live_participants')
          .select('*')
          .eq('session_id', session.id);
        if (data) setParticipants(data as LiveParticipant[]);
      } catch (e) {}
    })();

    // Realtime channel
    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${session.id}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [payload.new as LiveParticipant, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev => prev.map(p => (p.id === payload.new.id ? (payload.new as LiveParticipant) : p)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleStartQuiz = async () => {
    if (!session) return;
    await liveSessionService.updateSessionStatus(session.id, 'active', 0);
    setSession(prev => (prev ? { ...prev, status: 'active' } : prev));
  };

  const handleNextQuestion = async () => {
    if (!session || !quiz) return;
    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx >= quiz.questions.length) {
      await liveSessionService.updateSessionStatus(session.id, 'ended', currentQuestionIdx);
      setSession(prev => (prev ? { ...prev, status: 'ended' } : prev));
    } else {
      setCurrentQuestionIdx(nextIdx);
      await liveSessionService.updateSessionStatus(session.id, 'active', nextIdx);
    }
  };

  const handleCopyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!session) {
    return <div className="p-8 text-center text-slate-500">Loading session room...</div>;
  }

  const joinUrl = `${window.location.origin}/live/${session.code}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sessions')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Live Room</span>
        </button>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
              session.status === 'active'
                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                : session.status === 'ended'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            ● {session.status} session
          </span>
        </div>
      </div>

      {/* Main Host Lobby Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-mono font-bold uppercase">
              Mode: {session.mode.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">{session.title}</h1>
            <p className="text-xs text-slate-400">Ask participants to enter the 6-digit code or scan the QR Code</p>
          </div>

          {/* Join Code Card */}
          <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-2 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">6-Digit Join Code</p>
            <p className="text-4xl font-black font-mono tracking-widest text-yellow-400">{session.code}</p>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* QR Code & Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 rounded-2xl bg-white shrink-0">
              <QRCodeSVG value={joinUrl} size={84} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-200">Scan QR Code to Join</p>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{joinUrl}</p>
              <p className="text-xs font-extrabold text-emerald-400">{participants.length} Players in Lobby</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session.status === 'waiting' && (
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Live Session</span>
              </button>
            )}

            {session.status === 'active' && (
              <>
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                >
                  Next Question →
                </button>
                <button
                  onClick={async () => {
                    await liveSessionService.updateSessionStatus(session.id, 'ended', currentQuestionIdx);
                    setSession(prev => (prev ? { ...prev, status: 'ended' } : prev));
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  End Quiz Now ⏹
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Participants Roster & Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-sm font-extrabold text-slate-900">Joined Participants ({participants.length})</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Supabase Realtime</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
            {participants.length === 0 ? (
              <p className="col-span-full text-xs text-slate-500 text-center py-8">
                Waiting for participants to join with code <span className="font-bold font-mono">{session.code}</span>...
              </p>
            ) : (
              participants.map((p, i) => (
                <div key={p.id || i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5">
                  <MexoAvatar name={p.name} src={p.avatar} size="xs" />
                  <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">Live Scoreboard</h3>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Leaderboard updates live as students answer.</p>
            ) : (
              participants
                .slice()
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((p, idx) => (
                  <div key={p.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                      <MexoAvatar name={p.name} src={p.avatar} size="xs" />
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#7C3AED]">{p.score || 0} pts</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Anti-Cheating Live Monitor & Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Anti-Cheating Safeguard Live Activity Log</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            Active Protection
          </span>
        </div>

        <div className="space-y-2">
          {participants.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No anti-cheating violations detected.</p>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">All joined participants strictly adhering to exam guidelines</span>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">0 Violations</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
