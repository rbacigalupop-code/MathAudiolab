-- SCHEMA para MathAudio Lab v2.0
-- Ejecutar en Supabase SQL Editor

-- Tabla 1: user_progress (existente, sin cambios)
-- CREATE TABLE user_progress (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id VARCHAR(255) UNIQUE NOT NULL,
--   nivel INTEGER DEFAULT 1,
--   mejor_racha INTEGER DEFAULT 0,
--   racha_global INTEGER DEFAULT 0,
--   weak_points JSONB DEFAULT '{}'::jsonb,
--   unlocked_effects TEXT[] DEFAULT '{}'::text[],
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- Tabla 2: user_profiles (NUEVA - Múltiples alumnos por usuario)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  edad INTEGER CHECK (edad >= 8 AND edad <= 18),
  stats JSONB DEFAULT '{
    "nivel": 1,
    "rachaGlobal": 0,
    "mejorRacha": 0,
    "weak_points": {},
    "unlocked_effects": [],
    "sesiones": []
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_profile_per_user UNIQUE(user_id, nombre)
);

-- Tabla 3: error_history (para analytics - NUEVA)
CREATE TABLE IF NOT EXISTS error_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  mode VARCHAR(50) NOT NULL,
  operand1 INTEGER,
  operand2 INTEGER,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_error_history_user_id ON error_history(user_id);
CREATE INDEX IF NOT EXISTS idx_error_history_profile_id ON error_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_error_history_created_at ON error_history(created_at);

-- RLS Policies (Row Level Security)
-- Permitir que usuarios solo vean sus propios perfiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profiles" ON user_profiles;
CREATE POLICY "Users can view their own profiles" ON user_profiles
  FOR SELECT USING (user_id = current_user_id());

DROP POLICY IF EXISTS "Users can insert their own profiles" ON user_profiles;
CREATE POLICY "Users can insert their own profiles" ON user_profiles
  FOR INSERT WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
CREATE POLICY "Users can update their own profiles" ON user_profiles
  FOR UPDATE USING (user_id = current_user_id());

DROP POLICY IF EXISTS "Users can delete their own profiles" ON user_profiles;
CREATE POLICY "Users can delete their own profiles" ON user_profiles
  FOR DELETE USING (user_id = current_user_id());
