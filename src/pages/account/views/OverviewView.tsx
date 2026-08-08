import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MexoAvatar } from '../../../components/common/MexoAvatar';
import { ProfilePhotoUploader } from '../../../components/common/ProfilePhotoUploader';
import { Shield, User, Key, Laptop, Grid, Lock, Camera, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OverviewView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : 'MEXO User';

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50 border border-purple-100">
        <div className="relative group cursor-pointer" onClick={() => setPhotoModalOpen(true)}>
          <MexoAvatar name={displayName} src={profile?.avatar_url} size="xl" className="w-20 h-20 text-2xl border-4 border-white shadow-mexo-md" />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
            <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-xs text-[#7C3AED] font-mono font-semibold">{profile?.primary_address}</p>
          <p className="text-xs text-slate-500">MEXO ID: {profile?.username || 'user'}</p>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-white text-[#7C3AED] text-xs font-bold shadow-2xs border border-purple-100">
              🎓 Student & 👨‍🏫 Teacher Enabled
            </span>
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Active MEXO Account
            </span>
          </div>
        </div>
      </div>

      {/* Account Settings Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/account/personal')}
          className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-mexo-md transition-all cursor-pointer bg-white group"
        >
          <User className="w-6 h-6 text-[#7C3AED] mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500 mt-1">Manage display name, profile photo, and personal bio details.</p>
        </div>

        <div
          onClick={() => navigate('/account/security')}
          className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-mexo-md transition-all cursor-pointer bg-white group"
        >
          <Shield className="w-6 h-6 text-[#7C3AED] mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
          <p className="text-xs text-slate-500 mt-1">Update authentication password and security parameters.</p>
        </div>

        <div
          onClick={() => navigate('/account/devices')}
          className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-mexo-md transition-all cursor-pointer bg-white group"
        >
          <Laptop className="w-6 h-6 text-[#7C3AED] mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900">Devices & Sessions</h3>
          <p className="text-xs text-slate-500 mt-1">View active login sessions across MEXO Mail, MEXO Forms & MEXO Quiz.</p>
        </div>

        <div
          onClick={() => navigate('/account/apps')}
          className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-mexo-md transition-all cursor-pointer bg-white group"
        >
          <Grid className="w-6 h-6 text-[#7C3AED] mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900">Connected Apps</h3>
          <p className="text-xs text-slate-500 mt-1">Seamless single sign-on across the entire MEXO platform.</p>
        </div>
      </div>

      <ProfilePhotoUploader isOpen={photoModalOpen} onClose={() => setPhotoModalOpen(false)} />
    </div>
  );
};
