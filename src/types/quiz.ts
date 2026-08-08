export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer'
  | 'paragraph'
  | 'dropdown'
  | 'matching'
  | 'ordering'
  | 'image_question'
  | 'audio_question'
  | 'video_question'
  | 'code_question'
  | 'math_formula'
  | 'poll'
  | 'hotspot';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type QuizStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type TimerMode = 'none' | 'whole_quiz' | 'per_question';
export type LeaderboardVisibility = 'live' | 'final' | 'hidden';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  imageUrl?: string;
  explanation?: string;
  matchTarget?: string; // For matching
  orderIndex?: number;  // For ordering
}

export interface HotspotArea {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // percentage radius
  label?: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  mediaUrl?: string; // image, audio, or video URL
  mediaType?: 'image' | 'audio' | 'video';
  options: QuestionOption[];
  correctAnswers?: string[]; // strings or option IDs
  acceptedBlanks?: string[]; // for fill_blank
  matchingPairs?: { left: string; right: string }[];
  orderingSequence?: string[];
  hotspotAreas?: HotspotArea[];
  codeLanguage?: string;
  codeStarter?: string;
  mathLaTeX?: string;
  points: number;
  timeLimitSeconds?: number;
  explanation?: string;
  hint?: string;
  isRequired: boolean;
}

export interface CertificateConfig {
  enabled: boolean;
  title: string;
  minScorePercentage: number;
  issuerName: string;
  templateStyle: 'classic' | 'modern' | 'gold' | 'minimal';
}

export interface QuizSettings {
  title: string;
  description: string;
  coverImageUrl?: string;
  subject: string;
  difficulty: DifficultyLevel;
  language: string;
  grade: string;
  tags: string[];
  instructions?: string;
  status: QuizStatus;
  scheduledPublishDate?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  autoClose: boolean;
  attemptsLimit: number; // 0 = unlimited
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  randomizeSubsetCount?: number;
  timerMode: TimerMode;
  quizDurationMinutes?: number;
  perQuestionDurationSeconds?: number;
  leaderboardVisibility: LeaderboardVisibility;
  showAnswersAfterQuiz: boolean;
  showScoreAfterQuiz: boolean;
  showExplanations: boolean;
  showCorrectAnswersAfterDueDate: boolean;
  certificate: CertificateConfig;
  passingScorePercentage: number;
  negativeMarkingPercentage: number;
  autoGrading: boolean;
}

export interface Quiz {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  is_public: boolean;
  settings: QuizSettings;
  questions: Question[];
  plays_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankItem {
  id: string;
  folder: string;
  tags: string[];
  question: Question;
  creator_id: string;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  code: string;
  name: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  students_count: number;
  created_at: string;
}

export interface HomeworkAssignment {
  id: string;
  quiz_id: string;
  quiz_title: string;
  class_id: string;
  class_name: string;
  teacher_id: string;
  due_date: string;
  attempts_allowed: number;
  allow_late_submission: boolean;
  auto_remind: boolean;
  assigned_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  score: number;
  max_score: number;
  percentage: number;
  xp_earned: number;
  time_spent_seconds: number;
  answers: Record<string, any>; // questionId -> answer
  is_passed: boolean;
  certificate_url?: string;
  completed_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'speed' | 'quizzes' | 'social';
  unlocked: boolean;
  unlocked_at?: string;
  progressPercentage: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'reminder' | 'deadline' | 'result' | 'leaderboard' | 'certificate';
  read: boolean;
  link?: string;
  created_at: string;
}
