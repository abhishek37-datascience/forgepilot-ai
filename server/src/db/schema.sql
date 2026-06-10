-- Database Schema Definition for ForgePilot AI 🚀

-- 1. Users table (credentials)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles table (linked with users)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  branch VARCHAR(150) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  languages VARCHAR(50)[] NOT NULL,
  skill_level VARCHAR(50) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  github VARCHAR(255) DEFAULT 'https://github.com/abhishek37-datascience',
  linkedin VARCHAR(255) DEFAULT 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1',
  primary_email VARCHAR(255) DEFAULT 'kavalaabhishek37@gmail.com',
  secondary_email VARCHAR(255) DEFAULT 'kavalasivaramasaiabhishek37@gmail.com',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github VARCHAR(255) DEFAULT 'https://github.com/abhishek37-datascience';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) DEFAULT 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_email VARCHAR(255) DEFAULT 'kavalaabhishek37@gmail.com';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255) DEFAULT 'kavalasivaramasaiabhishek37@gmail.com';

-- 3. Projects Catalog table (seeding cache)
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  problem_statement TEXT NOT NULL,
  objective TEXT NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL,
  branch VARCHAR(150) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  languages VARCHAR(50)[] NOT NULL,
  software VARCHAR(100)[] NOT NULL,
  hardware VARCHAR(100)[] NOT NULL,
  applications TEXT[] NOT NULL,
  cost_estimation INTEGER NOT NULL,
  estimated_completion_time VARCHAR(50) NOT NULL
);

-- 4. Saved Projects
CREATE TABLE IF NOT EXISTS saved_projects (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- 5. Favorite Projects
CREATE TABLE IF NOT EXISTS favorite_projects (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- 6. Completed Projects
CREATE TABLE IF NOT EXISTS completed_projects (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- 7. Search History log
CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Viewed Projects logs
CREATE TABLE IF NOT EXISTS viewed_projects (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(50) NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- 9. Progress Tracking
CREATE TABLE IF NOT EXISTS project_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(50) NOT NULL,
  percent INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, project_id)
);

-- 10. Feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  feedback_type VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Seed default demo user
INSERT INTO users (id, name, email, password_hash)
VALUES ('00000000-0000-0000-0000-000000000001', 'Abhishek Kavala', 'kavalaabhishek37@gmail.com', '$2a$10$Hz9JsxJWPFGuXBLsShd8KupnDTMzx4Dvii2fMOWKO3G.rQDtS6cfG')
ON CONFLICT (email) DO NOTHING;

-- 12. Seed default profile for demo user
INSERT INTO profiles (user_id, branch, specialization, languages, skill_level, academic_year, github, linkedin, primary_email, secondary_email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Computer Science Engineering (CSE)', 'Artificial Intelligence', ARRAY['Python', 'JavaScript', 'TypeScript'], 'Intermediate', '3rd Year', 'https://github.com/abhishek37-datascience', 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1', 'kavalaabhishek37@gmail.com', 'kavalasivaramasaiabhishek37@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
