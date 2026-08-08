import React from 'react';
import { HardDrive, Cloud, FileText, HelpCircle } from 'lucide-react';

export const StorageView: React.FC = () => {
  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Data & Cloud Storage</h3>
        <p className="text-xs text-slate-500">Storage usage across MEXO services.</p>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">Cloud Storage Usage</span>
          <span className="text-xs font-mono font-bold text-[#7C3AED]">1.4 GB / 15 GB</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#0878E8] rounded-full" style={{ width: '9.3%' }} />
        </div>
        <p className="text-[11px] text-slate-600">
          Used by quiz media attachments, MEXO Forms responses, and MEXO Mail attachments.
        </p>
      </div>
    </div>
  );
};
