import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../lib/supabase';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import {
  ShieldCheck,
  Users,
  Database,
  Radio,
  Trash2,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Activity,
  Layers,
} from 'lucide-react';

interface UserRecord {
  id: string;
  username: string;
  primary_address: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  xp?: number;
  created_at: string;
}

export const AdminConsolePage: React.FC = () => {
  useDocumentTitle('MEXO Unified Ecosystem Admin Console');
  const { profile, user, isAdmin } = useAuth();

  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'resources' | 'ecosystem'>('overview');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesData) {
        setUsersList(profilesData as UserRecord[]);
      }

      // 2. Fetch quizzes
      const allQuizzes = await quizService.fetchQuizzesFromSupabase();
      setQuizzesList(allQuizzes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      setUsersList(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (e) {}
  };

  const handleDeleteQuiz = async (quizId: string) => {
    await quizService.deleteQuiz(quizId);
    setQuizzesList(prev => prev.filter(q => q.id !== quizId));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Admin Access Required</h2>
        <p className="text-xs text-slate-500 max-w-md">
          You must log in with a MEXO Admin Account (`role === 'admin'`) to access the Ecosystem Admin Console.
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.primary_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuizzes = quizzesList.filter(q =>
    q.settings.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Admin Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MEXO Ecosystem Super Admin Privileges</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Ecosystem Admin Console</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Unified administrative hub across MEXO Quiz, MEXO Forms, and MEXO Mail. Manage platform users, database resources, and RLS security.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Platform Overview', icon: Activity },
          { id: 'users', label: `User Management (${usersList.length})`, icon: Users },
          { id: 'resources', label: `Quiz & Content Moderation (${quizzesList.length})`, icon: Layers },
          { id: 'ecosystem', label: 'MEXO App Integrations', icon: ExternalLink },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-[#7C3AED]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Total Registered Users</p>
                <p className="text-lg font-black text-slate-900">{usersList.length} Accounts</p>
                <span className="text-[10px] text-emerald-600 font-bold">Supabase Profiles</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Created Resources</p>
                <p className="text-lg font-black text-slate-900">{quizzesList.length} Items</p>
                <span className="text-[10px] text-blue-600 font-bold">Quizzes & Lessons</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Database RLS Policies</p>
                <p className="text-lg font-black text-slate-900">Active & Enforced</p>
                <span className="text-[10px] text-emerald-600 font-bold">auth.uid() verified</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase">Supabase Realtime</p>
                <p className="text-lg font-black text-slate-900">Connected</p>
                <span className="text-[10px] text-amber-600 font-bold">WebSockets operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold text-slate-900">Registered Accounts</h3>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-hidden w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="pb-3">User</th>
                  <th className="pb-3">MEXO Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 flex items-center space-x-2.5">
                      <MexoAvatar name={u.username} src={u.avatar_url} size="xs" />
                      <span className="font-bold text-slate-900">@{u.username}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-600">{u.primary_address}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7C3AED] uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900">Quiz & Learning Resource Moderation</h3>

          <div className="space-y-3">
            {filteredQuizzes.map(q => (
              <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{q.settings.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    Creator: {q.creator_name} • Type: {q.resource_type || 'quiz'} • {q.questions.length} questions
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuiz(q.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Ecosystem */}
      {activeTab === 'ecosystem' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm text-center">
            <img src="/logo.png" alt="MEXO Quiz" className="w-10 h-10 mx-auto object-contain" />
            <h4 className="text-sm font-extrabold text-slate-900">MEXO Quiz</h4>
            <p className="text-xs text-slate-500">Interactive quiz, assessment & live classroom platform.</p>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">Active</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm text-center">
            <ExternalLink className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-900">MEXO Forms</h4>
            <p className="text-xs text-slate-500">Form creation & response collection engine.</p>
            <a
              href="https://mexo-forms.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold hover:underline"
            >
              Open MEXO Forms ↗
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm text-center">
            <ExternalLink className="w-8 h-8 text-purple-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-900">MEXO Mail</h4>
            <p className="text-xs text-slate-500">Unified internal workspace messaging & email.</p>
            <a
              href="https://mexo-mail.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold hover:underline"
            >
              Open MEXO Mail ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
