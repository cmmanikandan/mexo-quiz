import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MexoInput } from '../../../components/common/MexoInput';
import { MexoButton } from '../../../components/common/MexoButton';
import { MexoAvatar } from '../../../components/common/MexoAvatar';
import { ProfilePhotoUploader } from '../../../components/common/ProfilePhotoUploader';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export const PersonalInfoView: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'User';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
    });
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
        <div className="relative group cursor-pointer" onClick={() => setPhotoModalOpen(true)}>
          <MexoAvatar name={displayName} src={profile?.avatar_url} size="xl" className="w-16 h-16 text-xl shadow-md" />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Profile Photo</h3>
          <p className="text-xs text-slate-500">Visible across MEXO Mail, MEXO Forms, and MEXO Quiz.</p>
          <button
            onClick={() => setPhotoModalOpen(true)}
            className="mt-1.5 text-xs font-bold text-[#7C3AED] hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        {saved && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile information saved!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MexoInput
            label="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
          <MexoInput
            label="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>

        <MexoInput
          label="Primary MEXO Email"
          value={profile?.primary_address || ''}
          disabled
          helperText="Your MEXO primary email is linked to your account."
        />

        <MexoInput
          label="MEXO Username"
          value={profile?.username || ''}
          disabled
          helperText="Unique username used for login."
        />

        <div className="pt-2">
          <MexoButton type="submit" variant="purple" size="sm" isLoading={isLoading}>
            Save Changes
          </MexoButton>
        </div>
      </form>

      <ProfilePhotoUploader isOpen={photoModalOpen} onClose={() => setPhotoModalOpen(false)} />
    </div>
  );
};
