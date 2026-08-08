import React from 'react';
import { Mail, FileText, CheckCircle2 } from 'lucide-react';

export const ConnectedAppsView: React.FC = () => {
  const MAIL_URL = (import.meta as any).env?.VITE_MEXO_MAIL_URL || 'https://mexo-mail.vercel.app';
  const FORMS_URL = (import.meta as any).env?.VITE_MEXO_FORMS_URL || 'https://mexo-forms.vercel.app';

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Connected MEXO Apps</h3>
        <p className="text-xs text-slate-500">Your MEXO Account provides single sign-on access across all ecosystem products.</p>
      </div>

      <div className="space-y-3">
        {/* MEXO Quiz (Current) */}
        <div className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="MEXO Quiz" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold text-slate-900">MEXO Quiz</p>
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <p className="text-[11px] text-[#7C3AED] font-semibold">Active Application</p>
            </div>
          </div>
        </div>

        {/* MEXO Forms */}
        <a
          href={FORMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 flex items-center justify-between bg-white transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0878e8] to-[#0668CC] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">MEXO Forms</p>
              <p className="text-[11px] text-slate-500">Forms & Surveys App</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#0878E8] hover:underline">Open App →</span>
        </a>

        {/* MEXO Mail */}
        <a
          href={MAIL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 flex items-center justify-between bg-white transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#0878e8] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">MEXO Mail</p>
              <p className="text-[11px] text-slate-500">Secure Webmail App</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#7C3AED] hover:underline">Open App →</span>
        </a>
      </div>
    </div>
  );
};
