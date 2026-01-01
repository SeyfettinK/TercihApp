-- Tercih Robotu Supabase Schema
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Profiles tablosu
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  written_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  interview_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  final_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  wants_lottery BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cities tablosu
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true
);

-- Preferences tablosu
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, city_id),
  UNIQUE(user_id, priority)
);

-- Assignments tablosu
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('preference', 'lottery', 'unassigned')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(city_id)
);

-- Settings tablosu
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  preference_period_open BOOLEAN NOT NULL DEFAULT false,
  results_published BOOLEAN NOT NULL DEFAULT false,
  auto_simulation BOOLEAN NOT NULL DEFAULT true
);

-- Varsayılan ayarları ekle
INSERT INTO settings (id, preference_period_open, results_published, auto_simulation) 
VALUES (1, false, false, true)
ON CONFLICT (id) DO UPDATE SET auto_simulation = true;

-- Row Level Security (RLS) Politikaları

-- Profiles için RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes profilleri okuyabilir" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Kullanıcılar sadece kura tercihlerini güncelleyebilir" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (OLD.written_score = NEW.written_score)
    AND (OLD.interview_score = NEW.interview_score)
    AND (OLD.final_score = NEW.final_score)
    AND (OLD.is_admin = NEW.is_admin)
    AND (OLD.email = NEW.email)
    AND (OLD.full_name = NEW.full_name)
  );

CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Adminler tüm profilleri güncelleyebilir" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Cities için RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes şehirleri okuyabilir" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Adminler şehir ekleyebilir" ON cities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Adminler şehir silebilir" ON cities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Preferences için RLS
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes tercihleri okuyabilir" ON preferences
  FOR SELECT USING (true);

CREATE POLICY "Kullanıcılar tercih döneminde tercih ekleyebilir" ON preferences
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM settings WHERE id = 1 AND preference_period_open = true)
  );

CREATE POLICY "Kullanıcılar tercih döneminde tercih silebilir" ON preferences
  FOR DELETE USING (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM settings WHERE id = 1 AND preference_period_open = true)
  );

-- Assignments için RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes atamaları okuyabilir" ON assignments
  FOR SELECT USING (true);

CREATE POLICY "Adminler atama yapabilir" ON assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Adminler atama silebilir" ON assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Settings için RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes ayarları okuyabilir" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Adminler ayarları güncelleyebilir" ON settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- İndeksler
CREATE INDEX idx_profiles_final_score ON profiles(final_score DESC);
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_preferences_priority ON preferences(user_id, priority);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);

-- Örnek Şehirler (27 il)
INSERT INTO cities (name) VALUES
  ('Kırklareli'),
  ('Tekirdağ'),
  ('İstanbul'),
  ('Kocaeli'),
  ('Yalova'),
  ('Bursa'),
  ('Balıkesir'),
  ('Kütahya'),
  ('Bilecik'),
  ('Muğla'),
  ('Bolu'),
  ('Zonguldak'),
  ('Kırşehir'),
  ('Yozgat'),
  ('Samsun'),
  ('Osmaniye'),
  ('Ordu'),
  ('Gaziantep'),
  ('Giresun'),
  ('Trabzon'),
  ('Rize'),
  ('Adıyaman'),
  ('Şanlıurfa'),
  ('Mardin'),
  ('Muş'),
  ('Kars'),
  ('Hakkari')
ON CONFLICT (name) DO NOTHING;

