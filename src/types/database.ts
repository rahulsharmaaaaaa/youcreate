export interface Exam {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Course {
  id: number;
  exam_id: number;
  name: string;
  description?: string;
}

export interface Subject {
  id: number;
  course_id: number;
  name: string;
}

export interface Unit {
  id: number;
  subject_id: number;
  name: string;
}

export interface Chapter {
  id: number;
  unit_id: number;
  name: string;
}

export interface Topic {
  id: number;
  chapter_id: number;
  name: string;
}

export interface Question {
  id: number | string; // Support both serial and UUID
  topic_id: number;
  question_statement: string;
  question_type: string;
  options?: string;
  answer: string;
  solution?: string;
  used_in_video?: string | null;
}

export interface Video {
  id?: string; // UUID
  course_id?: number;
  question_id?: number | string; // Support both serial and UUID
  script?: string;
  audio_url?: string;
  captions_data?: any;
  video_url?: string;
  template_id?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
