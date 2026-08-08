import React, { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../../components/common/MexoButton';
import { ShieldCheck, Users, BarChart3, Layers, Settings, Lock } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Admin Control Center — MEXO Quiz');

  const users = [
    { id: 'u1', name: 'Dr. Evelyn Vance', email: 'evelyn@mexo.com', role: 'Teacher & Student', status: 'Active' },
    { id: 'u2', name: 'Alex Rivera', email: 'alex@mexo.com', role: 'Teacher', status: 'Active' },
    { id: 'u3', name: 'Prof. Sofia Rossi', email: 'sofia@mexo.com', role: 'Teacher', status: 'Active' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin System Settings & Roles</h1>
        <p className="text-xs text-slate-500 mt-0.5">Control global application settings, user roles, and platform health.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card space-y-1">
          <p className="text-xs text-slate-500 font-bold uppercase">Total Accounts</p>
          <p className="text-2xl font-black text-slate-900">14,280</p>
          <span className="text-[10px] font-bold text-emerald-600">Shared MEXO Profiles</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card space-y-1">
          <p className="text-xs text-slate-500 font-bold uppercase">Total Quizzes Hosted</p>
          <p className="text-2xl font-black text-slate-900">3,450</p>
          <span className="text-[10px] font-bold text-[#7C3AED]">Active Public & Private</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card space-y-1">
          <p className="text-xs text-slate-500 font-bold uppercase">Database Health</p>
          <p className="text-2xl font-black text-emerald-600">100% Operational</p>
          <span className="text-[10px] font-bold text-slate-500">Supabase Shared Backend</span>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-mexo-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900">User Role Management</h3>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{u.name}</p>
                <p className="text-[10px] text-slate-500">{u.email} · Role: {u.role}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
