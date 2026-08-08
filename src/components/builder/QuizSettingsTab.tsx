import React from 'react';
import { QuizSettings, DifficultyLevel, TimerMode, LeaderboardVisibility, QuizStatus } from '../../types/quiz';
import { MexoInput } from '../common/MexoInput';
import { MexoToggle } from '../common/MexoToggle';
import { Settings, Shield, Award, Clock, Users, Flame, Lock } from 'lucide-react';

interface QuizSettingsTabProps {
  settings: QuizSettings;
  onChange: (updated: QuizSettings) => void;
}

export const QuizSettingsTab: React.FC<QuizSettingsTabProps> = ({ settings, onChange }) => {
  const update = (patch: Partial<QuizSettings>) => {
    onChange({ ...settings, ...patch });
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
          <MexoInput
            label="Cover Image URL"
            value={settings.coverImageUrl || ''}
            onChange={e => update({ coverImageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
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
              value={settings.attemptsLimit}
              onChange={e => update({ attemptsLimit: parseInt(e.target.value) })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 font-semibold"
            >
              <option value={0}>Unlimited Attempts</option>
              <option value={1}>1 Attempt Only</option>
              <option value={2}>2 Attempts</option>
              <option value={3}>3 Attempts</option>
              <option value={5}>5 Attempts</option>
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
    </div>
  );
};
