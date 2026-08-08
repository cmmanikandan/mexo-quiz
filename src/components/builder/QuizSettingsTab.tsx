import React from 'react';
import { QuizSettings, DifficultyLevel, TimerMode, LeaderboardVisibility, QuizStatus } from '../../types/quiz';
import { MexoInput } from '../common/MexoInput';
import { MexoToggle } from '../common/MexoToggle';
import { Settings, Shield, Award, Clock, Users, Flame, Lock, Upload, Image } from 'lucide-react';

interface QuizSettingsTabProps {
  settings: QuizSettings;
  onChange: (updated: QuizSettings) => void;
  onSaveSettings?: () => void;
  onCancel?: () => void;
  isSavingSettings?: boolean;
}

export const QuizSettingsTab: React.FC<QuizSettingsTabProps> = ({
  settings,
  onChange,
  onSaveSettings,
  onCancel,
  isSavingSettings = false,
}) => {
  const update = (patch: Partial<QuizSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        update({ coverImageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-4xl select-none">
      {/* General Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Settings className="w-5 h-5 text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-slate-900">General Information & Branding</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MexoInput
            label="Quiz Title"
            value={settings.title}
            onChange={e => update({ title: e.target.value })}
            placeholder="e.g. Quantum Physics 101"
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Cover Image</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={settings.coverImageUrl || ''}
                onChange={e => update({ coverImageUrl: e.target.value })}
                placeholder="Image URL or upload local file..."
                className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
              <label className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#7C3AED] text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={settings.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Provide a short overview of what this quiz covers..."
            className="w-full py-2.5 px-3.5 text-xs rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={settings.subject}
              onChange={e => update({ subject: e.target.value })}
              placeholder="e.g. Science"
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={settings.difficulty}
              onChange={e => update({ difficulty: e.target.value as DifficultyLevel })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Grade / Level</label>
            <input
              type="text"
              value={settings.grade}
              onChange={e => update({ grade: e.target.value })}
              placeholder="e.g. K-12, College"
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
            <input
              type="text"
              value={settings.language}
              onChange={e => update({ language: e.target.value })}
              placeholder="English"
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Timer & Availability */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-[#0878E8]" />
          <h3 className="text-sm font-bold text-slate-900">Timer & Availability Controls</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Timer Mode</label>
            <select
              value={settings.timerMode}
              onChange={e => update({ timerMode: e.target.value as TimerMode })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            >
              <option value="none">No Timer</option>
              <option value="whole_quiz">Whole Quiz Duration</option>
              <option value="per_question">Per Question Timer</option>
            </select>
          </div>

          {settings.timerMode === 'whole_quiz' && (
            <MexoInput
              label="Quiz Duration (Minutes)"
              type="number"
              value={settings.quizDurationMinutes || 15}
              onChange={e => update({ quizDurationMinutes: parseInt(e.target.value) || 15 })}
            />
          )}

          {settings.timerMode === 'per_question' && (
            <MexoInput
              label="Per Question Time (Seconds)"
              type="number"
              value={settings.perQuestionDurationSeconds || 30}
              onChange={e => update({ perQuestionDurationSeconds: parseInt(e.target.value) || 30 })}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Attempts</label>
            <select
              value={settings.attemptsLimit !== undefined && settings.attemptsLimit !== null ? settings.attemptsLimit : 1}
              onChange={e => update({ attemptsLimit: parseInt(e.target.value) })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold cursor-pointer"
            >
              <option value={1}>1 Attempt Only (Default)</option>
              <option value={2}>2 Attempts</option>
              <option value={3}>3 Attempts</option>
              <option value={5}>5 Attempts</option>
              <option value={0}>Unlimited Attempts</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <MexoToggle
            label="Shuffle Questions"
            description="Randomize question sequence for every participant."
            checked={!!settings.shuffleQuestions}
            onCheckedChange={val => update({ shuffleQuestions: val })}
          />
          <MexoToggle
            label="Shuffle Options"
            description="Randomize answer choice order per question."
            checked={!!settings.shuffleOptions}
            onCheckedChange={val => update({ shuffleOptions: val })}
          />
        </div>
      </div>

      {/* Pacing & Schedule Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Pacing Mode & Activity Schedule</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pacing Mode</label>
            <select
              value={settings.pacingMode || 'student_paced'}
              onChange={e => update({ pacingMode: e.target.value as any })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold cursor-pointer"
            >
              <option value="student_paced">Student-Paced (Self-Study)</option>
              <option value="teacher_led">Teacher-Led (Host Controls)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date / Time</label>
            <input
              type="datetime-local"
              value={settings.startDate || ''}
              onChange={e => update({ startDate: e.target.value })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date / Time</label>
            <input
              type="datetime-local"
              value={settings.endDate || ''}
              onChange={e => update({ endDate: e.target.value })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Anti-Cheating & Exam Security */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Shield className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">Anti-Cheating & Exam Security Safeguards</h3>
        </div>

        <div className="space-y-3">
          <MexoToggle
            label="Tab Switch & Window Blur Detection"
            description="Track when student leaves the exam window or switches tabs."
            checked={!!settings.enableTabSwitchDetection}
            onCheckedChange={val => update({ enableTabSwitchDetection: val })}
          />

          <MexoToggle
            label="Enforce Fullscreen Exam Mode"
            description="Require students to remain in fullscreen mode throughout the test."
            checked={!!settings.enforceFullscreen}
            onCheckedChange={val => update({ enforceFullscreen: val })}
          />

          <MexoToggle
            label="Block Right-Click & Copy-Paste"
            description="Disable context menu, text selection, and copy-paste shortcuts during test."
            checked={!!settings.preventCopyPaste}
            onCheckedChange={val => update({ preventCopyPaste: val })}
          />
        </div>

        {settings.enableTabSwitchDetection && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Max Allowed Violations Before Auto-Submission
            </label>
            <select
              value={settings.maxAllowedViolations || 3}
              onChange={e => update({ maxAllowedViolations: parseInt(e.target.value) })}
              className="w-full sm:w-64 py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold cursor-pointer"
            >
              <option value={1}>1 Violation (Strict)</option>
              <option value={2}>2 Violations</option>
              <option value={3}>3 Violations (Standard)</option>
              <option value={5}>5 Violations</option>
            </select>
          </div>
        )}
      </div>

      {/* Certificate & Pass Criteria */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-mexo-card">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Certificate Generation & Pass Score</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MexoInput
            label="Passing Score Percentage (%)"
            type="number"
            value={settings.passingScorePercentage}
            onChange={e => update({ passingScorePercentage: parseInt(e.target.value) || 60 })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leaderboard Visibility</label>
            <select
              value={settings.leaderboardVisibility}
              onChange={e => update({ leaderboardVisibility: e.target.value as LeaderboardVisibility })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            >
              <option value="live">Live Leaderboard</option>
              <option value="final">Final Leaderboard Only</option>
              <option value="hidden">Hidden Leaderboard</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <MexoToggle
            label="Issue Completion Certificate"
            description="Generate printable MEXO Certificate when passing threshold is met."
            checked={settings.certificate?.enabled || false}
            onCheckedChange={val =>
              update({
                certificate: {
                  enabled: val,
                  title: settings.certificate?.title || `${settings.title} Certificate`,
                  minScorePercentage: settings.certificate?.minScorePercentage || 75,
                  issuerName: settings.certificate?.issuerName || 'MEXO Academy',
                  templateStyle: settings.certificate?.templateStyle || 'gold',
                },
              })
            }
          />
        </div>
      </div>

      {/* Manual Save Settings Actions Footer */}
      {onSaveSettings && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">
            All quiz rules and settings are automatically synced to the database.
          </p>
          <div className="flex items-center space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onSaveSettings}
              disabled={isSavingSettings}
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving settings...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
