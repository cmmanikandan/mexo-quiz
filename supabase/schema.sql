-- ====================================================================
-- MEXO QUIZ — COMPLETE SUPABASE DATABASE SCHEMA
-- Single Source of Truth for Quizzes, Questions, Attempts, Progress & Security
-- ====================================================================

SET lock_timeout = '10s';
SET statement_timeout = '30s';

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. PROFILES TABLE (AUTHENTICATED USERS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  primary_address TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  recovery_email TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'user')),
  roles TEXT[] DEFAULT ARRAY['student', 'teacher', 'admin'],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. QUIZZES & LEARNING RESOURCES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT 'MEXO Creator',
  creator_avatar TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled Quiz',
  description TEXT,
  category TEXT DEFAULT 'General',
  subject TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT DEFAULT 'medium',
  visibility TEXT DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'draft',
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  allowed_attempts INTEGER NOT NULL DEFAULT 1,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_options BOOLEAN NOT NULL DEFAULT true,
  show_results BOOLEAN NOT NULL DEFAULT true,
  show_correct_answers BOOLEAN NOT NULL DEFAULT true,
  resource_type TEXT NOT NULL DEFAULT 'quiz',
  is_public BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  plays_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  rating_count INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column updates for existing installations
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Quiz';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'General';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS allowed_attempts INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS show_results BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS show_correct_answers BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- ====================================================================
-- 4. RELATIONAL QUIZ QUESTIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL DEFAULT 1,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  points INTEGER NOT NULL DEFAULT 10,
  explanation TEXT,
  media_url TEXT,
  media_type TEXT,
  hint TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 5. RELATIONAL QUIZ OPTIONS TABLE (CORRECT ANSWER SOURCE OF TRUTH)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_options (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_index INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 6. QUIZ ATTEMPTS & RESULTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id TEXT,
  user_name TEXT NOT NULL DEFAULT 'Student',
  user_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'auto_submitted', 'expired')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  certificate_url TEXT,
  tab_switch_count INTEGER NOT NULL DEFAULT 0,
  integrity_score INTEGER NOT NULL DEFAULT 100,
  security_status TEXT NOT NULL DEFAULT 'clean',
  security_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for existing installations
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS assignment_id TEXT;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS correct_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS incorrect_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS skipped_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS integrity_score INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS security_status TEXT NOT NULL DEFAULT 'clean';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS security_events JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ====================================================================
-- 7. ATTEMPT ANSWERS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_option_id TEXT,
  selected_answer JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 8. STUDENT PROGRESS TABLE (XP, STREAKS, ACCURACY)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_progress (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_quizzes_taken INTEGER NOT NULL DEFAULT 0,
  total_passed INTEGER NOT NULL DEFAULT 0,
  overall_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  last_activity_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 9. CERTIFICATES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  issuer_name TEXT NOT NULL DEFAULT 'MEXO Academy',
  score_percentage INTEGER NOT NULL DEFAULT 100,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_code TEXT UNIQUE NOT NULL,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'verified'
);

