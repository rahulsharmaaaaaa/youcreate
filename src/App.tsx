import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Exam, Course, Question } from './types/database';
import { Video, Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import VideoCreationPanel from './components/VideoCreationPanel';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [sampleQuestion, setSampleQuestion] = useState<Question | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('exams').select('*').limit(1);

      if (error) throw error;

      setConnectionStatus('connected');
      loadExams();
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const loadExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('name');

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadCourses = async (examId: number) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_id', examId)
        .order('name');

      if (error) throw error;
      setCourses(data || []);
      setSelectedExam(examId);
      setSelectedCourse(null);
      setSampleQuestion(null);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadQuestionData = async (courseId: number) => {
    try {
      setSelectedCourse(courseId);

      // Get a random question for this course
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('course_id', courseId);

      if (!subjects || subjects.length === 0) {
        setQuestionCount(0);
        setSampleQuestion(null);
        return;
      }

      const subjectIds = subjects.map(s => s.id);

      const { data: units } = await supabase
        .from('units')
        .select('id')
        .in('subject_id', subjectIds);

      if (!units || units.length === 0) {
        setQuestionCount(0);
        setSampleQuestion(null);
        return;
      }

      const unitIds = units.map(u => u.id);

      const { data: chapters } = await supabase
        .from('chapters')
        .select('id')
        .in('unit_id', unitIds);

      if (!chapters || chapters.length === 0) {
        setQuestionCount(0);
        setSampleQuestion(null);
        return;
      }

      const chapterIds = chapters.map(c => c.id);

      const { data: topics } = await supabase
        .from('topics')
        .select('id')
        .in('chapter_id', chapterIds);

      if (!topics || topics.length === 0) {
        setQuestionCount(0);
        setSampleQuestion(null);
        return;
      }

      const topicIds = topics.map(t => t.id);

      const { count } = await supabase
        .from('new_questions')
        .select('*', { count: 'exact', head: true })
        .in('topic_id', topicIds)
        .is('used_in_video', null);

      setQuestionCount(count || 0);

      const { data: question } = await supabase
        .from('new_questions')
        .select('*')
        .in('topic_id', topicIds)
        .is('used_in_video', null)
        .limit(1)
        .maybeSingle();

      setSampleQuestion(question);
    } catch (error) {
      console.error('Error loading question data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Video className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">You Create</h1>
          </div>
          <p className="text-slate-300 text-lg">AI Automatic Video Maker for EdTech</p>
        </div>

        {/* Connection Status */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Supabase Connection</h2>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {connectionStatus === 'checking' && (
              <>
                <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
                <span className="text-slate-300">Checking connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Connected Successfully</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Connection Failed</span>
              </>
            )}
          </div>
        </div>

        {/* Exam Selection */}
        {connectionStatus === 'connected' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Select Exam */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Select Exam</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => loadCourses(exam.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedExam === exam.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-medium">{exam.name}</div>
                    {exam.description && (
                      <div className="text-sm opacity-80 mt-1">{exam.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Course */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Select Course</h3>
              {courses.length === 0 ? (
                <p className="text-slate-400">Select an exam to view courses</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => loadQuestionData(course.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedCourse === course.id
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-medium">{course.name}</div>
                      {course.description && (
                        <div className="text-sm opacity-80 mt-1">{course.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Preview */}
        {selectedCourse && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Available Questions</h3>
              <div className="text-slate-300 mb-4">
                <span className="text-2xl font-bold text-blue-400">{questionCount}</span> questions available for video generation
              </div>

              {sampleQuestion && (
                <div className="bg-slate-700 rounded-lg p-4 mt-4">
                  <h4 className="text-white font-medium mb-2">Sample Question:</h4>
                  <p className="text-slate-300 mb-3">{sampleQuestion.question_statement}</p>
                  {sampleQuestion.options && (
                    <div className="text-sm text-slate-400 mb-2">Options: {sampleQuestion.options}</div>
                  )}
                  <div className="text-sm text-green-400">Answer: {sampleQuestion.answer}</div>
                </div>
              )}
            </div>

            {sampleQuestion && (
              <VideoCreationPanel courseId={selectedCourse} question={sampleQuestion} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
