import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Mail, FileText, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MAIL_URL = (import.meta as any).env?.VITE_MEXO_MAIL_URL || 'https://mexo-mail.vercel.app';
const FORMS_URL = (import.meta as any).env?.VITE_MEXO_FORMS_URL || 'https://mexo-forms.vercel.app';

export const MexoAppsLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="mexo-apps-launcher"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
        title="MEXO Apps"
        aria-label="MEXO Apps Launcher"
        aria-expanded={isOpen}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-app-border rounded-2xl shadow-mexo-popover p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 mb-2 border-b border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">MEXO Apps</h4>
            <p className="text-[11px] text-slate-500">Ecosystem Applications for your MEXO Account</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* MEXO Mail */}
            <a
              href={MAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#0878e8] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 leading-tight">MEXO Mail</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Mail App</span>
            </a>

            {/* MEXO Forms */}
            <a
              href={FORMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex flex-col items-center text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0878e8] to-[#0668CC] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 leading-tight">MEXO Forms</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Forms App</span>
            </a>

            {/* MEXO Quiz (Active) */}
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col items-center text-center relative select-none">
              <span className="absolute top-1 right-1">
                <CheckCircle2 className="w-3 h-3 text-[#7C3AED]" />
              </span>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center mb-1.5 shadow-sm">
                <img src="/logo.png" alt="MEXO Quiz" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 leading-tight">MEXO Quiz</span>
              <span className="text-[9px] text-[#7C3AED] font-semibold mt-0.5">Active</span>
            </div>

            {/* MEXO Account */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/account');
              }}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex flex-col items-center text-center transition-all cursor-pointer group col-span-3 mt-1"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center mr-2 shadow-sm group-hover:scale-105 transition-transform inline-flex">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Manage MEXO Account & Security</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
