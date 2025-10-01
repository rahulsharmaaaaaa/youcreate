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
  id: number;
  topic_id: number;
  question_statement: string;
  question_type: string;
  options?: string;
  answer: string;
  solution?: string;
  used_in_video?: string | null;
}

export interface Video {
  id?: number;
  course_id?: number;
  question_id?: number;
  script?: string;
  video_url?: string;
  status?: string;
  created_at?: string;
}
