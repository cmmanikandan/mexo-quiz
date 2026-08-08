export type ResourceType =
  | 'quiz'
  | 'assessment'
  | 'lesson'
  | 'flashcards'
  | 'interactive_video'
  | 'passage'
  | 'poll'
  | 'survey'
  | 'practice';

export type ResourceVisibility = 'private' | 'link' | 'class_only' | 'public';

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
  | 'drag_drop'
  | 'categorize'
  | 'rating'
  | 'image_question'
  | 'audio_question'
  | 'video_question'
  | 'code_question'
  | 'math_formula'
  | 'poll'
  | 'hotspot'
  | 'passage';

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
  category?: string;    // For categorize
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

export interface AccommodationsConfig {
  extraTimeMultiplier: number; // e.g. 1.5x, 2.0x
  extraAttemptsCount: number;
  reducedAnswerChoices: boolean;
  enableReadAloud: boolean;
  showHints: boolean;
  retryIncorrectAnswers: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  mediaUrl?: string; // image, audio, or video URL
  mediaType?: 'image' | 'audio' | 'video';
  passageText?: string;
  options: QuestionOption[];
  correctAnswers?: string[]; // strings or option IDs
  acceptedBlanks?: string[]; // for fill_blank
  matchingPairs?: { left: string; right: string }[];
  orderingSequence?: string[];
  categories?: string[];
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

export interface LessonSlide {
  id: string;
  title: string;
  content: string; // Markdown / HTML text
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  slideType?: 'title' | 'content' | 'question' | 'poll' | 'code' | 'embed' | 'media';
  embeddedQuestion?: { title: string; options: QuestionOption[] } | Question;
  speakerNotes?: string;
}

export interface Flashcard {
  id: string;
  frontText: string;
  backText: string;
  frontMediaUrl?: string;
  backMediaUrl?: string;
  audioUrl?: string;
  hint?: string;
}

export interface VideoMarker {
  id: string;
  timestampSeconds: number;
  title: string;
  question: Question;
  pauseVideo: boolean;
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
  difficulty?: DifficultyLevel;
  language?: string;
  grade?: string;
  tags?: string[];
  instructions?: string;
  status?: QuizStatus;
  visibility?: ResourceVisibility;
  scheduledPublishDate?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  autoClose?: boolean;
  attemptsLimit?: number; // 0 = unlimited
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  randomizeSubsetCount?: number;
  timerMode?: TimerMode;
  quizDurationMinutes?: number;
  perQuestionDurationSeconds?: number;
  leaderboardVisibility?: LeaderboardVisibility;
  showAnswersAfterQuiz?: boolean;
  showScoreAfterQuiz?: boolean;
  showExplanations?: boolean;
  showCorrectAnswersAfterDueDate?: boolean;
  certificate?: CertificateConfig;
  accommodations?: AccommodationsConfig;
  passingScorePercentage?: number;
  negativeMarkingPercentage?: number;
  autoGrading?: boolean;
  passPercentage?: number;
  showCorrectAnswerImmediately?: boolean;
  allowRetakes?: boolean;
  gradeLevel?: string;
  pacingMode?: 'teacher_led' | 'student_paced';
  enableTabSwitchDetection?: boolean;
  enforceFullscreen?: boolean;
  preventCopyPaste?: boolean;
  maxAllowedViolations?: number;
  joinCode?: string;
}

export interface Quiz {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  resource_type: ResourceType;
  is_public: boolean;
  settings: QuizSettings;
  questions: Question[];
  slides?: LessonSlide[];
  flashcards?: Flashcard[];
  videoMarkers?: VideoMarker[];
  videoUrl?: string;
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
  grade?: string;
  description?: string;
  teacher_id: string;
  teacher_name: string;
  students_count: number;
  created_at: string;
}

export interface ClassroomStudent {
  class_id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  joined_at: string;
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
  status: 'active' | 'due_soon' | 'completed' | 'expired';
}

export interface SecurityEvent {
  id: string;
  attempt_id: string;
  student_id: string;
  quiz_id: string;
  event_type: 'quiz_started' | 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy_attempt' | 'paste_attempt' | 'speed_anomaly' | 'submitted';
  event_time: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}

export type AttemptStatus = 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'expired';

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  user_id: string;
  student_id?: string;
  user_name: string;
  user_avatar?: string;
  assignment_id?: string;
  status?: AttemptStatus;
  score: number;
  max_score: number;
  total_points?: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  xp_earned: number;
  time_spent_seconds: number;
  time_taken_seconds?: number;
  answers: Record<string, any>; // questionId -> answer
  is_passed: boolean;
  certificate_url?: string;
  start_time?: string;
  started_at?: string;
  submitted_at?: string;
  completed_at: string;
  attempt_number?: number;

  // Security & Integrity Metrics
  tab_switch_count?: number;
  window_blur_count?: number;
  fullscreen_exit_count?: number;
  copy_attempt_count?: number;
  paste_attempt_count?: number;
  speed_anomaly_count?: number;
  integrity_score?: number;
  security_status?: 'clean' | 'flagged' | 'invalidated';
  security_events?: SecurityEvent[];
}

export interface LiveSession {
  id: string;
  code: string;
  quiz_id: string;
  host_id: string;
  host_name: string;
  title: string;
  status: 'waiting' | 'active' | 'ended';
  mode: 'classic' | 'team' | 'mastery' | 'test' | 'teacher_paced' | 'student_paced';
  current_question_index: number;
  created_at: string;
}

export interface LiveParticipant {
  id: string;
  session_id: string;
  user_id?: string;
  name: string;
  avatar?: string;
  score: number;
  answers: Record<string, any>;
  joined_at: string;
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

