import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MexoInput } from '../../../components/common/MexoInput';
import { MexoButton } from '../../../components/common/MexoButton';
import { Key, Mail, CheckCircle2 } from 'lucide-react';

export const RecoveryView: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [recoveryEmail, setRecoveryEmail] = useState(profile?.recovery_email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ recovery_email: recoveryEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Account Recovery Options</h3>
        <p className="text-xs text-slate-500">Used to regain access if you lose password or access to your primary email.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {saved && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Recovery email updated!</span>
          </div>
        )}

        <MexoInput
          label="Recovery Email Address"
          type="email"
          value={recoveryEmail}
          onChange={e => setRecoveryEmail(e.target.value)}
          placeholder="e.g. personal@gmail.com"
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          helperText="We'll send recovery links to this address if needed."
        />

        <MexoButton type="submit" variant="purple" size="sm">
          Update Recovery Email
        </MexoButton>
      </form>
    </div>
  );
};
