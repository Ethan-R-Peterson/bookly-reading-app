-- ============================================
-- BOOKLY DEMO SEED DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Get the group ID from invite code
DO $$
DECLARE
  target_group_id uuid;
BEGIN
  SELECT id INTO target_group_id FROM groups WHERE invite_code = 'W7Y0CD';
  IF target_group_id IS NULL THEN
    RAISE EXCEPTION 'Group with invite code W7Y0CD not found';
  END IF;
  RAISE NOTICE 'Found group: %', target_group_id;
END $$;

-- Step 2a: Create auth.users entries (required for foreign key)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('d1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sophia.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '45 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcus.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '40 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jenna.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '38 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'devon.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '35 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '42 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tyler.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '30 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aisha.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '36 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chris.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '28 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luna.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '33 days', NOW(), '', ''),
  ('d1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ethan.demo@bookly.app', crypt('demo12345', gen_salt('bf')), NOW(), NOW() - INTERVAL '25 days', NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

-- Step 2b: Create public users
INSERT INTO users (id, username, avatar_url, bio, is_public, current_streak, longest_streak, last_read_date, created_at) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'SophiaReads', NULL, 'English lit major. Always have a book in my bag.', true, 12, 18, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '45 days'),
  ('d1000000-0000-0000-0000-000000000002', 'MarcusB', NULL, 'CS student who reads sci-fi to procrastinate.', true, 5, 9, CURRENT_DATE, NOW() - INTERVAL '40 days'),
  ('d1000000-0000-0000-0000-000000000003', 'JennaWrites', NULL, 'Aspiring novelist. Reading everything I can.', true, 8, 14, CURRENT_DATE, NOW() - INTERVAL '38 days'),
  ('d1000000-0000-0000-0000-000000000004', 'DevonK', NULL, 'History nerd. Big fan of narrative nonfiction.', true, 3, 7, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '35 days'),
  ('d1000000-0000-0000-0000-000000000005', 'Priya_S', NULL, 'Pre-med but make it literary fiction.', true, 15, 15, CURRENT_DATE, NOW() - INTERVAL '42 days'),
  ('d1000000-0000-0000-0000-000000000006', 'TylerNovel', NULL, 'Fantasy and thriller enthusiast.', true, 0, 5, CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000007', 'AishaLit', NULL, 'Book club president. Will judge your TBR.', true, 7, 11, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '36 days'),
  ('d1000000-0000-0000-0000-000000000008', 'ChrisReads', NULL, 'Econ major. Reading list is half textbooks half novels.', true, 2, 6, CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '28 days'),
  ('d1000000-0000-0000-0000-000000000009', 'LunaPages', NULL, 'Cozy reader. Tea and a good book is my whole personality.', true, 10, 10, CURRENT_DATE, NOW() - INTERVAL '33 days'),
  ('d1000000-0000-0000-0000-000000000010', 'EthanFlips', NULL, 'Speed reader. 52 books a year challenge.', true, 4, 8, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert books (using realistic Google Books IDs)
INSERT INTO books (id, google_books_id, title, author, cover_url, page_count, genre, description, rating, ratings_count, created_at) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'demo_dune', 'Dune', 'Frank Herbert', 'https://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=1', 688, 'Science Fiction', 'A stunning blend of adventure and mysticism.', 4.2, 58420, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000002', 'demo_1984', '1984', 'George Orwell', 'https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1', 328, 'Dystopian Fiction', 'A masterpiece of political fiction.', 4.4, 112300, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000003', 'demo_gatsby', 'The Great Gatsby', 'F. Scott Fitzgerald', 'https://books.google.com/books/content?id=iXn5U2IzVH0C&printsec=frontcover&img=1&zoom=1', 180, 'Classic Fiction', 'The American Dream examined.', 3.9, 89450, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000004', 'demo_hobbit', 'The Hobbit', 'J.R.R. Tolkien', 'https://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1', 310, 'Fantasy', 'An unexpected journey.', 4.3, 95200, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000005', 'demo_sapiens', 'Sapiens', 'Yuval Noah Harari', 'https://books.google.com/books/content?id=FmyBAwAAQBAJ&printsec=frontcover&img=1&zoom=1', 443, 'Nonfiction', 'A brief history of humankind.', 4.4, 67800, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000006', 'demo_hunger', 'The Hunger Games', 'Suzanne Collins', 'https://books.google.com/books/content?id=sazytgAACAAJ&printsec=frontcover&img=1&zoom=1', 374, 'Dystopian Fiction', 'May the odds be ever in your favor.', 4.3, 134000, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000007', 'demo_educated', 'Educated', 'Tara Westover', 'https://books.google.com/books/content?id=2ObWDgAAQBAJ&printsec=frontcover&img=1&zoom=1', 334, 'Memoir', 'A memoir of transformation.', 4.5, 72100, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000008', 'demo_project_hail', 'Project Hail Mary', 'Andy Weir', 'https://books.google.com/books/content?id=RJp_zQEACAAJ&printsec=frontcover&img=1&zoom=1', 476, 'Science Fiction', 'A lone astronaut must save Earth.', 4.6, 45300, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000009', 'demo_midnight', 'The Midnight Library', 'Matt Haig', 'https://books.google.com/books/content?id=Y54JEAAAQBAJ&printsec=frontcover&img=1&zoom=1', 288, 'Literary Fiction', 'Between life and death is a library.', 4.2, 53200, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000010', 'demo_atomic', 'Atomic Habits', 'James Clear', 'https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 320, 'Self-Help', 'Tiny changes, remarkable results.', 4.4, 88900, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000011', 'demo_song_achilles', 'The Song of Achilles', 'Madeline Miller', 'https://books.google.com/books/content?id=6YGJwMq5sOQC&printsec=frontcover&img=1&zoom=1', 378, 'Historical Fiction', 'A retelling of the Iliad.', 4.3, 61000, NOW() - INTERVAL '50 days'),
  ('b1000000-0000-0000-0000-000000000012', 'demo_gone_girl', 'Gone Girl', 'Gillian Flynn', 'https://books.google.com/books/content?id=_GjNxCal5RkC&printsec=frontcover&img=1&zoom=1', 415, 'Thriller', 'A twisted tale of marriage.', 4.0, 97400, NOW() - INTERVAL '50 days')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create user_books (mix of reading and finished)
INSERT INTO user_books (id, user_id, book_id, status, current_page, started_at, finished_at) VALUES
  -- Sophia: finished 3, reading 1
  ('ab100000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'finished', 180, NOW() - INTERVAL '40 days', NOW() - INTERVAL '30 days'),
  ('ab100000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'finished', 334, NOW() - INTERVAL '28 days', NOW() - INTERVAL '15 days'),
  ('ab100000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011', 'finished', 378, NOW() - INTERVAL '14 days', NOW() - INTERVAL '3 days'),
  ('ab100000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'reading', 142, NOW() - INTERVAL '2 days', NULL),
  -- Marcus: finished 2, reading 1
  ('ab100000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'finished', 688, NOW() - INTERVAL '35 days', NOW() - INTERVAL '18 days'),
  ('ab100000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 'finished', 476, NOW() - INTERVAL '17 days', NOW() - INTERVAL '5 days'),
  ('ab100000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'reading', 201, NOW() - INTERVAL '4 days', NULL),
  -- Jenna: finished 2, reading 1
  ('ab100000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009', 'finished', 288, NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days'),
  ('ab100000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'finished', 180, NOW() - INTERVAL '18 days', NOW() - INTERVAL '10 days'),
  ('ab100000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000011', 'reading', 250, NOW() - INTERVAL '8 days', NULL),
  -- Devon: finished 1, reading 1
  ('ab100000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 'finished', 443, NOW() - INTERVAL '30 days', NOW() - INTERVAL '14 days'),
  ('ab100000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000010', 'reading', 180, NOW() - INTERVAL '10 days', NULL),
  -- Priya: finished 3, reading 1 (top reader)
  ('ab100000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'finished', 328, NOW() - INTERVAL '38 days', NOW() - INTERVAL '28 days'),
  ('ab100000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', 'finished', 334, NOW() - INTERVAL '26 days', NOW() - INTERVAL '15 days'),
  ('ab100000-0000-0000-0000-000000000015', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000009', 'finished', 288, NOW() - INTERVAL '14 days', NOW() - INTERVAL '6 days'),
  ('ab100000-0000-0000-0000-000000000016', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'reading', 320, NOW() - INTERVAL '5 days', NULL),
  -- Tyler: finished 1, reading 1
  ('ab100000-0000-0000-0000-000000000017', 'd1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'finished', 310, NOW() - INTERVAL '25 days', NOW() - INTERVAL '12 days'),
  ('ab100000-0000-0000-0000-000000000018', 'd1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000012', 'reading', 280, NOW() - INTERVAL '10 days', NULL),
  -- Aisha: finished 2, reading 1
  ('ab100000-0000-0000-0000-000000000019', 'd1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000006', 'finished', 374, NOW() - INTERVAL '32 days', NOW() - INTERVAL '20 days'),
  ('ab100000-0000-0000-0000-000000000020', 'd1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000011', 'finished', 378, NOW() - INTERVAL '18 days', NOW() - INTERVAL '7 days'),
  ('ab100000-0000-0000-0000-000000000021', 'd1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000008', 'reading', 190, NOW() - INTERVAL '6 days', NULL),
  -- Chris: finished 1, reading 1
  ('ab100000-0000-0000-0000-000000000022', 'd1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000010', 'finished', 320, NOW() - INTERVAL '22 days', NOW() - INTERVAL '10 days'),
  ('ab100000-0000-0000-0000-000000000023', 'd1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 'reading', 200, NOW() - INTERVAL '8 days', NULL),
  -- Luna: finished 2, reading 1
  ('ab100000-0000-0000-0000-000000000024', 'd1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 'finished', 180, NOW() - INTERVAL '28 days', NOW() - INTERVAL '18 days'),
  ('ab100000-0000-0000-0000-000000000025', 'd1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'finished', 288, NOW() - INTERVAL '16 days', NOW() - INTERVAL '5 days'),
  ('ab100000-0000-0000-0000-000000000026', 'd1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000007', 'reading', 220, NOW() - INTERVAL '4 days', NULL),
  -- Ethan: finished 2, reading 1
  ('ab100000-0000-0000-0000-000000000027', 'd1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000006', 'finished', 374, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'),
  ('ab100000-0000-0000-0000-000000000028', 'd1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', 'finished', 688, NOW() - INTERVAL '22 days', NOW() - INTERVAL '8 days'),
  ('ab100000-0000-0000-0000-000000000029', 'd1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000012', 'reading', 150, NOW() - INTERVAL '5 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Add all demo users + real user to the group
INSERT INTO group_members (group_id, user_id)
SELECT g.id, u.id
FROM groups g
CROSS JOIN (
  VALUES
    ('d1000000-0000-0000-0000-000000000001'::uuid),
    ('d1000000-0000-0000-0000-000000000002'::uuid),
    ('d1000000-0000-0000-0000-000000000003'::uuid),
    ('d1000000-0000-0000-0000-000000000004'::uuid),
    ('d1000000-0000-0000-0000-000000000005'::uuid),
    ('d1000000-0000-0000-0000-000000000006'::uuid),
    ('d1000000-0000-0000-0000-000000000007'::uuid),
    ('d1000000-0000-0000-0000-000000000008'::uuid),
    ('d1000000-0000-0000-0000-000000000009'::uuid),
    ('d1000000-0000-0000-0000-000000000010'::uuid)
) AS u(id)
WHERE g.invite_code = 'W7Y0CD'
ON CONFLICT DO NOTHING;

-- Step 6: Award points (varied amounts to make leaderboard interesting)
INSERT INTO points (user_id, amount, reason, reference_id, created_at) VALUES
  -- Sophia: 180+334+378+142 pages + 3 finish bonuses + streak bonuses + reviews = ~1234 pts
  ('d1000000-0000-0000-0000-000000000001', 180, 'pages', NULL, NOW() - INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000001', 50, 'finish_bonus', NULL, NOW() - INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000001', 334, 'pages', NULL, NOW() - INTERVAL '15 days'),
  ('d1000000-0000-0000-0000-000000000001', 50, 'finish_bonus', NULL, NOW() - INTERVAL '15 days'),
  ('d1000000-0000-0000-0000-000000000001', 378, 'pages', NULL, NOW() - INTERVAL '3 days'),
  ('d1000000-0000-0000-0000-000000000001', 50, 'finish_bonus', NULL, NOW() - INTERVAL '3 days'),
  ('d1000000-0000-0000-0000-000000000001', 142, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000001', 50, 'streak_bonus', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000001', 20, 'streak_bonus', NULL, NOW() - INTERVAL '15 days'),
  ('d1000000-0000-0000-0000-000000000001', 30, 'review', NULL, NOW() - INTERVAL '14 days'),
  -- Marcus: 688+476+201 + 2 finish + streaks = ~1515
  ('d1000000-0000-0000-0000-000000000002', 688, 'pages', NULL, NOW() - INTERVAL '18 days'),
  ('d1000000-0000-0000-0000-000000000002', 50, 'finish_bonus', NULL, NOW() - INTERVAL '18 days'),
  ('d1000000-0000-0000-0000-000000000002', 476, 'pages', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000002', 50, 'finish_bonus', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000002', 201, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000002', 50, 'streak_bonus', NULL, NOW() - INTERVAL '8 days'),
  ('d1000000-0000-0000-0000-000000000002', 20, 'review', NULL, NOW() - INTERVAL '4 days'),
  -- Jenna: 288+180+250 + 2 finish + streaks + reviews = ~888
  ('d1000000-0000-0000-0000-000000000003', 288, 'pages', NULL, NOW() - INTERVAL '20 days'),
  ('d1000000-0000-0000-0000-000000000003', 50, 'finish_bonus', NULL, NOW() - INTERVAL '20 days'),
  ('d1000000-0000-0000-0000-000000000003', 180, 'pages', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000003', 50, 'finish_bonus', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000003', 250, 'pages', NULL, NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000003', 50, 'streak_bonus', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000003', 20, 'review', NULL, NOW() - INTERVAL '9 days'),
  -- Devon: 443+180 + 1 finish + reviews = ~723
  ('d1000000-0000-0000-0000-000000000004', 443, 'pages', NULL, NOW() - INTERVAL '14 days'),
  ('d1000000-0000-0000-0000-000000000004', 50, 'finish_bonus', NULL, NOW() - INTERVAL '14 days'),
  ('d1000000-0000-0000-0000-000000000004', 180, 'pages', NULL, NOW() - INTERVAL '3 days'),
  ('d1000000-0000-0000-0000-000000000004', 20, 'streak_bonus', NULL, NOW() - INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000004', 10, 'review', NULL, NOW() - INTERVAL '13 days'),
  -- Priya: 328+334+288+320 + 3 finish + streaks + reviews = ~1570 (top reader!)
  ('d1000000-0000-0000-0000-000000000005', 328, 'pages', NULL, NOW() - INTERVAL '28 days'),
  ('d1000000-0000-0000-0000-000000000005', 50, 'finish_bonus', NULL, NOW() - INTERVAL '28 days'),
  ('d1000000-0000-0000-0000-000000000005', 334, 'pages', NULL, NOW() - INTERVAL '15 days'),
  ('d1000000-0000-0000-0000-000000000005', 50, 'finish_bonus', NULL, NOW() - INTERVAL '15 days'),
  ('d1000000-0000-0000-0000-000000000005', 288, 'pages', NULL, NOW() - INTERVAL '6 days'),
  ('d1000000-0000-0000-0000-000000000005', 50, 'finish_bonus', NULL, NOW() - INTERVAL '6 days'),
  ('d1000000-0000-0000-0000-000000000005', 320, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000005', 50, 'streak_bonus', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000005', 20, 'streak_bonus', NULL, NOW() - INTERVAL '20 days'),
  ('d1000000-0000-0000-0000-000000000005', 30, 'review', NULL, NOW() - INTERVAL '5 days'),
  -- Tyler: 310+280 + 1 finish = ~690
  ('d1000000-0000-0000-0000-000000000006', 310, 'pages', NULL, NOW() - INTERVAL '12 days'),
  ('d1000000-0000-0000-0000-000000000006', 50, 'finish_bonus', NULL, NOW() - INTERVAL '12 days'),
  ('d1000000-0000-0000-0000-000000000006', 280, 'pages', NULL, NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000006', 10, 'review', NULL, NOW() - INTERVAL '11 days'),
  -- Aisha: 374+378+190 + 2 finish + streaks + reviews = ~1122
  ('d1000000-0000-0000-0000-000000000007', 374, 'pages', NULL, NOW() - INTERVAL '20 days'),
  ('d1000000-0000-0000-0000-000000000007', 50, 'finish_bonus', NULL, NOW() - INTERVAL '20 days'),
  ('d1000000-0000-0000-0000-000000000007', 378, 'pages', NULL, NOW() - INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000007', 50, 'finish_bonus', NULL, NOW() - INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000007', 190, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000007', 50, 'streak_bonus', NULL, NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000007', 20, 'review', NULL, NOW() - INTERVAL '6 days'),
  -- Chris: 320+200 + 1 finish = ~580
  ('d1000000-0000-0000-0000-000000000008', 320, 'pages', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000008', 50, 'finish_bonus', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000008', 200, 'pages', NULL, NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000008', 10, 'review', NULL, NOW() - INTERVAL '9 days'),
  -- Luna: 180+288+220 + 2 finish + streaks + reviews = ~918
  ('d1000000-0000-0000-0000-000000000009', 180, 'pages', NULL, NOW() - INTERVAL '18 days'),
  ('d1000000-0000-0000-0000-000000000009', 50, 'finish_bonus', NULL, NOW() - INTERVAL '18 days'),
  ('d1000000-0000-0000-0000-000000000009', 288, 'pages', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000009', 50, 'finish_bonus', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000009', 220, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000009', 50, 'streak_bonus', NULL, NOW() - INTERVAL '3 days'),
  ('d1000000-0000-0000-0000-000000000009', 20, 'review', NULL, NOW() - INTERVAL '4 days'),
  -- Ethan: 374+688+150 + 2 finish + streaks = ~1362
  ('d1000000-0000-0000-0000-000000000010', 374, 'pages', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000010', 50, 'finish_bonus', NULL, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000010', 688, 'pages', NULL, NOW() - INTERVAL '8 days'),
  ('d1000000-0000-0000-0000-000000000010', 50, 'finish_bonus', NULL, NOW() - INTERVAL '8 days'),
  ('d1000000-0000-0000-0000-000000000010', 150, 'pages', NULL, NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000010', 20, 'streak_bonus', NULL, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000010', 20, 'review', NULL, NOW() - INTERVAL '7 days');

-- Step 7: Create reviews (for finished books)
INSERT INTO reviews (user_id, book_id, rating, review_text, has_spoilers, created_at, updated_at) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 5, 'Fitzgerald at his finest. The prose is intoxicating and the themes are timeless.', false, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 5, 'Incredible memoir. Tara''s resilience is inspiring.', false, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011', 4, 'Beautiful retelling. Miller makes ancient characters feel so real.', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 5, 'The world-building is unmatched. Herbert created something truly special.', false, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 5, 'Andy Weir does it again. Couldn''t put this down.', false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009', 4, 'A thought-provoking concept that really makes you appreciate your life.', false, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 4, 'Classic for a reason. The symbolism is layered and rewarding.', false, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 5, 'Changed how I think about human civilization. A must-read.', false, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 5, 'Terrifyingly relevant. Orwell was a prophet.', false, NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', 4, 'Raw and powerful. Education should never be taken for granted.', false, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000009', 3, 'Good concept but felt a bit repetitive in the middle.', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 5, 'Pure adventure magic. Tolkien is the GOAT.', false, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000006', 4, 'Fast-paced and gripping. Perfect beach read.', false, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000011', 5, 'Absolutely devastating in the best way. Cried for an hour.', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000010', 4, 'Practical and well-structured. Already implementing the habits.', false, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 3, 'Beautifully written but Gatsby is kind of annoying tbh.', false, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 5, 'This book came at the perfect time in my life. Highly recommend.', false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000006', 4, 'Solid YA dystopian. The pacing is relentless.', false, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', 5, 'A masterpiece. The spice must flow.', false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Step 8: Create feed events (recent activity for a lively feed)
INSERT INTO feed_events (user_id, group_id, event_type, metadata, created_at)
SELECT e.user_id, g.id, e.event_type, e.metadata::jsonb, e.created_at
FROM groups g
CROSS JOIN (VALUES
  -- Recent activity (last few days)
  ('d1000000-0000-0000-0000-000000000005'::uuid, 'logged_pages', '{"bookTitle":"Dune","pages":45,"points":45}', NOW() - INTERVAL '2 hours'),
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'logged_pages', '{"bookTitle":"The Midnight Library","pages":30,"points":30}', NOW() - INTERVAL '4 hours'),
  ('d1000000-0000-0000-0000-000000000009'::uuid, 'logged_pages', '{"bookTitle":"Educated","pages":55,"points":55}', NOW() - INTERVAL '6 hours'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'logged_pages', '{"bookTitle":"1984","pages":40,"points":40}', NOW() - INTERVAL '8 hours'),
  ('d1000000-0000-0000-0000-000000000003'::uuid, 'logged_pages', '{"bookTitle":"The Song of Achilles","pages":60,"points":60}', NOW() - INTERVAL '10 hours'),
  ('d1000000-0000-0000-0000-000000000007'::uuid, 'logged_pages', '{"bookTitle":"Project Hail Mary","pages":35,"points":35}', NOW() - INTERVAL '12 hours'),
  ('d1000000-0000-0000-0000-000000000010'::uuid, 'logged_pages', '{"bookTitle":"Gone Girl","pages":50,"points":50}', NOW() - INTERVAL '14 hours'),
  ('d1000000-0000-0000-0000-000000000004'::uuid, 'logged_pages', '{"bookTitle":"Atomic Habits","pages":25,"points":25}', NOW() - INTERVAL '18 hours'),
  -- Yesterday
  ('d1000000-0000-0000-0000-000000000005'::uuid, 'logged_pages', '{"bookTitle":"Dune","pages":65,"points":65}', NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'logged_pages', '{"bookTitle":"The Midnight Library","pages":42,"points":42}', NOW() - INTERVAL '1 day 3 hours'),
  ('d1000000-0000-0000-0000-000000000005'::uuid, 'streak', '{"streakDays":15,"points":50}', NOW() - INTERVAL '1 day'),
  ('d1000000-0000-0000-0000-000000000009'::uuid, 'streak', '{"streakDays":10,"points":50}', NOW() - INTERVAL '1 day 2 hours'),
  -- Book finishes (recent)
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'finished_book', '{"bookTitle":"The Song of Achilles"}', NOW() - INTERVAL '3 days'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'finished_book', '{"bookTitle":"Project Hail Mary"}', NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000005'::uuid, 'finished_book', '{"bookTitle":"The Midnight Library"}', NOW() - INTERVAL '6 days'),
  ('d1000000-0000-0000-0000-000000000007'::uuid, 'finished_book', '{"bookTitle":"The Song of Achilles"}', NOW() - INTERVAL '7 days'),
  -- Reviews
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'reviewed_book', '{"bookTitle":"The Song of Achilles","rating":4,"hasReview":true}', NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'reviewed_book', '{"bookTitle":"Project Hail Mary","rating":5,"hasReview":true}', NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000009'::uuid, 'reviewed_book', '{"bookTitle":"The Midnight Library","rating":5,"hasReview":true}', NOW() - INTERVAL '4 days'),
  -- Started books
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'started_book', '{"bookTitle":"The Midnight Library"}', NOW() - INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'started_book', '{"bookTitle":"1984"}', NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000005'::uuid, 'started_book', '{"bookTitle":"Dune"}', NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000010'::uuid, 'started_book', '{"bookTitle":"Gone Girl"}', NOW() - INTERVAL '5 days')
) AS e(user_id, event_type, metadata, created_at)
WHERE g.invite_code = 'W7Y0CD';

-- Step 9: Award badges to top performers
-- First, check what badges exist
-- We'll award badges based on the seeded badge_definitions
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT u.user_id, bd.id, u.earned_at
FROM badge_definitions bd
CROSS JOIN (VALUES
  -- Priya gets reading badges (3 books finished)
  ('d1000000-0000-0000-0000-000000000005'::uuid, NOW() - INTERVAL '6 days'),
  -- Sophia gets reading badges (3 books finished)
  ('d1000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '3 days')
) AS u(user_id, earned_at)
WHERE bd.category = 'reading' AND bd.threshold <= 3
ON CONFLICT DO NOTHING;

-- Streak badges
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT u.user_id, bd.id, u.earned_at
FROM badge_definitions bd
CROSS JOIN (VALUES
  ('d1000000-0000-0000-0000-000000000005'::uuid, NOW() - INTERVAL '10 days'),
  ('d1000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '8 days'),
  ('d1000000-0000-0000-0000-000000000009'::uuid, NOW() - INTERVAL '5 days')
) AS u(user_id, earned_at)
WHERE bd.category = 'streak' AND bd.threshold <= 7
ON CONFLICT DO NOTHING;

-- Points badges
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT u.user_id, bd.id, u.earned_at
FROM badge_definitions bd
CROSS JOIN (VALUES
  ('d1000000-0000-0000-0000-000000000005'::uuid, NOW() - INTERVAL '8 days'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '4 days'),
  ('d1000000-0000-0000-0000-000000000010'::uuid, NOW() - INTERVAL '3 days')
) AS u(user_id, earned_at)
WHERE bd.category = 'points' AND bd.threshold <= 1000
ON CONFLICT DO NOTHING;

-- Social badges (reviews)
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT u.user_id, bd.id, u.earned_at
FROM badge_definitions bd
CROSS JOIN (VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '14 days'),
  ('d1000000-0000-0000-0000-000000000005'::uuid, NOW() - INTERVAL '5 days'),
  ('d1000000-0000-0000-0000-000000000007'::uuid, NOW() - INTERVAL '6 days')
) AS u(user_id, earned_at)
WHERE bd.category = 'social' AND bd.threshold <= 1
ON CONFLICT DO NOTHING;

-- Done! Summary:
-- 10 demo users created with bios and varied streaks
-- 12 books seeded (well-known titles)
-- 29 user_books (mix of reading/finished)
-- Points distributed to create an interesting leaderboard
-- 19 reviews with realistic text
-- 23 feed events for a lively activity feed
-- Badges awarded to top performers
-- All users added to group W7Y0CD
