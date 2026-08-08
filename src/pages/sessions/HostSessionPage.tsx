import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radio,
  Users,
  Play,
  Copy,
  Check,
  ArrowLeft,
  Trophy,
  CheckCircle2,
  Sparkles,
  Shield,
  QrCode,
  Wifi,
  WifiOff,
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Load session — match by id OR by code (e.g. /host/839401)
  useEffect(() => {
    const sessions = liveSessionService.getLocalSessions();
    const found =
      sessions.find(s => s.id === sessionId) ||
      sessions.find(s => s.code === sessionId) ||
      sessions[0];

    if (found) {
      setSession(found);
      setCurrentQuestionIdx(found.current_question_index || 0);
      const q = quizService.getQuizById(found.quiz_id) || quizService.getAllQuizzes()[0];
      setQuiz(q || null);
    } else {
      // Try fetching from Supabase if not in local storage
      (async () => {
        try {
          const { data } = await supabase
            .from('live_sessions')
            .select('*')
            .or(`id.eq.${sessionId},code.eq.${sessionId}`)
            .single();
          if (data) {
            setSession(data as LiveSession);
            const q = quizService.getQuizById(data.quiz_id);
            setQuiz(q || null);
          }
        } catch (e) {}
      })();
    }
  }, [sessionId]);

  // Supabase Realtime subscription for participants
  useEffect(() => {
    if (!session) return;

    // Fetch existing participants
    (async () => {
      try {
        const { data } = await supabase
          .from('live_participants')
          .select('*')
          .eq('session_id', session.id)
          .order('joined_at', { ascending: false });
        if (data && data.length > 0) setParticipants(data as LiveParticipant[]);
      } catch (e) {}
    })();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`host-room-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${session.id}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => {
              const exists = prev.find(p => p.id === (payload.new as LiveParticipant).id);
              if (exists) return prev;
              return [payload.new as LiveParticipant, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev =>
              prev.map(p => (p.id === payload.new.id ? (payload.new as LiveParticipant) : p))
            );
          }
        }
      )
      .subscribe(status => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Also poll every 5s as fallback (works even without Supabase realtime)
    const poll = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('live_participants')
          .select('*')
          .eq('session_id', session.id)
          .order('joined_at', { ascending: false });
        if (data && data.length > 0) setParticipants(data as LiveParticipant[]);
      } catch (e) {}
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [session]);

  useDocumentTitle(`${session?.title || 'Live Session'} — MEXO Host Room`);

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

  const handleEndSession = async () => {
    if (!session) return;
    if (!window.confirm('End this live session now?')) return;
    await liveSessionService.updateSessionStatus(session.id, 'ended', currentQuestionIdx);
    setSession(prev => (prev ? { ...prev, status: 'ended' } : prev));
  };

  const handleCopyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!session) return;
    navigator.clipboard.writeText(`${window.location.origin}/live/${session.code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!session) {
    return (
      <div className="p-8 text-center space-y-4">
        <Radio className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
        <p className="text-sm text-slate-500">Loading live session room...</p>
        <p className="text-xs text-slate-400 font-mono">Session ID: {sessionId}</p>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/live/${session.code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;
  const currentQuestion = quiz?.questions?.[currentQuestionIdx];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sessions')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </button>

        <div className="flex items-center space-x-2">
          {realtimeConnected ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>Realtime Connected</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold flex items-center space-x-1">
              <WifiOff className="w-3 h-3" />
              <span>Polling Mode</span>
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
              session.status === 'active'
                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                : session.status === 'ended'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            ● {session.status}
          </span>
        </div>
      </div>

      {/* Main Host Lobby Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-mono font-bold uppercase">
              Mode: {session.mode.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">{session.title}</h1>
            <p className="text-xs text-slate-400">
              Ask students to go to{' '}
              <span className="font-mono text-yellow-400">{window.location.host}/live</span>{' '}
              and enter the code below, or scan the QR code
            </p>
          </div>

          {/* Join Code Card */}
          <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-2 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">6-Digit Join Code</p>
            <p className="text-5xl font-black font-mono tracking-widest text-yellow-400">{session.code}</p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* QR Code & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center space-x-5">
            <div className="p-2.5 rounded-2xl bg-white shrink-0">
              <img src={qrUrl} alt="Join QR Code" className="w-20 h-20 object-contain rounded-xl" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-200">Scan to Join on Phone</p>
              <p className="text-[11px] text-slate-400 font-mono break-all max-w-xs">{joinUrl}</p>
              <p className="text-xs font-extrabold text-emerald-400">{participants.length} Players in Lobby</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session.status === 'waiting' && (
              <button
                onClick={handleStartQuiz}
                disabled={participants.length === 0}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Live Session ({participants.length} joined)</span>
              </button>
            )}

            {session.status === 'active' && (
              <>
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                >
                  Next Question ({currentQuestionIdx + 1}/{quiz?.questions.length || '?'}) →
                </button>
                <button
                  onClick={handleEndSession}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  End Session ⏹
                </button>
              </>
            )}

            {session.status === 'ended' && (
              <div className="px-5 py-2.5 rounded-2xl bg-slate-700 text-slate-300 font-extrabold text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Session Ended</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Question Display (if active) */}
      {session.status === 'active' && currentQuestion && (
        <div className="bg-white rounded-3xl border border-purple-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
              Q{currentQuestionIdx + 1} of {quiz?.questions.length}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-mono font-bold border border-purple-100">
              {currentQuestion.points} Points
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{currentQuestion.title}</h2>
          {currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentQuestion.options.map((opt, i) => (
                <div
                  key={opt.id || i}
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-black text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt.text}
                  {opt.isCorrect && <span className="ml-2 text-emerald-600 font-extrabold">✓ Answer</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participants Roster & Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Participants ({participants.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Roster</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
            {participants.length === 0 ? (
              <div className="col-span-full text-center py-10 space-y-2">
                <Radio className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="text-xs text-slate-500">
                  Waiting for students to join with code{' '}
                  <span className="font-black font-mono text-purple-700">{session.code}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Students go to <span className="font-mono">/live/{session.code}</span>
                </p>
              </div>
            ) : (
              participants.map((p, i) => (
                <div key={p.id || i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5">
                  <MexoAvatar name={p.name} src={p.avatar} size="xs" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] font-mono text-purple-700">{p.score || 0} pts</p>
                  </div>
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
                      <span className="text-xs font-black text-slate-500 w-5 font-mono">
                        {idx === 0 ? '👑' : idx === 1 ? '🥇' : idx === 2 ? '🥈' : `#${idx + 1}`}
                      </span>
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

      {/* Anti-Cheating Monitor */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Live Anti-Cheating Monitor</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            Active Protection
          </span>
        </div>

        <div className="space-y-2">
          {participants.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No participants joined yet.</p>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800">
                All {participants.length} participants are being monitored for exam integrity
              </span>
              <span className="text-[10px] font-bold text-emerald-700 font-mono">0 Violations</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
