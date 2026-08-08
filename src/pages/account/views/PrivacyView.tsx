import React, { useState } from 'react';
import { MexoToggle } from '../../../components/common/MexoToggle';
import { Lock, Shield, Eye, Trash2 } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const [publicProfile, setPublicProfile] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Privacy & Data Control</h3>
        <p className="text-xs text-slate-500">Manage your profile visibility and data preferences.</p>
      </div>

      <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white">
        <MexoToggle
          label="Public Profile Visibility"
          description="Allow classmates and other teachers to find your profile and stats."
          checked={publicProfile}
          onCheckedChange={setPublicProfile}
        />
        <div className="border-t border-slate-100 pt-3">
          <MexoToggle
            label="Display on Public Leaderboards"
            description="Show your rank and XP score on quiz global and class leaderboards."
            checked={showLeaderboard}
            onCheckedChange={setShowLeaderboard}
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
        <div className="flex items-center space-x-2 text-rose-800">
          <Trash2 className="w-5 h-5" />
          <h4 className="text-xs font-bold">Delete MEXO Account</h4>
        </div>
        <p className="text-xs text-rose-700">
          Permanently delete your MEXO Account, quiz results, certificates, and data across all MEXO apps.
        </p>
        <button
          onClick={() => alert('Account deletion requires security verification. Please contact support@mexo.com')}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};
