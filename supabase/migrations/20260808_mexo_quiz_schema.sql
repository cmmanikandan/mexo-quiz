-- MEXO Quiz Supabase Migration 20260808
-- Shares profiles and auth with MEXO Mail & MEXO Forms
-- Fully Idempotent with DROP POLICY IF EXISTS

CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  plays_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  rating_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  certificate_url TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_bank (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  question JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON public.quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_public ON public.quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created ON public.quizzes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(code);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Quizzes Policies
DROP POLICY IF EXISTS "Read Public Quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Insert Own Quiz" ON public.quizzes;
DROP POLICY IF EXISTS "Update Own Quiz" ON public.quizzes;
DROP POLICY IF EXISTS "Delete Own Quiz" ON public.quizzes;
CREATE POLICY "Read Public Quizzes" ON public.quizzes FOR SELECT USING (is_public = true OR creator_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "Insert Own Quiz" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Update Own Quiz" ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Delete Own Quiz" ON public.quizzes FOR DELETE USING (auth.uid() = creator_id OR creator_id IS NULL);

-- Quiz Attempts Policies
DROP POLICY IF EXISTS "Read Own Attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Insert Attempt" ON public.quiz_attempts;
CREATE POLICY "Read Own Attempts" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));
CREATE POLICY "Insert Attempt" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Question Bank Policies
DROP POLICY IF EXISTS "Read Question Bank" ON public.question_bank;
DROP POLICY IF EXISTS "Insert Question Bank" ON public.question_bank;
CREATE POLICY "Read Question Bank" ON public.question_bank FOR SELECT USING (creator_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "Insert Question Bank" ON public.question_bank FOR INSERT WITH CHECK (creator_id = auth.uid() OR creator_id IS NULL);

-- Classrooms Policies
DROP POLICY IF EXISTS "Read Classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teacher Manage Classrooms" ON public.classrooms;
CREATE POLICY "Read Classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Teacher Manage Classrooms" ON public.classrooms FOR ALL USING (teacher_id = auth.uid() OR teacher_id IS NULL);

-- Homework Policies
DROP POLICY IF EXISTS "Read Homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "Teacher Manage Homework" ON public.homework_assignments;
CREATE POLICY "Read Homework" ON public.homework_assignments FOR SELECT USING (true);
CREATE POLICY "Teacher Manage Homework" ON public.homework_assignments FOR ALL USING (teacher_id = auth.uid() OR teacher_id IS NULL);

-- Notifications Policies
DROP POLICY IF EXISTS "Read Notifications" ON public.notifications;
CREATE POLICY "Read Notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'all');

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