-- ====================================================================
-- 10. RESOURCES TABLE (LIBRARY ITEMS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('QUIZ', 'ASSESSMENT', 'LESSON', 'FLASHCARD', 'VIDEO', 'PASSAGE')),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'General',
  category TEXT DEFAULT 'General',
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'published',
  thumbnail_url TEXT,
  plays_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 11. ANTI-CHEATING AUDIT LOGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.anti_cheat_logs (
  id TEXT PRIMARY KEY,
  attempt_id TEXT REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'warning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 12. QUESTION BANK TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.question_bank (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  question JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 13. CLASSROOMS & CLASSROOM MEMBERS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  students_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classroom_students (
  class_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- ====================================================================
-- 14. HOMEWORK ASSIGNMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  class_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT,
  instructions TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  start_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  attempts_allowed INTEGER NOT NULL DEFAULT 1,
  allow_late_submission BOOLEAN NOT NULL DEFAULT true,
  auto_remind BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 15. LIVE SESSIONS & PARTICIPANTS TABLE (REALTIME ENABLED)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  mode TEXT NOT NULL DEFAULT 'classic',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_participants (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id TEXT,
  name TEXT NOT NULL,
  avatar TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 16. NOTIFICATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'reminder', 'deadline', 'result', 'leaderboard', 'certificate')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 17. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON public.quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_public ON public.quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created ON public.quizzes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_owner ON public.resources(owner_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_attempt ON public.anti_cheat_logs(attempt_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_code ON public.live_sessions(code);

-- ====================================================================
-- 18. RPC FUNCTIONS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.resolve_mexo_identifier(p_identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT primary_address INTO v_email
  FROM public.profiles
  WHERE LOWER(primary_address) = LOWER(p_identifier)
     OR LOWER(username) = LOWER(p_identifier)
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    RETURN LOWER(v_email);
  END IF;

  IF p_identifier LIKE '%@%' THEN
    RETURN LOWER(p_identifier);
  ELSE
    RETURN LOWER(p_identifier || '@mexo.com');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_quiz_play_count(p_quiz_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.quizzes
  SET plays_count = plays_count + 1
  WHERE id = p_quiz_id;
END;
$$;

-- Function to transactionally update student progress on attempt submission
CREATE OR REPLACE FUNCTION public.sync_student_progress(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_quizzes INTEGER := 0;
  v_total_passed INTEGER := 0;
  v_total_score INTEGER := 0;
  v_total_max_score INTEGER := 0;
  v_total_xp INTEGER := 0;
  v_accuracy NUMERIC(5,2) := 0.00;
  v_streak INTEGER := 0;
  v_level INTEGER := 1;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_passed = true),
    COALESCE(SUM(score), 0),
    COALESCE(SUM(max_score), 0),
    COALESCE(SUM(xp_earned), 0)
  INTO 
    v_total_quizzes,
    v_total_passed,
    v_total_score,
    v_total_max_score,
    v_total_xp
  FROM public.quiz_attempts
  WHERE user_id = p_student_id
    AND status IN ('submitted', 'auto_submitted');

  IF v_total_max_score > 0 THEN
    v_accuracy := ROUND((v_total_score::numeric / v_total_max_score::numeric) * 100, 2);
  ELSE
    v_accuracy := 0.00;
  END IF;

  v_level := GREATEST(1, FLOOR(v_total_xp / 250) + 1);

  -- Calculate streak from distinct activity dates
  SELECT COUNT(DISTINCT DATE(completed_at))
  INTO v_streak
  FROM public.quiz_attempts
  WHERE user_id = p_student_id
    AND status IN ('submitted', 'auto_submitted')
    AND completed_at >= NOW() - INTERVAL '30 days';

  INSERT INTO public.student_progress (
    id, student_id, xp, level, current_streak, longest_streak,
    total_quizzes_taken, total_passed, overall_accuracy, last_activity_date, updated_at
  ) VALUES (
    'prog-' || p_student_id, p_student_id, v_total_xp, v_level, v_streak, v_streak,
    v_total_quizzes, v_total_passed, v_accuracy, NOW(), NOW()
  )
  ON CONFLICT (student_id) DO UPDATE SET
    xp = v_total_xp,
    level = v_level,
    current_streak = v_streak,
    longest_streak = GREATEST(public.student_progress.longest_streak, v_streak),
    total_quizzes_taken = v_total_quizzes,
    total_passed = v_total_passed,
    overall_accuracy = v_accuracy,
    last_activity_date = NOW(),
    updated_at = NOW();

  -- Update profiles table too
  UPDATE public.profiles
  SET xp = v_total_xp,
      level = v_level,
      streak = v_streak,
      updated_at = NOW()
  WHERE id = p_student_id;
END;
$$;

-- ====================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anti_cheat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public Profiles Read" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Quizzes Policies
DROP POLICY IF EXISTS "Read Public Quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Insert Own Quiz" ON public.quizzes;
DROP POLICY IF EXISTS "Update Own Quiz" ON public.quizzes;
DROP POLICY IF EXISTS "Delete Own Quiz" ON public.quizzes;
CREATE POLICY "Read Public Quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Insert Own Quiz" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Update Own Quiz" ON public.quizzes FOR UPDATE USING (true);
CREATE POLICY "Delete Own Quiz" ON public.quizzes FOR DELETE USING (true);

-- Quiz Questions & Options Policies
DROP POLICY IF EXISTS "Read Questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Manage Questions" ON public.quiz_questions;
CREATE POLICY "Read Questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Manage Questions" ON public.quiz_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Read Options" ON public.quiz_options;
DROP POLICY IF EXISTS "Manage Options" ON public.quiz_options;
CREATE POLICY "Read Options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Manage Options" ON public.quiz_options FOR ALL USING (true);

-- Quiz Attempts Policies
DROP POLICY IF EXISTS "Read Attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Insert Attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Update Attempts" ON public.quiz_attempts;
CREATE POLICY "Read Attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Insert Attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Update Attempts" ON public.quiz_attempts FOR UPDATE USING (true);

-- Attempt Answers Policies
DROP POLICY IF EXISTS "Read Answers" ON public.attempt_answers;
DROP POLICY IF EXISTS "Insert Answers" ON public.attempt_answers;
CREATE POLICY "Read Answers" ON public.attempt_answers FOR SELECT USING (true);
CREATE POLICY "Insert Answers" ON public.attempt_answers FOR INSERT WITH CHECK (true);

-- Student Progress & Certificates
DROP POLICY IF EXISTS "Read Progress" ON public.student_progress;
DROP POLICY IF EXISTS "Manage Progress" ON public.student_progress;
CREATE POLICY "Read Progress" ON public.student_progress FOR SELECT USING (true);
CREATE POLICY "Manage Progress" ON public.student_progress FOR ALL USING (true);

DROP POLICY IF EXISTS "Read Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Manage Certificates" ON public.certificates;
CREATE POLICY "Read Certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Manage Certificates" ON public.certificates FOR ALL USING (true);

-- Resources & Anti-Cheat Logs
DROP POLICY IF EXISTS "Read Resources" ON public.resources;
DROP POLICY IF EXISTS "Manage Resources" ON public.resources;
CREATE POLICY "Read Resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Manage Resources" ON public.resources FOR ALL USING (true);

DROP POLICY IF EXISTS "Read Logs" ON public.anti_cheat_logs;
DROP POLICY IF EXISTS "Insert Logs" ON public.anti_cheat_logs;
CREATE POLICY "Read Logs" ON public.anti_cheat_logs FOR SELECT USING (true);
CREATE POLICY "Insert Logs" ON public.anti_cheat_logs FOR INSERT WITH CHECK (true);

-- Classrooms & Homework
DROP POLICY IF EXISTS "Read Classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Manage Classrooms" ON public.classrooms;
CREATE POLICY "Read Classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Manage Classrooms" ON public.classrooms FOR ALL USING (true);

DROP POLICY IF EXISTS "Read Assignments" ON public.homework_assignments;
DROP POLICY IF EXISTS "Manage Assignments" ON public.homework_assignments;
CREATE POLICY "Read Assignments" ON public.homework_assignments FOR SELECT USING (true);
CREATE POLICY "Manage Assignments" ON public.homework_assignments FOR ALL USING (true);

-- Live Sessions & Participants
DROP POLICY IF EXISTS "Read Live Sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Manage Live Sessions" ON public.live_sessions;
CREATE POLICY "Read Live Sessions" ON public.live_sessions FOR SELECT USING (true);
CREATE POLICY "Manage Live Sessions" ON public.live_sessions FOR ALL USING (true);

-- ====================================================================
-- 20. REALTIME PUBLICATIONS
-- ====================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes, public.quiz_attempts, public.live_sessions, public.live_participants, public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END;
$$;

-- ====================================================================
-- 21. AUTH USER PROFILE AUTO-PROVISIONING TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    primary_address,
    first_name,
    last_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'MEXO'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2), 'Scholar'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create initial student progress record
  INSERT INTO public.student_progress (
    id,
    student_id,
    xp,
    level,
    current_streak,
    longest_streak,
    total_quizzes_taken,
    total_passed,
    overall_accuracy,
    updated_at
  ) VALUES (
    'prog-' || NEW.id,
    NEW.id,
    0,
    1,
    0,
    0,
    0,
    0,
    0.00,
    NOW()
  )
  ON CONFLICT (student_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

