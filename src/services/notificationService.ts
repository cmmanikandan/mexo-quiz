import { NotificationItem } from '../types/quiz';

const NOTIFICATIONS_KEY = 'mexo_quiz_notifications_v1';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'all',
    title: '🎉 Welcome to MEXO Quiz!',
    message: 'Start learning, competing, and testing your skills across hundreds of interactive quizzes.',
    type: 'assignment',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'all',
    title: '📚 New Homework Assigned',
    message: 'Alex Rivera assigned "JavaScript Modern ES6+ & Async Architecture" due in 3 days.',
    type: 'assignment',
    read: false,
    link: '/quiz/quiz-js-mastery',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'all',
    title: '🏆 Weekly Leaderboard Updated',
    message: 'You are currently in the Top 5% on the Global Quiz Leaderboard!',
    type: 'leaderboard',
    read: true,
    link: '/leaderboard',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const notificationService = {
  getNotifications(): NotificationItem[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  },

  markAsRead(id: string): NotificationItem[] {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {}
    return list;
  },

  markAllAsRead(): NotificationItem[] {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {}
    return list;
  },

  addNotification(n: Omit<NotificationItem, 'id' | 'read' | 'created_at'>): NotificationItem {
    const list = this.getNotifications();
    const item: NotificationItem = {
      ...n,
      id: `notif-${Date.now()}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(item);
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    } catch (e) {}
    return item;
  },
};
