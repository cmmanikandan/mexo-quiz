import { Question, QuestionOption } from '../types/quiz';
import { supabase } from '../lib/supabase';

export const questionService = {
  /**
   * Fetch all questions and their relational options directly from Supabase.
   */
  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    try {
      const { data: questionsData, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_number', { ascending: true });

      if (qError || !questionsData) return [];

      const questionIds = questionsData.map(q => q.id);
      let optionsMap: Record<string, QuestionOption[]> = {};

      if (questionIds.length > 0) {
        const { data: optionsData } = await supabase
          .from('quiz_options')
          .select('*')
          .in('question_id', questionIds)
          .order('option_index', { ascending: true });

        if (optionsData) {
          optionsData.forEach((opt: any) => {
            if (!optionsMap[opt.question_id]) optionsMap[opt.question_id] = [];
            optionsMap[opt.question_id].push({
              id: opt.id,
              text: opt.option_text,
              isCorrect: !!opt.is_correct,
            });
          });
        }
      }

      return questionsData.map((q: any) => ({
        id: q.id,
        type: q.question_type,
        title: q.question_text,
        points: q.points || 10,
        explanation: q.explanation || '',
        mediaUrl: q.media_url,
        mediaType: q.media_type,
        hint: q.hint,
        isRequired: q.is_required ?? true,
        options: optionsMap[q.id] || [],
      }));
    } catch (e) {
      console.error('Error fetching questions from Supabase:', e);
      return [];
    }
  },

  /**
   * Save questions and their individual options to Supabase relational tables.
   */
  async saveQuestions(quizId: string, questions: Question[]): Promise<boolean> {
    if (!quizId || !questions) return false;

    try {
      // 1. Delete previous questions (cascades to options)
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

      // 2. Prepare questions rows
      const questionRows = questions.map((q, idx) => ({
        id: q.id || `q-${quizId}-${idx + 1}-${Date.now()}`,
        quiz_id: quizId,
        question_number: idx + 1,
        question_text: q.title || 'Untitled Question',
        question_type: q.type || 'multiple_choice',
        points: q.points || 10,
        explanation: q.explanation || '',
        media_url: q.mediaUrl || null,
        media_type: q.mediaType || null,
        hint: q.hint || null,
        is_required: q.isRequired ?? true,
      }));

      const { error: insertQError } = await supabase.from('quiz_questions').insert(questionRows);
      if (insertQError) {
        console.error('Error inserting quiz questions:', insertQError);
        return false;
      }

      // 3. Prepare options rows
      const optionRows: any[] = [];
      questions.forEach((q, qIdx) => {
        const qId = questionRows[qIdx].id;
        (q.options || []).forEach((opt, optIdx) => {
          optionRows.push({
            id: opt.id || `opt-${qId}-${optIdx + 1}-${Date.now()}`,
            question_id: qId,
            option_text: opt.text || '',
            option_index: optIdx,
            is_correct: !!opt.isCorrect,
          });
        });
      });

      if (optionRows.length > 0) {
        const { error: insertOptError } = await supabase.from('quiz_options').insert(optionRows);
        if (insertOptError) {
          console.error('Error inserting quiz options:', insertOptError);
          return false;
        }
      }

      return true;
    } catch (e) {
      console.error('Exception saving questions to Supabase:', e);
      return false;
    }
  },
};
