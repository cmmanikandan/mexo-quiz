import React, { useState } from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoInput } from '../common/MexoInput';
import { MexoButton } from '../common/MexoButton';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await updatePassword(newPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(res.error || 'Failed to update password.');
    }
  };

  return (
    <MexoModal
      isOpen={isOpen}
      onClose={onClose}
      title={<div className="flex items-center space-x-2"><KeyRound className="w-5 h-5 text-[#7C3AED]" /><span>Change Password</span></div>}
      subtitle="Update password for your unified MEXO Account."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password updated successfully across all MEXO apps!</span>
          </div>
        )}

        <MexoInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />

        <MexoInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          required
        />

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <MexoButton type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </MexoButton>
          <MexoButton type="submit" variant="purple" size="sm" isLoading={isLoading}>
            Update Password
          </MexoButton>
        </div>
      </form>
    </MexoModal>
  );
};
