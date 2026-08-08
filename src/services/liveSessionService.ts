import { LiveSession, LiveParticipant, Quiz } from '../types/quiz';
import { supabase } from '../lib/supabase';

const SESSIONS_KEY = 'mexo_live_sessions_v1';

export const liveSessionService = {
  getLocalSessions(): LiveSession[] {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  saveLocalSessions(list: LiveSession[]) {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
    } catch (e) {}
  },

  async createSession(quiz: Quiz, hostId: string, hostName: string, mode: LiveSession['mode'] = 'classic'): Promise<LiveSession> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newSession: LiveSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      quiz_id: quiz.id,
      host_id: hostId,
      host_name: hostName,
      title: quiz.settings.title,
      status: 'waiting',
      mode,
      current_question_index: 0,
      created_at: new Date().toISOString(),
    };

    const sessions = this.getLocalSessions();
    sessions.unshift(newSession);
    this.saveLocalSessions(sessions);

    try {
      await supabase.from('live_sessions').insert({
        id: newSession.id,
        code: newSession.code,
        quiz_id: newSession.quiz_id,
        host_id: newSession.host_id,
        host_name: newSession.host_name,
        title: newSession.title,
        status: newSession.status,
        mode: newSession.mode,
        current_question_index: newSession.current_question_index,
      });
    } catch (e) {}

    return newSession;
  },

  async getSessionByCode(code: string): Promise<LiveSession | null> {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('code', code)
        .single();
      if (data && !error) return data as LiveSession;
    } catch (e) {}

    const local = this.getLocalSessions().find(s => s.code === code);
    return local || null;
  },

  async joinSession(code: string, participantName: string, avatar?: string, userId?: string): Promise<LiveParticipant | null> {
    const session = await this.getSessionByCode(code);
    if (!session) return null;

    const participant: LiveParticipant = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: session.id,
      user_id: userId,
      name: participantName,
      avatar,
      score: 0,
      answers: {},
      joined_at: new Date().toISOString(),
    };

    try {
      await supabase.from('live_participants').insert({
        id: participant.id,
        session_id: participant.session_id,
        user_id: participant.user_id,
        name: participant.name,
        avatar: participant.avatar,
        score: participant.score,
        answers: participant.answers,
      });
    } catch (e) {}

    return participant;
  },

  async updateSessionStatus(sessionId: string, status: LiveSession['status'], currentQuestionIndex: number = 0): Promise<void> {
    const sessions = this.getLocalSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      sessions[idx].status = status;
      sessions[idx].current_question_index = currentQuestionIndex;
      this.saveLocalSessions(sessions);
    }

    try {
      await supabase.from('live_sessions').update({ status, current_question_index: currentQuestionIndex }).eq('id', sessionId);
    } catch (e) {}
  },
};
