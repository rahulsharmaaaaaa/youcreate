import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Question } from '../types/database';
import { FileText, Mic, Captions, Video, CheckCircle, Loader, AlertCircle } from 'lucide-react';

interface VideoCreationPanelProps {
  courseId: number;
  question: Question;
}

interface VideoRecord {
  id: string;
  script?: string;
  audio_url?: string;
  captions_data?: any;
  video_url?: string;
  status: string;
  template_id: number;
}

interface GeneratedScript {
  text: string;
  examName: string;
}

export default function VideoCreationPanel({ courseId, question }: VideoCreationPanelProps) {
  const [videoRecord, setVideoRecord] = useState<VideoRecord | null>(null);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const GEMINI_API_KEY = 'AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw';
  const VOICE_API_KEY = 'sk_78d719766a3026b96c79d89fefeac203b978509b03404756';
  const VOICE_ID = 'ap2_01771851-fe5d-4e13-a843-a49b28e72ef9';

  const generateScript = async () => {
    setLoading('script');
    setError(null);

    try {
      // First, get the exam name
      const { data: courseData } = await supabase
        .from('courses')
        .select('exam_id')
        .eq('id', courseId)
        .maybeSingle();

      let examName = 'this exam';
      if (courseData?.exam_id) {
        const { data: examData } = await supabase
          .from('exams')
          .select('name')
          .eq('id', courseData.exam_id)
          .maybeSingle();
        if (examData) examName = examData.name;
      }

      const prompt = `Create an engaging educational video script for this question. Follow this exact structure:

1. Start with: "Hello everyone, today we are going to solve a question for ${examName} entrance exam."
2. Say: "So the question says:" then read the question statement word by word
3. For MCQ/MSQ questions, read each option clearly: "Option A: [text], Option B: [text]" etc.
4. After reading the question and options, say: "Try solving this question on your own. I'll give you 5 seconds." [PAUSE 5 SECONDS - indicate with [COUNTDOWN: 5...4...3...2...1]]
5. Then reveal: "The answer is: ${question.answer}"
6. Finally explain the solution: ${question.solution || 'Provide a clear explanation'}
7. End with: "If you are looking for a complete guide for ${examName} or more practice questions and guidance, follow and comment ${examName} and it will be in your DMs."

Question: ${question.question_statement}
${question.options ? `Options: ${question.options}` : ''}
Answer: ${question.answer}
${question.solution ? `Solution: ${question.solution}` : ''}

Make the script conversational, engaging, and suitable for voice-over. Use simple language that sounds natural when spoken. The script should be read exactly as written by our text-to-speech system.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate script');

      const data = await response.json();
      const script = data.candidates[0]?.content?.parts[0]?.text;

      if (!script) throw new Error('No script generated');

      setGeneratedScript({ text: script, examName });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const saveScriptToDatabase = async () => {
    if (!generatedScript) return;

    setLoading('saving');
    setError(null);

    try {
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert({
          course_id: courseId,
          question_id: question.id,
          script: generatedScript.text,
          status: 'script_generated',
          template_id: Math.floor(Math.random() * 5) + 1
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await supabase
        .from('new_questions')
        .update({ used_in_video: 'yes' })
        .eq('id', question.id);

      setVideoRecord(video);
      setGeneratedScript(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const generateVoiceOver = async () => {
    if (!videoRecord?.script) return;

    setLoading('audio');
    setError(null);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': VOICE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: videoRecord.script,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate voice-over');

      const audioBlob = await response.blob();
      const audioFileName = `audio_${videoRecord.id}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(audioFileName, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(audioFileName);

      const { data: updated, error: updateError } = await supabase
        .from('videos')
        .update({
          audio_url: publicUrl,
          status: 'audio_generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setVideoRecord(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const generateCaptions = async () => {
    if (!videoRecord?.audio_url) return;

    setLoading('captions');
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          video_id: videoRecord.id,
          audio_url: videoRecord.audio_url,
          script: videoRecord.script
        })
      });

      if (!response.ok) throw new Error('Failed to generate captions');

      const { captions } = await response.json();

      const { data: updated, error: updateError } = await supabase
        .from('videos')
        .update({
          captions_data: captions,
          status: 'captions_generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setVideoRecord(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const generateVideo = async () => {
    if (!videoRecord?.captions_data) return;

    setLoading('video');
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/render-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          video_id: videoRecord.id,
          template_id: videoRecord.template_id
        })
      });

      if (!response.ok) throw new Error('Failed to render video');

      const { video_url } = await response.json();

      const { data: updated, error: updateError } = await supabase
        .from('videos')
        .update({
          video_url: video_url,
          status: 'video_rendered',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setVideoRecord(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getStepStatus = (step: string) => {
    if (!videoRecord) return 'pending';

    const statusMap: Record<string, string[]> = {
      script: ['script_generated', 'audio_generated', 'captions_generated', 'video_rendered'],
      audio: ['audio_generated', 'captions_generated', 'video_rendered'],
      captions: ['captions_generated', 'video_rendered'],
      video: ['video_rendered']
    };

    return statusMap[step]?.includes(videoRecord.status) ? 'completed' : 'pending';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-6">Video Creation Pipeline</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Step 1: Generate Script */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <button
              onClick={generateScript}
              disabled={loading !== null || videoRecord !== null}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                getStepStatus('script') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">1. Generate Script</div>
                  <div className="text-sm opacity-80">Using Gemini AI</div>
                </div>
              </div>
              {loading === 'script' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : getStepStatus('script') === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : null}
            </button>
          </div>
        </div>

        {/* Script Preview */}
        {generatedScript && !videoRecord && (
          <div className="ml-8 space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg max-h-96 overflow-y-auto">
              <h4 className="text-white font-medium mb-2">Generated Script Preview:</h4>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{generatedScript.text}</p>
            </div>
            <button
              onClick={saveScriptToDatabase}
              disabled={loading !== null}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'saving' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Save to Database
                </>
              )}
            </button>
          </div>
        )}

        {videoRecord?.script && (
          <div className="ml-8 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Script saved to database
            </h4>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{videoRecord.script.substring(0, 200)}...</p>
          </div>
        )}

        {/* Step 2: Generate Voice Over */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <button
              onClick={generateVoiceOver}
              disabled={!videoRecord?.script || loading !== null}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                getStepStatus('audio') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">2. Generate Voice Over</div>
                  <div className="text-sm opacity-80">TTS Audio Generation</div>
                </div>
              </div>
              {loading === 'audio' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : getStepStatus('audio') === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : null}
            </button>
          </div>
        </div>

        {/* Step 3: Generate Captions */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <button
              onClick={generateCaptions}
              disabled={!videoRecord?.audio_url || loading !== null}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                getStepStatus('captions') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <Captions className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">3. Generate Captions</div>
                  <div className="text-sm opacity-80">Timing & Highlighting</div>
                </div>
              </div>
              {loading === 'captions' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : getStepStatus('captions') === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : null}
            </button>
          </div>
        </div>

        {/* Step 4: Render Video */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <button
              onClick={generateVideo}
              disabled={!videoRecord?.captions_data || loading !== null}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                getStepStatus('video') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">4. Render Final Video</div>
                  <div className="text-sm opacity-80">Template {videoRecord?.template_id || 1}</div>
                </div>
              </div>
              {loading === 'video' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : getStepStatus('video') === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : null}
            </button>
          </div>
        </div>

        {videoRecord?.video_url && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-400 font-medium mb-2">Video Ready!</p>
            <a
              href={videoRecord.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              {videoRecord.video_url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
