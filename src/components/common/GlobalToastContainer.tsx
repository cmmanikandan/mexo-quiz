import React, { useState, useEffect } from 'react';
import { toast, ToastMessage } from '../../services/toastService';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const GlobalToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe(updatedList => {
      setToasts(updatedList);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(t => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-white';

        if (t.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-200 bg-white';
        } else if (t.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-200 bg-white';
        } else if (t.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#7C3AED] shrink-0" />;
          borderClass = 'border-purple-200 bg-white';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start space-x-3 text-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">{t.title}</p>
              {t.message && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.message}</p>}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
