-- ============================================
-- Migration: Reviews, Profiles, Badges
-- Paste into Supabase SQL Editor and run
-- ============================================

-- 1. Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text CHECK (char_length(review_text) <= 500),
  has_spoilers boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reviews_book ON public.reviews(book_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by authenticated users"
  ON public.reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 2. User profile columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 200);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 3. Badge definitions table
CREATE TABLE public.badge_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('reading', 'streak', 'social', 'points')),
  threshold int,
  created_at timestamptz DEFAULT now()
);

-- 4. User badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badge definitions viewable by everyone"
  ON public.badge_definitions FOR SELECT
  USING (true);

CREATE POLICY "User badges viewable by authenticated"
  ON public.user_badges FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert user badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Seed badge definitions
INSERT INTO public.badge_definitions (id, name, description, icon, category, threshold) VALUES
  -- Reading badges
  ('first_book',       'First Chapter',     'Finish your first book',              '1F4D6', 'reading', 1),
  ('bookworm_5',       'Bookworm',          'Finish 5 books',                      '1F41B', 'reading', 5),
  ('bibliophile_10',   'Bibliophile',       'Finish 10 books',                     '1F4DA', 'reading', 10),
  ('page_turner_1000', 'Page Turner',       'Read 1,000 pages total',              '1F4C3', 'reading', 1000),
  ('speed_reader_5000','Speed Reader',      'Read 5,000 pages total',              '26A1',  'reading', 5000),
  -- Streak badges
  ('streak_3',         'On a Roll',         'Maintain a 3-day reading streak',     '1F525', 'streak', 3),
  ('streak_7',         'Week Warrior',      'Maintain a 7-day reading streak',     '2B50',  'streak', 7),
  ('streak_30',        'Monthly Master',    'Maintain a 30-day reading streak',    '1F451', 'streak', 30),
  -- Social badges
  ('team_player',      'Team Player',       'Join your first group',               '1F91D', 'social', 1),
  ('critic',           'Critic',            'Write your first book review',        '270D',  'social', 1),
  ('reviewer_10',      'Prolific Reviewer', 'Write 10 book reviews',              '1F4DD', 'social', 10),
  -- Points badges
  ('centurion',        'Centurion',         'Earn 100 total points',               '1F4AF', 'points', 100),
  ('champion',         'Champion',          'Earn 1,000 total points',             '1F3C6', 'points', 1000),
  ('legend',           'Legend',            'Earn 5,000 total points',             '1F31F', 'points', 5000)
ON CONFLICT (id) DO NOTHING;
