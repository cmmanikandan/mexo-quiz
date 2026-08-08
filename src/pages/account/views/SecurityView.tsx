import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MexoButton } from '../../../components/common/MexoButton';
import { ChangePasswordModal } from '../../../components/account/ChangePasswordModal';
import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { profile } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-slate-900">Protected by MEXO Unified Security</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Your single MEXO account password secures your data across MEXO Mail, MEXO Forms, and MEXO Quiz.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <KeyRound className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Password</p>
              <p className="text-xs text-slate-500">Last changed recently</p>
            </div>
          </div>
          <MexoButton variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
            Change Password
          </MexoButton>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-slate-500">Add extra security layer to your MEXO ID</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            Available
          </span>
        </div>
      </div>

      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
};
