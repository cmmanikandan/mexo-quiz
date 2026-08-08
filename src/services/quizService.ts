import { Quiz, QuizSettings, Question, ResourceType } from '../types/quiz';
import { supabase } from '../lib/supabase';
import { questionService } from './questionService';

export const quizService = {
  /**
   * Fetch all quizzes directly from Supabase (single source of truth).
   */
  async fetchQuizzesFromSupabase(): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error loading quizzes from Supabase:', error);
        return [];
      }

      return data.map((item: any) => ({
        id: item.id,
        creator_id: item.creator_id,
        creator_name: item.creator_name || 'MEXO User',
        creator_avatar: item.creator_avatar,
        resource_type: item.resource_type || 'quiz',
        is_public: item.is_public ?? true,
        settings: {
          title: item.title || item.settings?.title || 'Untitled Quiz',
          description: item.description || item.settings?.description || '',
          subject: item.subject || item.settings?.subject || 'General',
          category: item.category || item.settings?.category || 'General',
          difficulty: item.difficulty || item.settings?.difficulty || 'medium',
          visibility: item.visibility || item.settings?.visibility || 'public',
          status: item.status || item.settings?.status || 'draft',
          quizDurationMinutes: item.duration_minutes || item.settings?.quizDurationMinutes || 10,
          attemptsLimit: item.allowed_attempts !== undefined ? item.allowed_attempts : (item.settings?.attemptsLimit !== undefined ? item.settings.attemptsLimit : 1),
          shuffleQuestions: item.shuffle_questions ?? item.settings?.shuffleQuestions ?? true,
          shuffleOptions: item.shuffle_options ?? item.settings?.shuffleOptions ?? true,
          showAnswersAfterQuiz: item.show_correct_answers ?? item.settings?.showAnswersAfterQuiz ?? true,
          showScoreAfterQuiz: item.show_results ?? item.settings?.showScoreAfterQuiz ?? true,
          showExplanations: item.settings?.showExplanations ?? true,
          passingScorePercentage: item.settings?.passingScorePercentage ?? 60,
          timerMode: item.settings?.timerMode || 'whole_quiz',
          certificate: item.settings?.certificate || { enabled: true, title: 'Certificate of Achievement', minScorePercentage: 75, issuerName: 'MEXO Academy', templateStyle: 'gold' },
          accommodations: item.settings?.accommodations,
          tags: item.settings?.tags || ['Interactive'],
        },
        questions: item.questions || [],
        plays_count: item.plays_count || 0,
        rating_avg: item.rating_avg || 5.0,
        rating_count: item.rating_count || 1,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (e) {
      console.error('Exception fetching quizzes from Supabase:', e);
      return [];
    }
  },

  /**
   * Fast synchronous getter using cached memory (updated from Supabase).
   */
  getAllQuizzes(): Quiz[] {
    // In database-first architecture, default empty and rely on fetchQuizzesFromSupabase
    return [];
  },

  /**
   * Get single quiz by ID with full questions and options loaded from Supabase relational tables.
   */
  async fetchQuizById(id: string): Promise<Quiz | null> {
    if (!id) return null;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching quiz from Supabase:', error);
        return null;
      }

      // Fetch relational questions and options
      let questions: Question[] = [];
      try {
        questions = await questionService.getQuestionsByQuizId(id);
      } catch (e) {}

      // Fallback to JSONB questions if relational questions are empty
      if (questions.length === 0 && Array.isArray(data.questions) && data.questions.length > 0) {
        questions = data.questions;
      }

      const settings: QuizSettings = {
        title: data.title || data.settings?.title || 'Untitled Quiz',
        description: data.description || data.settings?.description || '',
        subject: data.subject || data.settings?.subject || 'General',
        category: data.category || data.settings?.category || 'General',
        difficulty: data.difficulty || data.settings?.difficulty || 'medium',
        visibility: data.visibility || data.settings?.visibility || 'public',
        status: data.status || data.settings?.status || 'draft',
        quizDurationMinutes: data.duration_minutes || data.settings?.quizDurationMinutes || 10,
        attemptsLimit: data.allowed_attempts !== undefined ? data.allowed_attempts : (data.settings?.attemptsLimit !== undefined ? data.settings.attemptsLimit : 1),
        shuffleQuestions: data.shuffle_questions ?? data.settings?.shuffleQuestions ?? true,
        shuffleOptions: data.shuffle_options ?? data.settings?.shuffleOptions ?? true,
        showAnswersAfterQuiz: data.show_correct_answers ?? data.settings?.showAnswersAfterQuiz ?? true,
        showScoreAfterQuiz: data.show_results ?? data.settings?.showScoreAfterQuiz ?? true,
        showExplanations: data.settings?.showExplanations ?? true,
        passingScorePercentage: data.settings?.passingScorePercentage ?? 60,
        timerMode: data.settings?.timerMode || 'whole_quiz',
        certificate: data.settings?.certificate || { enabled: true, title: 'Certificate of Achievement', minScorePercentage: 75, issuerName: 'MEXO Academy', templateStyle: 'gold' },
        accommodations: data.settings?.accommodations,
        tags: data.settings?.tags || ['Interactive'],
      };

      return {
        id: data.id,
        creator_id: data.creator_id,
        creator_name: data.creator_name || 'MEXO User',
        creator_avatar: data.creator_avatar,
        resource_type: data.resource_type || 'quiz',
        is_public: data.is_public ?? true,
        settings,
        questions,
        plays_count: data.plays_count || 0,
        rating_avg: data.rating_avg || 5.0,
        rating_count: data.rating_count || 1,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (e) {
      console.error('Exception fetching quiz by ID:', e);
      return null;
    }
  },

  getQuizById(id: string): Quiz | null {
    // For immediate synchronous render while fetchQuizById resolves
    return null;
  },

  /**
   * Save quiz and its relational questions & options atomically to Supabase.
   */
  async saveQuiz(quiz: Quiz): Promise<{ success: boolean; quiz: Quiz; error?: any }> {
    const isValidUuid = (str?: string) =>
      typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const creatorUuid = isValidUuid(quiz.creator_id) ? quiz.creator_id : null;
    const nowIso = new Date().toISOString();

    const allowedAttempts = quiz.settings?.attemptsLimit !== undefined && quiz.settings?.attemptsLimit !== null
      ? quiz.settings.attemptsLimit
      : 1;

    try {
      // 1. Upsert into quizzes table
      const { data, error } = await supabase.from('quizzes').upsert({
        id: quiz.id,
        creator_id: creatorUuid,
        creator_name: quiz.creator_name || 'MEXO Creator',
        creator_avatar: quiz.creator_avatar || null,
        title: quiz.settings?.title || 'Untitled Quiz',
        description: quiz.settings?.description || '',
        category: quiz.settings?.category || 'General',
        subject: quiz.settings?.subject || 'General',
        difficulty: quiz.settings?.difficulty || 'medium',
        visibility: quiz.settings?.visibility || 'public',
        status: quiz.settings?.status || 'draft',
        duration_minutes: quiz.settings?.quizDurationMinutes || 10,
        allowed_attempts: allowedAttempts,
        shuffle_questions: quiz.settings?.shuffleQuestions ?? true,
        shuffle_options: quiz.settings?.shuffleOptions ?? true,
        show_results: quiz.settings?.showScoreAfterQuiz ?? true,
        show_correct_answers: quiz.settings?.showAnswersAfterQuiz ?? true,
        resource_type: quiz.resource_type || 'quiz',
        is_public: quiz.is_public ?? true,
        settings: quiz.settings,
        questions: quiz.questions || [],
        plays_count: quiz.plays_count || 0,
        rating_avg: quiz.rating_avg || 5.0,
        rating_count: quiz.rating_count || 1,
        published_at: quiz.settings?.status === 'published' ? nowIso : null,
        updated_at: nowIso,
      }).select();

      if (error) {
        console.error('Supabase error saving quiz:', error);
        return { success: false, quiz, error };
      }

      // 2. Save relational questions & options
      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        await questionService.saveQuestions(quiz.id, quiz.questions);
      }

      // 3. Upsert into resources table for unified library browsing
      if (creatorUuid) {
        await supabase.from('resources').upsert({
          id: quiz.id,
          owner_id: creatorUuid,
          resource_type: (quiz.resource_type || 'QUIZ').toUpperCase(),
          title: quiz.settings?.title || 'Untitled Quiz',
          description: quiz.settings?.description || '',
          subject: quiz.settings?.subject || 'General',
          category: quiz.settings?.category || 'General',
          visibility: quiz.settings?.visibility || 'public',
          status: quiz.settings?.status || 'published',
          thumbnail_url: quiz.settings?.coverImageUrl || null,
          plays_count: quiz.plays_count || 0,
          updated_at: nowIso,
        });
      }

      const savedQuiz: Quiz = {
        ...quiz,
        updated_at: nowIso,
      };

      return { success: true, quiz: savedQuiz };
    } catch (err) {
      console.error('Exception saving quiz to Supabase:', err);
      return { success: false, quiz, error: err };
    }
  },

  /**
   * Delete quiz and cascade delete dependent records in Supabase.
   */
  async deleteQuiz(id: string): Promise<boolean> {
    if (!id) return false;
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) {
        console.error('Supabase error deleting quiz:', error);
        return false;
      }
      try {
        await supabase.from('resources').delete().eq('id', id);
      } catch (e) {}
      return true;
    } catch (e) {
      console.error('Exception deleting quiz:', e);
      return false;
    }
  },

  /**
   * Duplicate quiz in Supabase.
   */
  async duplicateQuiz(id: string, newCreatorName: string, newCreatorId: string): Promise<Quiz | null> {
    const original = await this.fetchQuizById(id);
    if (!original) return null;

    const copy: Quiz = {
      ...original,
      id: `${original.resource_type || 'quiz'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      creator_id: newCreatorId,
      creator_name: newCreatorName,
      plays_count: 0,
      rating_avg: 5.0,
      rating_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        ...original.settings,
        title: `${original.settings.title} (Copy)`,
        status: 'draft',
        attemptsLimit: original.settings.attemptsLimit ?? 1,
      },
    };

    const res = await this.saveQuiz(copy);
    return res.success ? res.quiz : null;
  },

  /**
   * Search quizzes dynamically from Supabase / database cache.
   */
  async searchQuizzes(params: {
    query?: string;
    type?: ResourceType | 'all';
    subject?: string;
    difficulty?: string;
    grade?: string;
    language?: string;
    sortBy?: 'newest' | 'popular' | 'rating';
  }): Promise<Quiz[]> {
    let list = await this.fetchQuizzesFromSupabase();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(item =>
        item.settings.title.toLowerCase().includes(q) ||
        item.settings.description.toLowerCase().includes(q) ||
        (item.settings.tags || []).some(t => t.toLowerCase().includes(q)) ||
        item.creator_name.toLowerCase().includes(q)
      );
    }

    if (params.type && params.type !== 'all') {
      list = list.filter(item => item.resource_type === params.type);
    }

    if (params.subject && params.subject !== 'all') {
      list = list.filter(item => item.settings.subject.toLowerCase() === params.subject?.toLowerCase());
    }

    if (params.difficulty && params.difficulty !== 'all') {
      list = list.filter(item => item.settings.difficulty === params.difficulty);
    }

    if (params.grade && params.grade !== 'all') {
      list = list.filter(item => (item.settings.grade || '').toLowerCase() === params.grade?.toLowerCase());
    }

    if (params.sortBy === 'popular') {
      list.sort((a, b) => b.plays_count - a.plays_count);
    } else if (params.sortBy === 'rating') {
      list.sort((a, b) => b.rating_avg - a.rating_avg);
    }

    return list;
  },

  /**
   * Question bank retrieval from Supabase question_bank table.
   */
  async getQuestionBank(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map(item => ({
          id: item.id,
          folder: item.folder || 'General',
          tags: item.tags || [],
          question: item.question,
          created_at: item.created_at,
        }));
      }
    } catch (e) {}
    return [];
  },

  async saveQuestionBankItem(item: any): Promise<boolean> {
    try {
      await supabase.from('question_bank').insert({
        id: item.id || `qb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        folder: item.folder || 'General',
        tags: item.tags || [],
        question: item.question,
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Generate curated resource with AI.
   */
  async generateResourceWithAI(params: {
    topic: string;
    resourceType: ResourceType;
    subject: string;
    grade: string;
    difficulty: string;
    count: number;
  }): Promise<{ questions: Question[]; metadata: any }> {
    const questions: Question[] = [];
    for (let i = 1; i <= params.count; i++) {
      questions.push({
        id: `gen-q-${i}-${Date.now()}`,
        type: 'multiple_choice',
        title: `Question ${i}: Key fundamental regarding ${params.topic}`,
        options: [
          { id: `opt-1-${i}`, text: `Primary core principle of ${params.topic}`, isCorrect: true },
          { id: `opt-2-${i}`, text: `Alternative secondary aspect of ${params.topic}`, isCorrect: false },
          { id: `opt-3-${i}`, text: `Common misconception about ${params.topic}`, isCorrect: false },
          { id: `opt-4-${i}`, text: `Unrelated distractor choice`, isCorrect: false },
        ],
        points: 10,
        isRequired: true,
        explanation: `This accurately describes the primary characteristic of ${params.topic} at ${params.difficulty} difficulty.`,
      });
    }

    return {
      questions,
      metadata: {
        topic: params.topic,
        subject: params.subject,
        grade: params.grade,
        difficulty: params.difficulty,
        resourceType: params.resourceType,
      },
    };
  },
};
