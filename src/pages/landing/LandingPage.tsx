import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Sparkles, Shield, Zap, Award, Trophy, Users, BookOpen, Layers, ArrowRight, Play, CheckCircle2, Flame, ExternalLink, Code, BookMarked
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  useDocumentTitle('MEXO Quiz — Learn. Play. Compete. Improve.');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { switchRole } = useRole();

  const mailUrl = (import.meta as any).env?.VITE_MEXO_MAIL_URL || 'https://mexo-mail.vercel.app';
  const formsUrl = (import.meta as any).env?.VITE_MEXO_FORMS_URL || 'https://mexo-forms.vercel.app';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-100 selection:text-[#7C3AED] select-none">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/welcome')}>
          <img src="/logo.png" alt="MEXO Quiz" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center">
            MEXO <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] bg-clip-text text-transparent font-extrabold text-base sm:text-lg ml-1">Quiz</span>
          </span>
        </div>

        {/* Links & Action buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center space-x-4 text-xs font-bold text-slate-600 mr-2">
            <a href={formsUrl} target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] transition-colors flex items-center space-x-1">
              <span>MEXO Forms</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a href={mailUrl} target="_blank" rel="noreferrer" className="hover:text-[#7C3AED] transition-colors flex items-center space-x-1">
              <span>MEXO Mail</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="hidden sm:block">
            <PWAInstallButton variant="ghost" size="sm" />
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Sign in with MEXO
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-extrabold text-[#7C3AED]">
          <Sparkles className="w-3.5 h-3.5" /> MEXO Quiz Platform
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Learn. Play. Compete.{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] bg-clip-text text-transparent">
              Improve.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            The next-generation interactive learning platform. Create 16+ question types, host real-time live competitions, assign classrooms homework, and earn verified academic certificates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center space-x-2"
            >
              <span>Open Quiz Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/signin')}
                className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md cursor-pointer"
              >
                Sign in with MEXO Account
              </button>
              <button
                onClick={() => navigate('/library')}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer flex items-center space-x-1.5"
              >
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Explore Quiz Library</span>
              </button>
            </>
          )}
        </div>

        {/* Hero Interactive App Mockup Card */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-left p-5 sm:p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="MEXO Quiz" className="w-6 h-6 object-contain" />
                <span className="text-xs font-extrabold text-white">MEXO Quiz Live Engine</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                ● Live Lobby Room: MEXO-9482
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sample Quiz Card */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-900 text-purple-300 text-[10px] font-bold uppercase">
                  Physics & Quantum
                </span>
                <p className="text-xs font-bold text-white">Quantum Physics & Particle Dynamics</p>
                <p className="text-[11px] text-slate-400">15 Questions · LaTeX Formulas · 1,420 Plays</p>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold">★ 4.9 Rating</span>
                  <span className="text-[#7C3AED] font-bold">Try Demo ➔</span>
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-700 pb-1.5">
                  <span className="flex items-center space-x-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /><span>Global Leaderboard</span></span>
                  <span className="text-amber-400 text-[10px]">Weekly</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>👑 #1 Dr. Evelyn Vance</span>
                    <span className="font-mono text-purple-400 font-bold">4,820 XP</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>🥇 #2 Alex Rivera</span>
                    <span className="font-mono text-purple-400 font-bold">4,210 XP</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>🥈 #3 Prof. Sofia Rossi</span>
                    <span className="font-mono text-purple-400 font-bold">3,950 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Feature Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Code className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">16 Question Types</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multiple Choice, Code syntax questions, LaTeX math formulas, Matching pairs, Ordering sequences, Hotspots, and Audio/Video prompts.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Live Competition & QR Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Host high-concurrency live quizzes with join codes, QR codes, waiting room lobbies, host controls, and background music.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Award className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Verified PDF Certificates</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatic certificate generation for passing scores, performance analytics charts (`recharts`), and classroom homework tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Workspace Role Section */}
      <section className="py-12 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Built for Students, Teachers & Admins</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1">
              One single MEXO Account provides seamless access to all workspace roles without multiple logins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div
              onClick={() => { switchRole('student'); navigate('/signin'); }}
              className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="text-3xl">🎓</div>
              <h3 className="text-base font-extrabold text-slate-900">Student Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take quizzes, track daily streaks, earn XP & coins, practice untimed flashcards, and download verified completion certificates.
              </p>
              <span className="text-xs font-bold text-emerald-700 hover:underline block pt-1">Explore Student Mode ➔</span>
            </div>

            <div
              onClick={() => { switchRole('teacher'); navigate('/signin'); }}
              className="p-6 rounded-3xl bg-purple-50/60 border border-purple-200 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="text-3xl">👨‍🏫</div>
              <h3 className="text-base font-extrabold text-slate-900">Teacher Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag-and-drop question builder, bulk import (PDF/DOCX/CSV/MEXO Forms), question bank repository, classrooms, and homework.
              </p>
              <span className="text-xs font-bold text-[#7C3AED] hover:underline block pt-1">Explore Teacher Mode ➔</span>
            </div>

            <div
              onClick={() => { switchRole('admin'); navigate('/signin'); }}
              className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="text-3xl">⚡</div>
              <h3 className="text-base font-extrabold text-slate-900">Admin Control Center</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage user roles, platform categories, system analytics reports, database health, and ecosystem integrations.
              </p>
              <span className="text-xs font-bold text-amber-700 hover:underline block pt-1">Explore Admin Mode ➔</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to get started? CTA Banner */}
      <section className="py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ready to test your knowledge?</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Sign in with your MEXO account and experience the interactive MEXO Quiz platform today.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md cursor-pointer"
            >
              Open Quiz Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0878e8] hover:opacity-95 transition-all shadow-md cursor-pointer"
            >
              Sign in with MEXO Account
            </button>
          )}
        </div>
      </section>

      {/* Dark Ecosystem Footer */}
      <footer className="mt-auto bg-[#0B132B] text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="MEXO Quiz" className="w-6 h-6 object-contain" />
                <span className="font-extrabold text-base text-white tracking-tight">MEXO Quiz</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Learn. Play. Compete. Improve. Fast, interactive, and unified with MEXO Account.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-white text-[11px] uppercase tracking-wider mb-2">MEXO Ecosystem</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => window.open(mailUrl, '_blank')}>MEXO Mail</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => window.open(formsUrl, '_blank')}>MEXO Forms</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/library')}>Quiz Library</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/leaderboard')}>Global Leaderboard</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-white text-[11px] uppercase tracking-wider mb-2">Account & Access</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/signin')}>Sign in to MEXO</p>
              <p className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/account')}>Manage MEXO Account</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-semibold">
            <p>© 2026 MEXO Quiz. All rights reserved.</p>
            <p className="tracking-wider uppercase text-slate-400 font-bold">LEARN. PLAY. COMPETE. IMPROVE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
