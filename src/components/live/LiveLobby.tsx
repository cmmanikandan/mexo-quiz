import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MexoAvatar } from '../common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { liveSessionService } from '../../services/liveSessionService';
import { supabase } from '../../lib/supabase';
import { LiveParticipant, LiveSession } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  Trophy,
  ArrowLeft,
  Copy,
  Check,
  Radio,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const LiveLobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const roomCode = (code || 'MEXO-9482').toUpperCase();

  useDocumentTitle(`Live Room: ${roomCode} — MEXO Quiz`);

  const [musicOn, setMusicOn] = useState(true);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joined, setJoined] = useState(false);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MEXO Scholar';

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const accountId = profile?.username || user?.id?.slice(0, 8) || 'mexo-user';

  // Fetch session & subscribe to Supabase Realtime participants
  useEffect(() => {
    let mounted = true;

    const initRoom = async () => {
      const sess = await liveSessionService.getSessionByCode(roomCode);
      if (sess && mounted) {
        setSession(sess);

        // Auto-join participant using authentic MEXO account data (NO name prompt!)
        const p = await liveSessionService.joinSession(
          sess.code,
          displayName,
          userAvatar,
          profile?.id || user?.id
        );

        if (p && mounted) {
          setJoined(true);
        }

        // Fetch existing participants from Supabase
        try {
          const { data } = await supabase
            .from('live_participants')
            .select('*')
            .eq('session_id', sess.id);
          if (data && mounted) {
            setParticipants(data as LiveParticipant[]);
          }
        } catch (e) {}

        // Subscribe to Realtime inserts/updates
        const channel = supabase
          .channel(`live-lobby-${sess.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${sess.id}` },
            payload => {
              if (payload.eventType === 'INSERT' && mounted) {
                setParticipants(prev => {
                  if (prev.some(item => item.id === payload.new.id)) return prev;
                  return [payload.new as LiveParticipant, ...prev];
                });
              } else if (payload.eventType === 'UPDATE' && mounted) {
                setParticipants(prev => prev.map(item => (item.id === payload.new.id ? (payload.new as LiveParticipant) : item)));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    initRoom();

    return () => {
      mounted = false;
    };
  }, [roomCode, displayName, userAvatar, profile, user]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartQuiz = () => {
    if (session?.quiz_id) {
      navigate(`/quiz/${session.quiz_id}`);
    } else {
      navigate('/');
    }
  };

  const qrUrl = `${window.location.origin}/live/${roomCode}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-sans">
      {/* Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Exit Room"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img src="/logo.png" alt="MEXO Quiz" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">Live Quiz Competition</h1>
            <p className="text-xs text-purple-400 font-mono font-bold">Room Code: {roomCode}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMusicOn(!musicOn)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Toggle Lobby Audio"
          >
            {musicOn ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            onClick={handleStartQuiz}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Enter Live Quiz</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: QR Code & Authenticated User Identity */}
        <div className="space-y-6">
          {/* Room Code & QR Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-2xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              ● Room Code Active
            </span>

            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Join Code</p>
              <h2 className="text-4xl font-black font-mono tracking-widest text-yellow-400 mt-1">{roomCode}</h2>
            </div>

            <div className="p-3 bg-white rounded-3xl shadow-xl inline-block">
              <QRCodeSVG value={qrUrl} size={150} />
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-700"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Direct Invite Link'}</span>
            </button>
          </div>

          {/* Authenticated MEXO Identity Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center space-x-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Joined as MEXO Account</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">Level {profile?.level || 5}</span>
            </div>

            <div className="flex items-center space-x-3.5 pt-1">
              <MexoAvatar
                name={displayName}
                src={userAvatar}
                size="md"
                className="w-12 h-12 text-base font-bold border-2 border-purple-400/50 shadow-md shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-white truncate">{displayName}</h4>
                <p className="text-[11px] text-purple-300 font-mono truncate">Account ID: @{accountId}</p>
                <p className="text-[10px] text-slate-400 font-medium">🔥 {profile?.streak || 7} Day Streak • {profile?.xp || 1250} XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Realtime Players Roster */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white">Live Players ({participants.length})</h3>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold animate-pulse">
                ● Realtime Supabase Sync
              </span>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {participants.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs space-y-2">
                  <Radio className="w-8 h-8 text-slate-500 animate-pulse mx-auto" />
                  <p className="font-bold">Waiting for players to join with code {roomCode}...</p>
                </div>
              ) : (
                participants.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center space-x-3"
                  >
                    <MexoAvatar name={p.name} src={p.avatar} size="sm" className="w-8 h-8 text-xs shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <span className="text-[9px] font-bold text-purple-400 font-mono">Connected</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Room Host: {session?.host_name || 'MEXO Teacher'}</span>
            <span className="text-purple-400 font-bold">Ready to Launch</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4 max-w-7xl mx-auto w-full">
        MEXO Realtime Live Lobby • Unified Account Engine
      </footer>
    </div>
  );
};
