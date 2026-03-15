export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Book {
  id: string;
  google_books_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  genre: string | null;
  description: string | null;
  rating: number | null;
  ratings_count: number | null;
  created_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: "reading" | "finished";
  current_page: number;
  started_at: string;
  finished_at: string | null;
  book?: Book;
}

export interface ReadingLog {
  id: string;
  user_id: string;
  user_book_id: string;
  pages_read: number;
  logged_at: string;
}

export interface Points {
  id: string;
  user_id: string;
  amount: number;
  reason: "pages" | "finish_book" | "streak_3" | "streak_7" | "review";
  reference_id: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  review_text: string | null;
  has_spoilers: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  book?: Book;
}

export interface FeedEvent {
  id: string;
  user_id: string;
  group_id: string;
  event_type:
    | "started_book"
    | "logged_pages"
    | "finished_book"
    | "streak"
    | "reviewed_book"
    | "earned_badge";
  metadata: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  rank_title?: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "reading" | "streak" | "social" | "points";
  threshold: number | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: BadgeDefinition;
}

export interface RankInfo {
  title: string;
  nextTitle: string | null;
  pointsToNext: number;
  progress: number;
}
