import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export interface AccountSettingsLayoutProps {
  title: string;
  subtitle?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  mobileBackPath?: string;
  isSubpage?: boolean;
}

export const AccountSettingsLayout: React.FC<AccountSettingsLayoutProps> = ({
  title,
  subtitle,
  sidebar,
  children,
  mobileBackPath = '/',
  isSubpage = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-bg text-app-body p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-app-border">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(mobileBackPath)}
            className="p-2 rounded-2xl bg-white border border-app-border hover:bg-slate-50 transition-colors text-app-body cursor-pointer shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-app-heading tracking-tight">{title}</h1>
            </div>
            {subtitle && <p className="text-xs text-app-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7C3AED] text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto">
          <img src="/logo.png" alt="MEXO Account" className="w-4 h-4 object-contain" />
          <span>Unified MEXO Identity</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar: Hidden on mobile when viewing a subpage to prevent stacking underneath */}
        <div className={`lg:col-span-1 ${isSubpage ? 'hidden lg:block' : 'block'}`}>
          {sidebar}
        </div>

        {/* Content View: Full width on mobile when viewing subpage */}
        <div className={`lg:col-span-3 bg-white rounded-3xl border border-app-border shadow-mexo-card p-6 sm:p-8 ${!isSubpage ? 'block' : 'block'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
