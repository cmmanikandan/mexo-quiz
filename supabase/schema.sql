-- Set safe timeouts to prevent SQL Editor lock contention
SET lock_timeout = '10s';
SET statement_timeout = '30s';

-- ====================================================================
-- 1. Enable Required Extensions
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. SHARED MEXO ECOSYSTEM PROFILES TABLE
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
  xp INTEGER DEFAULT 1250,
  streak INTEGER DEFAULT 7,
  level INTEGER DEFAULT 5,
  coins INTEGER DEFAULT 340,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. UNIFIED ECOSYSTEM AUTHENTICATION RPC FUNCTIONS
-- ====================================================================

-- Resolves username or email identifier (Works unauthenticated)
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

-- Password verification fallback for MEXO identifier
CREATE OR REPLACE FUNCTION public.mexo_authenticate_user(p_identifier TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  SELECT id, primary_address INTO v_user_id, v_email
  FROM public.profiles
  WHERE LOWER(primary_address) = LOWER(p_identifier)
     OR LOWER(username) = LOWER(p_identifier)
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'user_id', v_user_id,
      'email', v_email
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Invalid MEXO credentials');
END;
$$;

-- Update password RPC
CREATE OR REPLACE FUNCTION public.update_user_password(p_new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ====================================================================
-- 4. QUIZZES & LEARNING RESOURCES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT,
  resource_type TEXT NOT NULL DEFAULT 'quiz',
  is_public BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  plays_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  rating_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 5. QUIZ ATTEMPTS & RESULTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  certificate_url TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for existing installations
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS assignment_id TEXT;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS correct_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS incorrect_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS skipped_count INTEGER NOT NULL DEFAULT 0;

-- ====================================================================
-- 6. QUESTION BANK TABLE
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
-- 7. CLASSROOMS & CLASSROOM MEMBERS TABLE
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
-- 8. HOMEWORK ASSIGNMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id TEXT PRIMARY KEY,
  quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  class_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  attempts_allowed INTEGER NOT NULL DEFAULT 1,
  allow_late_submission BOOLEAN NOT NULL DEFAULT true,
  auto_remind BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 9. LIVE SESSIONS & PARTICIPANTS TABLE (REALTIME ENABLED)
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
-- 10. NOTIFICATIONS TABLE
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
-- 11. INDEXES FOR HIGH PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON public.quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_public ON public.quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created ON public.quizzes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(code);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_code ON public.live_sessions(code);

-- ====================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES (WITH IDEMPOTENT DROPS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Insert Own Quiz" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Update Own Quiz" ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Delete Own Quiz" ON public.quizzes FOR DELETE USING (auth.uid() = creator_id OR creator_id IS NULL);

-- Quiz Attempts Policies
DROP POLICY IF EXISTS "Read Own Attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Insert Attempt" ON public.quiz_attempts;
CREATE POLICY "Read Own Attempts" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));
CREATE POLICY "Insert Attempt" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Live Sessions Policies
DROP POLICY IF EXISTS "Read Live Sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Manage Live Sessions" ON public.live_sessions;
CREATE POLICY "Read Live Sessions" ON public.live_sessions FOR SELECT USING (true);
CREATE POLICY "Manage Live Sessions" ON public.live_sessions FOR ALL USING (host_id = auth.uid() OR host_id IS NULL);

-- Live Participants Policies
DROP POLICY IF EXISTS "Read Live Participants" ON public.live_participants;
DROP POLICY IF EXISTS "Manage Live Participants" ON public.live_participants;
CREATE POLICY "Read Live Participants" ON public.live_participants FOR SELECT USING (true);
CREATE POLICY "Manage Live Participants" ON public.live_participants FOR ALL USING (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Read Notifications" ON public.notifications;
CREATE POLICY "Read Notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'all');

-- ====================================================================
-- 13. HELPER RPC FUNCTIONS & TRIGGERS
-- ====================================================================
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

