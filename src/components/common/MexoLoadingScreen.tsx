import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface MexoLoadingScreenProps {
  message?: string;
  onTimeoutRetry?: () => void;
}

export const MexoLoadingScreen: React.FC<MexoLoadingScreenProps> = ({
  message = 'Connecting to MEXO Account...',
  onTimeoutRetry,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(15);
  const [showRetryOption, setShowRetryOption] = useState(false);

  const statusMessages = [
    message,
    'Verifying MEXO Account Security...',
    'Synchronizing Library & Quizzes...',
    'Preparing Unified Workspace...',
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgressPercentage(prev => (prev < 90 ? prev + Math.floor(Math.random() * 15) + 5 : 95));
    }, 250);

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, 1200);

    const timeoutTimer = setTimeout(() => {
      setShowRetryOption(true);
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(timeoutTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0B0F19] text-white flex flex-col items-center justify-between p-6 z-50 select-none overflow-hidden font-sans">
      {/* Background Radial Glow Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="pt-8 flex items-center space-x-2 z-10 opacity-90">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          MEXO ECOSYSTEM
        </span>
      </div>

      {/* Main Center Content Container */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm z-10 px-4 my-auto">
        {/* Signature Glowing Icon Box */}
        <div className="relative group">
          {/* Subtle Outer Gradient Glow Ring */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 opacity-50 blur-md animate-pulse" />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#13192B] border border-white/10 backdrop-blur-xl flex items-center justify-center p-4 shadow-2xl">
            <img
              src="/logo.png"
              alt="MEXO Quiz"
              className="w-full h-full object-contain animate-pulse duration-1000"
            />
          </div>
        </div>

        {/* Title & Brand Name */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            MEXO{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Quiz
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Unified Learning & Assessment Engine
          </p>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-purple-300/90 min-h-[20px] transition-all animate-in fade-in">
            {statusMessages[currentMessageIndex]}
          </p>

          {/* Signature MEXO Sleek Horizontal Progress Bar */}
          <div className="w-52 h-1.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/5 mx-auto">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Connection Retry Button (shows if loading > 4.5s) */}
        {showRetryOption && (
          <div className="pt-3 animate-in fade-in">
            <button
              onClick={() => {
                if (onTimeoutRetry) onTimeoutRetry();
                else window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-extrabold transition-all cursor-pointer inline-flex items-center space-x-2 backdrop-blur-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className="pb-6 z-10 text-center space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Single MEXO Account</span>
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Creator · Learner · Host · Participant
        </p>
      </div>
    </div>
  );
};
