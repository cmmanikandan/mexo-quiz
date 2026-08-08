import { NotificationItem } from '../types/quiz';
import { supabase } from '../lib/supabase';

const NOTIFICATIONS_KEY = 'mexo_quiz_notifications_v3';

export const notificationService = {
  getNotifications(): NotificationItem[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  async fetchNotificationsFromSupabase(userId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},user_id.eq.all`)
        .order('created_at', { ascending: false });

      if (data && !error) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
        return data as NotificationItem[];
      }
    } catch (e) {}
    return this.getNotifications();
  },

  markAsRead(id: string): NotificationItem[] {
    const list = this.getNotifications().map(n => (n.id === id ? { ...n, read: true } : n));
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

    (async () => {
      try {
        await supabase.from('notifications').insert({
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          message: item.message,
          type: item.type,
          read: item.read,
          link: item.link,
        });
      } catch (e) {}
    })();

    return item;
  },
};
