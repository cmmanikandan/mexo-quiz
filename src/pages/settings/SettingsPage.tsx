import React, { useState } from 'react';
import { Settings, Bell, Shield, Eye, Globe, Moon, Save, Check } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Platform Settings & Preferences — MEXO Quiz');
  const [saved, setSaved] = useState(false);

  const [soundEffects, setSoundEffects] = useState(true);
  const [gamification, setGamification] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [readAloudSpeed, setReadAloudSpeed] = useState('1.0x');

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>MEXO Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Settings & Preferences</h1>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Section 1: Gameplay & Gamification */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Quiz & Gameplay Preferences
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Sound Effects & Audio Music</p>
              <p className="text-[11px] text-slate-500">Play celebratory sounds for correct answers and streaks</p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={e => setSoundEffects(e.target.checked)}
              className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Enable XP & Leaderboards</p>
              <p className="text-[11px] text-slate-500">Display XP badges, streaks, and class rank scoreboards</p>
            </div>
            <input
              type="checkbox"
              checked={gamification}
              onChange={e => setGamification(e.target.checked)}
              className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Notification Settings
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Email Homework Reminders</p>
              <p className="text-[11px] text-slate-500">Receive email alerts when homework is assigned or due soon</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={e => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 accent-[#7C3AED] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Accommodations & Accessibility */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Accessibility & Text-to-Speech
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Read Aloud Voice Speed</p>
              <p className="text-[11px] text-slate-500">Playback speed for text-to-speech accommodation</p>
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

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Preferences Saved!</span>
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
  );
};
