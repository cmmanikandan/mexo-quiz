import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Globe,
  Moon,
  Save,
  Check,
  Sliders,
  User,
  Lock,
  Award,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Settings & Preferences — MEXO Quiz');
  const [activeSection, setActiveSection] = useState<'account' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'quiz_prefs' | 'accessibility'>('quiz_prefs');
  const [saved, setSaved] = useState(false);

  // Quiz Preferences State
  const [defaultAttempts, setDefaultAttempts] = useState(1);
  const [defaultShuffleQuestions, setDefaultShuffleQuestions] = useState(true);
  const [defaultShuffleOptions, setDefaultShuffleOptions] = useState(true);
  const [defaultTimerMode, setDefaultTimerMode] = useState<'whole_quiz' | 'none' | 'per_question'>('whole_quiz');
  const [defaultShowResults, setDefaultShowResults] = useState(true);
  const [defaultLeaderboard, setDefaultLeaderboard] = useState(true);
  const [defaultAntiCheating, setDefaultAntiCheating] = useState(true);
  const [defaultCertificate, setDefaultCertificate] = useState(true);

  // Other preferences
  const [soundEffects, setSoundEffects] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [readAloudSpeed, setReadAloudSpeed] = useState('1.0x');

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'quiz_prefs', label: 'Quiz Preferences', icon: Sliders },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Volume2 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>MEXO Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Platform Settings</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Configure global default quiz settings, security parameters, notifications, and accessibility preferences.
          </p>
        </div>
      </div>

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Section Navigation */}
        <div className="space-y-1">
          {sections.map(s => {
            const Icon = s.icon;
            const isSel = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? 'text-white' : 'text-slate-400'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Section: Quiz Preferences */}
          {activeSection === 'quiz_prefs' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Default Quiz Creation Preferences
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These settings apply automatically to newly created quizzes (can be overridden in individual quiz settings).
                </p>
              </div>

              {/* Default Allowed Attempts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Allowed Attempts</p>
                  <p className="text-[11px] text-slate-500">Enforce single attempt by default across all quizzes</p>
                </div>
                <select
                  value={defaultAttempts}
                  onChange={e => setDefaultAttempts(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden"
                >
                  <option value={1}>1 Attempt Only (Default)</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                  <option value={0}>Unlimited Attempts</option>
                </select>
              </div>

              {/* Shuffle Questions */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Shuffle Questions</p>
                  <p className="text-[11px] text-slate-500">Randomize question order dynamically for each student attempt</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultShuffleQuestions}
                  onChange={e => setDefaultShuffleQuestions(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>

              {/* Shuffle Options */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Shuffle Options</p>
                  <p className="text-[11px] text-slate-500">Randomize choice options per question</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultShuffleOptions}
                  onChange={e => setDefaultShuffleOptions(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>

              {/* Default Timer Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Timer Mode</p>
                  <p className="text-[11px] text-slate-500">Whole quiz countdown or per-question pacing</p>
                </div>
                <select
                  value={defaultTimerMode}
                  onChange={e => setDefaultTimerMode(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden"
                >
                  <option value="whole_quiz">Whole Quiz Countdown</option>
                  <option value="per_question">Per Question Timer</option>
                  <option value="none">No Timer (Self-Paced)</option>
                </select>
              </div>

              {/* Result Visibility */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Result & Score Visibility</p>
                  <p className="text-[11px] text-slate-500">Display full score and review immediately upon submission</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultShowResults}
                  onChange={e => setDefaultShowResults(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>

              {/* Leaderboard */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Leaderboard Enabled</p>
                  <p className="text-[11px] text-slate-500">Show student ranking scoreboard on quiz detail and completion pages</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultLeaderboard}
                  onChange={e => setDefaultLeaderboard(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>

              {/* Anti-Cheating */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Anti-Cheating & Tab-Switch Detection</p>
                  <p className="text-[11px] text-slate-500">Detect tab switches, window blurs, and full-screen exits</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultAntiCheating}
                  onChange={e => setDefaultAntiCheating(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>

              {/* Certificate */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Default Certificate of Completion</p>
                  <p className="text-[11px] text-slate-500">Issue verifiable certificate if score exceeds passing percentage</p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultCertificate}
                  onChange={e => setDefaultCertificate(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Section: Account & Security */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Account Information</h3>
              <p className="text-xs text-slate-500">Manage unified identity, username, email, and password credentials.</p>
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1">
                <p className="text-xs font-bold text-purple-900">Unified MEXO Single Account</p>
                <p className="text-[11px] text-purple-700">
                  Your account allows creating, taking, assigning, hosting, and tracking quizzes seamlessly without switching roles.
                </p>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Notifications</h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Email Homework & Assignment Alerts</p>
                  <p className="text-[11px] text-slate-500">Receive alerts when new quizzes are assigned or due</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={e => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Section: Accessibility */}
          {activeSection === 'accessibility' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Accessibility</h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Read Aloud Voice Speed</p>
                  <p className="text-[11px] text-slate-500">Playback speed for question audio synthesis</p>
                </div>
                <select
                  value={readAloudSpeed}
                  onChange={e => setReadAloudSpeed(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden"
                >
                  <option value="0.75x">0.75x (Slower)</option>
                  <option value="1.0x">1.0x (Normal)</option>
                  <option value="1.25x">1.25x (Faster)</option>
                  <option value="1.5x">1.5x (Fast)</option>
                </select>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Preferences Saved Successfully!</span>
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
