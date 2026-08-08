import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MexoModal } from '../common/MexoModal';
import { MexoAvatar } from '../common/MexoAvatar';
import { Zap, Play, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface JoinLiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinLiveQuizModal: React.FC<JoinLiveQuizModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [joinCode, setJoinCode] = useState('');

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email?.split('@')[0] || 'MEXO Scholar';

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const accountId = profile?.username || user?.id?.slice(0, 8) || 'mexo-id';

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onClose();
    const formattedCode = joinCode.trim().toUpperCase();
    navigate(`/live/${formattedCode}`);
  };

  return (
    <MexoModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
          <span className="text-base font-extrabold text-slate-900">Join Live Competition Room</span>
        </div>
      }
      maxWidth="sm"
    >
      <form onSubmit={handleJoin} className="space-y-5 pt-2 select-none">
        {/* MEXO Authenticated Account Identity Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border border-purple-500/30 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 uppercase tracking-wider flex items-center space-x-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>MEXO Verified Identity</span>
            </span>
            <span className="text-[10px] font-bold text-amber-300">Level {profile?.level || 5}</span>
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
              <p className="text-[11px] text-purple-300 font-mono truncate">ID: @{accountId}</p>
              <p className="text-[10px] text-slate-400">Automatic profile sync active</p>
            </div>
          </div>
        </div>

        {/* 6-Digit Join Code Input */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Enter 6-Digit Room Code *
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. 849201"
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-mono text-center font-black tracking-widest text-lg focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-100 outline-hidden uppercase shadow-inner"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Join Live Room</span>
          </button>
        </div>
      </form>
    </MexoModal>
  );
};
