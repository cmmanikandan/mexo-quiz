import { supabase } from '../lib/supabase';
import { Quiz, ResourceType } from '../types/quiz';
import { quizService } from './quizService';

export interface LibraryTabCounts {
  all: number;
  quiz: number;
  assessment: number;
  lesson: number;
  flashcards: number;
  interactive_video: number;
  passage: number;
  drafts: number;
  favorites: number;
  shared_with_me: number;
}

export const libraryService = {
  /**
   * Fetch all resources owned by the user from Supabase.
   */
  async getUserResources(userId: string, userName?: string): Promise<Quiz[]> {
    try {
      const allQuizzes = await quizService.fetchQuizzesFromSupabase();
      return allQuizzes.filter(q => q.creator_id === userId || (userName && q.creator_name === userName));
    } catch (e) {
      console.error('Error fetching user resources from Supabase:', e);
      return [];
    }
  },

  /**
   * Fetch shared resources created by others from Supabase.
   */
  async getSharedResources(userId: string, userName?: string): Promise<Quiz[]> {
    try {
      const allQuizzes = await quizService.fetchQuizzesFromSupabase();
      return allQuizzes.filter(
        q => q.creator_id !== userId && (!userName || q.creator_name !== userName) && q.is_public
      );
    } catch (e) {
      return [];
    }
  },

  /**
   * Compute dynamic library tab counts from actual Supabase records.
   */
  calculateTabCounts(myResources: Quiz[], sharedResources: Quiz[]): LibraryTabCounts {
    const counts: LibraryTabCounts = {
      all: myResources.length,
      quiz: 0,
      assessment: 0,
      lesson: 0,
      flashcards: 0,
      interactive_video: 0,
      passage: 0,
      drafts: 0,
      favorites: 0,
      shared_with_me: sharedResources.length,
    };

    myResources.forEach(q => {
      const type = (q.resource_type || 'quiz') as string;
      if (type in counts) {
        (counts as any)[type]++;
      }
      if (q.settings?.status === 'draft') {
        counts.drafts++;
      }
      if ((q.rating_avg || 0) >= 4.8) {
        counts.favorites++;
      }
    });

    return counts;
  },
};
