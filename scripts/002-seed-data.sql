-- Seed data for testing
-- Run this after 001-create-tables.sql

-- Insert sample badges
INSERT INTO badges (id, name, icon, rarity) VALUES
  ('badge-1', 'Early Adopter', '🌟', 'rare'),
  ('badge-2', 'Top Contributor', '🏆', 'epic'),
  ('badge-3', 'Verified Creator', '✓', 'legendary'),
  ('badge-4', 'Helpful Member', '🤝', 'common'),
  ('badge-5', 'Bug Hunter', '🐛', 'rare');

-- Insert sample achievements
INSERT INTO achievements (id, name, description, icon, rarity) VALUES
  ('achieve-1', 'First Post', 'Created your first post', '📝', 'common'),
  ('achieve-2', 'Popular Post', 'Got 100 likes on a single post', '🔥', 'rare'),
  ('achieve-3', 'Community Leader', 'Reached 1000 followers', '👑', 'epic'),
  ('achieve-4', 'Viral Content', 'Post reached 10000 views', '🚀', 'legendary'),
  ('achieve-5', 'Conversation Starter', 'Received 50 comments on a post', '💬', 'rare');

-- Insert sample trending topics
INSERT INTO trending_topics (id, name, hashtag, posts, trend, category, color) VALUES
  ('trend-1', 'AI Development', '#AIdev', 1234, '+23%', 'technology', 'bg-blue-500'),
  ('trend-2', 'Web3 Updates', '#Web3', 987, '+15%', 'technology', 'bg-purple-500'),
  ('trend-3', 'Design Systems', '#DesignSystems', 756, '+8%', 'design', 'bg-pink-500'),
  ('trend-4', 'TypeScript Tips', '#TypeScript', 654, '+12%', 'programming', 'bg-blue-600'),
  ('trend-5', 'React 19', '#React19', 543, '+45%', 'programming', 'bg-cyan-500');
