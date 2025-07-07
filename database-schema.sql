-- FOMO App Database Schema

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  attendees INTEGER DEFAULT 0,
  hosts TEXT[], -- Array of host names
  status TEXT DEFAULT 'draft' CHECK (status IN ('live', 'upcoming', 'completed', 'draft', 'cancelled')),
  location_tags JSONB, -- Array of location tags
  user_tags JSONB, -- Array of user tags
  invites JSONB, -- Array of invite objects
  co_hosts JSONB, -- Array of co-host objects
  require_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by TEXT
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_username TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT,
  media TEXT, -- URL to media file
  gif_url TEXT, -- URL to GIF
  tags TEXT[], -- Array of tags
  poll JSONB, -- Poll object
  location TEXT,
  reactions JSONB DEFAULT '[]', -- Array of reaction objects
  comments JSONB DEFAULT '[]', -- Array of comment objects
  reposts INTEGER DEFAULT 0,
  user_reposted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);
CREATE INDEX IF NOT EXISTS idx_parties_created_at ON parties(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_party_id ON posts(party_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to parties" ON parties
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to posts" ON posts
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to insert parties" ON parties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update parties" ON parties
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete parties" ON parties
  FOR DELETE USING (true);

CREATE POLICY "Allow authenticated users to insert posts" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update posts" ON posts
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete posts" ON posts
  FOR DELETE USING (true); 