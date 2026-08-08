-- MEXO Quiz Supabase Migration 20260808
-- Shares profiles and auth with MEXO Mail & MEXO Forms

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

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read Public Quizzes" ON public.quizzes FOR SELECT USING (is_public = true OR creator_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "Insert Own Quiz" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Update Own Quiz" ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Delete Own Quiz" ON public.quizzes FOR DELETE USING (auth.uid() = creator_id OR creator_id IS NULL);

CREATE POLICY "Read Own Attempts" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND creator_id = auth.uid()));
CREATE POLICY "Insert Attempt" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
