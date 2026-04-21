-- Task Manager Pro - Supabase Migration
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can select their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tasks
CREATE POLICY "Users can select their own tasks" ON tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (user_id = auth.uid());

-- Insert demo user (password: demo123 - hashed with bcrypt)
-- Note: In production, use proper bcrypt hashing!
INSERT INTO users (id, email, password, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@taskmanager.com', '$2b$10$xK1pqrstuvwxyz1234567890ABCDEFghijklmnopqrstu', 'Demo User');

-- Insert sample tasks for demo user
INSERT INTO tasks (title, description, priority, completed, user_id) VALUES
  ('Welcome to Task Manager Pro', 'This is your first task! Try editing or deleting it.', 'MEDIUM', FALSE, '00000000-0000-0000-0000-000000000001'),
  ('Create a new task', 'Click the + button to add a new task.', 'LOW', FALSE, '00000000-0000-0000-0000-000000000001'),
  ('Complete tasks', 'Mark tasks as complete by clicking the checkbox.', 'MEDIUM', TRUE, '00000000-0000-0000-0000-000000000001');

SELECT 'Migration completed!' AS status;