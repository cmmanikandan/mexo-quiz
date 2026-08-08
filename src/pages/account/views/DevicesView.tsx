import React from 'react';
import { Laptop, Smartphone, CheckCircle2 } from 'lucide-react';

export const DevicesView: React.FC = () => {
  const devices = [
    { name: 'Windows PC — Web Browser', location: 'Current Device', active: true, icon: Laptop, app: 'MEXO Quiz' },
    { name: 'Chrome Browser', location: 'Shared MEXO Session', active: true, icon: Laptop, app: 'MEXO Forms' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Signed-in Devices</h3>
        <p className="text-xs text-slate-500">Devices currently authenticated to your MEXO Account.</p>
      </div>

      <div className="space-y-3 max-w-lg">
        {devices.map((d, i) => {
          const Icon = d.icon;
          return (
            <div key={i} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-[#7C3AED]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-900">{d.name}</p>
                    {d.active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{d.location} · {d.app}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
