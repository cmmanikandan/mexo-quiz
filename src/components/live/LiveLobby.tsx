import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MexoAvatar } from '../common/MexoAvatar';
import { MexoButton } from '../common/MexoButton';
import { Users, Play, Pause, XCircle, Volume2, VolumeX, Shield, Trophy } from 'lucide-react';

export const LiveLobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const joinCode = code || 'MEXO-9482';

  const [musicOn, setMusicOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 'p1', name: 'Dr. Evelyn Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', score: 140 },
    { id: 'p2', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', score: 120 },
    { id: 'p3', name: 'Prof. Sofia Rossi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', score: 110 },
    { id: 'p4', name: 'Marcus Chen', score: 90 },
    { id: 'p5', name: 'Sarah Jenkins', score: 85 },
  ]);

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="MEXO Quiz" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-lg font-extrabold text-white">Live Quiz Competition</h1>
            <p className="text-xs text-purple-400 font-mono font-bold">Room Code: {joinCode}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMusicOn(!musicOn)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Toggle Lobby Music"
          >
            {musicOn ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <MexoButton
            variant="purple"
            size="md"
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                setIsPlaying(true);
                navigate('/quiz/quiz-quantum-physics');
              }
            }}
            leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isPlaying ? 'Pause Quiz' : 'Start Live Quiz'}
          </MexoButton>
        </div>
      </div>

      {/* Main Lobby Center Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-auto py-8">
        {/* Left: Join Code & QR Code */}
        <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl flex flex-col items-center justify-center">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join at mexo-quiz.com</p>
            <h2 className="text-4xl font-extrabold text-white font-mono tracking-widest mt-1 text-[#7C3AED]">
              {joinCode}
            </h2>
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-xl inline-block">
            <QRCodeSVG value={`https://mexo-quiz.vercel.app/live/${joinCode}`} size={160} />
          </div>

          <p className="text-xs text-slate-400">Scan QR Code with phone camera to join instantly!</p>
        </div>

        {/* Right: Connected Participants Grid */}
        <div className="lg:col-span-2 bg-slate-900/90 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Connected Players ({participants.length})</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse">
              ● Waiting Room Active
            </span>
          </div>

          {/* Participants Avatar Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
            {participants.map((p, idx) => (
              <div key={p.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between group">
                <div className="flex items-center space-x-3 min-w-0">
                  <MexoAvatar name={p.name} src={p.avatar} size="sm" className="w-8 h-8 text-xs shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-purple-400 font-mono">Rank #{idx + 1}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                  title="Remove player"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        MEXO Realtime Live Leaderboard & Lobby Engine
      </div>
    </div>
  );
};
