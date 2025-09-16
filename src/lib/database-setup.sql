-- Surf Coach & Safety Assistant - Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Users app table (extends auth.users)
CREATE TABLE IF NOT EXISTS users_app (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surfer profiles
CREATE TABLE IF NOT EXISTS surfer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  years_surfing INTEGER NOT NULL,
  can_duck_dive BOOLEAN DEFAULT FALSE,
  comfortable_wave_size TEXT NOT NULL,
  experience_types TEXT[] DEFAULT '{}',
  paddle_fitness TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  risk_tolerance TEXT NOT NULL,
  home_radius INTEGER NOT NULL,
  favorite_spots TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  injuries TEXT[] DEFAULT '{}',
  profile_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surf spots
CREATE TABLE IF NOT EXISTS spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  coordinates DECIMAL[] NOT NULL,
  orientation INTEGER NOT NULL,
  break_type TEXT NOT NULL,
  bottom TEXT NOT NULL,
  hazards TEXT[] DEFAULT '{}',
  ideal_swell_dirs INTEGER[] DEFAULT '{}',
  ideal_wind_dirs INTEGER[] DEFAULT '{}',
  ideal_tide TEXT NOT NULL,
  paddle_distance INTEGER NOT NULL,
  entry_exit_notes TEXT NOT NULL,
  seasonality TEXT NOT NULL,
  lifeguarded BOOLEAN DEFAULT FALSE,
  easy_entry BOOLEAN DEFAULT FALSE,
  short_paddle BOOLEAN DEFAULT FALSE,
  crowd_factor INTEGER NOT NULL CHECK (crowd_factor >= 1 AND crowd_factor <= 10),
  skill_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecast snapshots
CREATE TABLE IF NOT EXISTS forecast_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID REFERENCES spots(id) NOT NULL,
  provider TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  swell_height DECIMAL NOT NULL,
  swell_period DECIMAL NOT NULL,
  swell_direction INTEGER NOT NULL,
  wind_speed DECIMAL NOT NULL,
  wind_direction INTEGER NOT NULL,
  tide_level DECIMAL NOT NULL,
  provider_confidence DECIMAL NOT NULL CHECK (provider_confidence >= 0 AND provider_confidence <= 1),
  raw_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scoring weights
CREATE TABLE IF NOT EXISTS scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  wave_size DECIMAL NOT NULL,
  wind DECIMAL NOT NULL,
  tide DECIMAL NOT NULL,
  hazards DECIMAL NOT NULL,
  experience DECIMAL NOT NULL,
  confidence DECIMAL NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session logs
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  spot_id UUID REFERENCES spots(id) NOT NULL,
  date DATE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  conditions_json JSONB,
  photo_urls TEXT[] DEFAULT '{}',
  gps_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wavepools
CREATE TABLE IF NOT EXISTS wavepools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates DECIMAL[] NOT NULL,
  schedule_json JSONB NOT NULL,
  session_types TEXT[] DEFAULT '{}',
  skill_levels TEXT[] DEFAULT '{}',
  pricing_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON surfer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON surfer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON session_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON session_logs
  FOR ALL USING (auth.uid() = user_id);

-- Spots and forecasts are public read
CREATE POLICY "Anyone can view spots" ON spots FOR SELECT USING (true);
CREATE POLICY "Anyone can view forecasts" ON forecast_snapshots FOR SELECT USING (true);
CREATE POLICY "Anyone can view wavepools" ON wavepools FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins manage all" ON spots FOR ALL USING (
  EXISTS (SELECT 1 FROM users_app WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins manage weights" ON scoring_weights FOR ALL USING (
  EXISTS (SELECT 1 FROM users_app WHERE id = auth.uid() AND is_admin = true)
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE forecast_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE session_logs;

-- Seed data
INSERT INTO spots (name, region, coordinates, orientation, break_type, bottom, hazards, ideal_swell_dirs, ideal_wind_dirs, ideal_tide, paddle_distance, entry_exit_notes, seasonality, lifeguarded, easy_entry, short_paddle, crowd_factor, skill_level) VALUES 
('Bells Beach', 'Surf Coast VIC', ARRAY[-38.3739, 144.2834], 210, 'point', 'Rock/Sand', ARRAY['Rocks', 'Strong currents', 'Crowds', 'Sweep'], ARRAY[180, 210, 240], ARRAY[0, 30, 60, 330], 'mid', 200, 'Rocky entry, watch for sweep on big days. Long paddle to lineup.', 'Best in autumn/winter with SW swells', false, false, false, 8, 'advanced'),
('Jan Juc', 'Surf Coast VIC', ARRAY[-38.3489, 144.3021], 200, 'beach', 'Sand', ARRAY['Rips', 'Crowds on weekends'], ARRAY[180, 210, 240, 270], ARRAY[30, 60, 90, 270], 'any', 100, 'Sandy beach entry. Multiple peaks along the beach.', 'Year-round, best with SW-W swells', true, true, true, 7, 'intermediate'),
('13th Beach', 'Surf Coast VIC', ARRAY[-38.2567, 144.6234], 180, 'beach', 'Sand', ARRAY['Rips', 'Sharks (rare)', 'Remote location'], ARRAY[180, 210, 240], ARRAY[270, 300, 330, 0], 'mid', 80, 'Multiple peaks, more tolerant of onshore winds. Long beach walk.', 'Good for onshore days elsewhere', false, true, true, 3, 'beginner');

-- Default scoring weights
INSERT INTO scoring_weights (name, wave_size, wind, tide, hazards, experience, confidence, is_default) VALUES 
('Default Weights', 0.35, 0.25, 0.15, 0.10, 0.10, 0.05, true);

-- Create storage bucket for session photos
INSERT INTO storage.buckets (id, name, public) VALUES ('session-photos', 'session-photos', true);

-- Storage policies
CREATE POLICY "Users can upload session photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view session photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-photos');