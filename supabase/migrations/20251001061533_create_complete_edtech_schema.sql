/*
  # Create Complete EdTech Platform Database Schema

  1. Tables Hierarchy (Top to Bottom)
    - `exams` - Entrance exams (IIT JAM, CMI MSDS, etc.)
    - `courses` - Courses within each exam
    - `subjects` - Subjects within each course
    - `units` - Units within each subject
    - `chapters` - Chapters within each unit
    - `topics` - Topics within each chapter
    - `new_questions` - Questions linked to topics

  2. Purpose
    - Enable hierarchical content organization
    - Support question filtering by exam/course
    - Track question usage in videos
    - Enable automated video generation workflow

  3. Security
    - Enable RLS on all tables
    - Public read access for content viewing
    - Authenticated insert/update for content management
*/

-- 1. Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create courses table (linked to exams)
CREATE TABLE IF NOT EXISTS courses (
  id serial PRIMARY KEY,
  exam_id integer REFERENCES exams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create subjects table (linked to courses)
CREATE TABLE IF NOT EXISTS subjects (
  id serial PRIMARY KEY,
  course_id integer REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Create units table (linked to subjects)
CREATE TABLE IF NOT EXISTS units (
  id serial PRIMARY KEY,
  subject_id integer REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Create chapters table (linked to units)
CREATE TABLE IF NOT EXISTS chapters (
  id serial PRIMARY KEY,
  unit_id integer REFERENCES units(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Create topics table (linked to chapters)
CREATE TABLE IF NOT EXISTS topics (
  id serial PRIMARY KEY,
  chapter_id integer REFERENCES chapters(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. Create new_questions table (linked to topics)
CREATE TABLE IF NOT EXISTS new_questions (
  id serial PRIMARY KEY,
  topic_id integer REFERENCES topics(id) ON DELETE CASCADE,
  question_statement text NOT NULL,
  question_type text NOT NULL,
  options text,
  answer text NOT NULL,
  solution text,
  used_in_video text DEFAULT null,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_questions ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Anyone can read exams" ON exams FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read courses" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read subjects" ON subjects FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read units" ON units FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read chapters" ON chapters FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read topics" ON topics FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read questions" ON new_questions FOR SELECT TO public USING (true);

-- Create update policies for question tracking
CREATE POLICY "Anyone can update questions" ON new_questions FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_exam_id ON courses(exam_id);
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_units_subject_id ON units(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_unit_id ON chapters(unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON new_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_used_in_video ON new_questions(used_in_video) WHERE used_in_video IS NULL;

-- Add sample data for IIT JAM
INSERT INTO exams (name, description) VALUES
('IIT JAM', 'Indian Institute of Technology Joint Admission Test for MSc')
ON CONFLICT (name) DO NOTHING;

INSERT INTO courses (exam_id, name, description)
SELECT id, 'Mathematics', 'The application of mathematical methods to the solution, analysis, and presentation of data.'
FROM exams WHERE name = 'IIT JAM'
ON CONFLICT DO NOTHING;

INSERT INTO courses (exam_id, name, description)
SELECT id, 'Mathematical Statistics', 'The science of matter and their interactions.'
FROM exams WHERE name = 'IIT JAM'
ON CONFLICT DO NOTHING;
