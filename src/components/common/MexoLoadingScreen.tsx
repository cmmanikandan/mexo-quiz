import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface MexoLoadingScreenProps {
  message?: string;
  onTimeoutRetry?: () => void;
}

export const MexoLoadingScreen: React.FC<MexoLoadingScreenProps> = ({
  message = 'Connecting to MEXO Account...',
  onTimeoutRetry,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showRetryOption, setShowRetryOption] = useState(false);

  const statusMessages = [
    message,
    'Verifying Unified Account & Credentials...',
    'Synchronizing Library, Quizzes & Progress...',
    'Establishing Secure Realtime Connection...',
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, 1800);

    const timeoutTimer = setTimeout(() => {
      setShowRetryOption(true);
    }, 4500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timeoutTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex flex-col items-center justify-between p-6 z-50 select-none overflow-hidden">
      {/* Background Ambient Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div className="pt-8 flex items-center space-x-2.5 z-10">
        <img src="/logo.png" alt="MEXO" className="w-8 h-8 object-contain" />
        <span className="text-lg font-black tracking-tight text-white">
          MEXO <span className="text-[#A855F7]">Quiz</span>
        </span>
      </div>

      {/* Center Hero Loading Container */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm z-10 px-4 my-auto">
        {/* Animated Glowing Logo Frame */}
        <div className="relative group">
          {/* Pulsing Aura Ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 opacity-65 blur-lg animate-pulse" />

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/90 border border-white/20 backdrop-blur-xl flex items-center justify-center p-4 shadow-2xl">
            <img
              src="/logo.png"
              alt="MEXO Quiz"
              className="w-full h-full object-contain animate-bounce duration-1000"
            />
          </div>
        </div>

        {/* Loading Text & Status Rotator */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-white/10 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unified MEXO Account</span>
          </div>

          <h2 className="text-sm sm:text-base font-extrabold text-white min-h-[24px] transition-all animate-in fade-in">
            {statusMessages[currentMessageIndex]}
          </h2>

          <p className="text-xs text-purple-300/80 max-w-xs leading-relaxed font-medium">
            Accessing your unified library, live sessions, and progress data.
          </p>
        </div>

        {/* Progress Spinner */}
        <div className="flex items-center space-x-2 pt-1">
          <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-purple-300">Authenticating...</span>
        </div>

        {/* Retry Button if loading takes > 4.5 seconds */}
        {showRetryOption && (
          <div className="pt-2 animate-in fade-in space-y-2">
            <button
              onClick={() => {
                if (onTimeoutRetry) onTimeoutRetry();
                else window.location.reload();
              }}
              className="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-2 backdrop-blur-md shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Connection</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Capabilities Banner */}
      <div className="pb-6 z-10 text-center space-y-1.5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300/60">
          Creator · Learner · Host · Participant
        </p>
        <p className="text-[11px] font-mono text-purple-200/40">MEXO Ecosystem Single Sign-On</p>
      </div>
    </div>
  );
};
