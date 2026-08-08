import { supabase } from '../lib/supabase';
import { SecurityEvent } from '../types/quiz';

export interface AntiCheatLogItem {
  id: string;
  attemptId: string;
  studentId: string;
  studentName?: string;
  eventType: string;
  eventTime: string;
  severity: 'info' | 'warning' | 'critical';
  metadata: Record<string, any>;
  createdAt: string;
}

export const antiCheatService = {
  /**
   * Log a security or integrity violation directly to Supabase anti_cheat_logs table.
   */
  async logEvent(
    attemptId: string,
    studentId: string,
    eventType: string,
    severity: 'info' | 'warning' | 'critical' = 'warning',
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    if (!attemptId) return false;

    try {
      const { error } = await supabase.from('anti_cheat_logs').insert({
        id: `acl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        attempt_id: attemptId,
        student_id: studentId,
        event_type: eventType,
        severity,
        metadata,
        event_time: new Date().toISOString(),
      });

      if (error) {
        console.error('Error logging anti-cheat event to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Exception logging anti-cheat event:', e);
      return false;
    }
  },

  /**
   * Fetch all logs for a specific attempt from Supabase.
   */
  async getAttemptLogs(attemptId: string): Promise<AntiCheatLogItem[]> {
    if (!attemptId) return [];

    try {
      const { data, error } = await supabase
        .from('anti_cheat_logs')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('event_time', { ascending: true });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        attemptId: item.attempt_id,
        studentId: item.student_id,
        eventType: item.event_type,
        eventTime: item.event_time,
        severity: item.severity || 'warning',
        metadata: item.metadata || {},
        createdAt: item.created_at,
      }));
    } catch (e) {
      return [];
    }
  },

  /**
   * Fetch all anti-cheat logs across all student attempts for reports.
   */
  async getAllAntiCheatLogs(): Promise<AntiCheatLogItem[]> {
    try {
      const { data, error } = await supabase
        .from('anti_cheat_logs')
        .select('*')
        .order('event_time', { ascending: false })
        .limit(100);

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        attemptId: item.attempt_id,
        studentId: item.student_id,
        eventType: item.event_type,
        eventTime: item.event_time,
        severity: item.severity || 'warning',
        metadata: item.metadata || {},
        createdAt: item.created_at,
      }));
    } catch (e) {
      return [];
    }
  },
};
