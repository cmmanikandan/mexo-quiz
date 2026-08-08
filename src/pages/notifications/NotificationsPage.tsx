import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  Radio,
  Trophy,
  CheckCheck,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../../components/common/MexoButton';

export const NotificationsPage: React.FC = () => {
  useDocumentTitle('Notifications — MEXO Quiz');
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    notificationService.getNotifications()
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAsRead(id);
    setNotifications(notificationService.getNotifications());
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    notificationService.markAsRead(item.id);
    setNotifications(notificationService.getNotifications());
    if (item.link) {
      navigate(item.link);
    }
  };

  const filtered = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'deadline':
      case 'reminder':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'result':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'certificate':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'leaderboard':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-[#7C3AED]" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Activity Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Your Notifications</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Stay updated with class assignments, quiz scores, certificates, and live multiplayer session invites.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 border border-white/30"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border border-white/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filter === 'unread'
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">No Notifications</h3>
            <p className="text-xs text-slate-500">You are all caught up! New updates will appear here.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-purple-50/50 border-purple-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!item.read && (
                  <button
                    onClick={e => handleMarkAsRead(item.id, e)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-[#7C3AED] hover:bg-purple-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {item.link && <ExternalLink className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
