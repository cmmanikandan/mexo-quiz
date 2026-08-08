import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const MexoToast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#7C3AED] shrink-0" />,
  };

  return (
    <div className="flex items-start p-3.5 bg-white border border-slate-200 rounded-2xl shadow-mexo-popover text-sm text-slate-800 space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md w-full">
      {icons[type]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-bold text-xs text-slate-900 leading-tight mb-0.5">{title}</p>}
        <p className="text-xs text-slate-600 leading-normal">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
