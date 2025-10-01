import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CaptionRequest {
  video_id: string;
  audio_url: string;
  script: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { video_id, audio_url, script }: CaptionRequest = await req.json();

    // Split script into words for caption timing
    const words = script.split(/\s+/).filter(word => word.length > 0);
    
    // Estimate timing (average speaking rate: 150 words per minute = 2.5 words per second)
    const wordsPerSecond = 2.5;
    const secondsPerWord = 1 / wordsPerSecond;
    
    // Generate caption data with timing
    const captions = [];
    let currentTime = 0;
    let currentPhrase = [];
    let phraseStartTime = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentPhrase.push(word);
      
      // Create caption every 5-7 words or at sentence end
      if (currentPhrase.length >= 5 || 
          word.match(/[.!?]$/) || 
          i === words.length - 1) {
        
        const text = currentPhrase.join(' ');
        const duration = currentPhrase.length * secondsPerWord;
        
        captions.push({
          text: text,
          start: phraseStartTime.toFixed(2),
          end: (phraseStartTime + duration).toFixed(2),
          words: currentPhrase.map((w, idx) => ({
            word: w,
            start: (phraseStartTime + (idx * secondsPerWord)).toFixed(2),
            end: (phraseStartTime + ((idx + 1) * secondsPerWord)).toFixed(2)
          }))
        });
        
        currentTime = phraseStartTime + duration;
        phraseStartTime = currentTime;
        currentPhrase = [];
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        captions: captions,
        total_duration: currentTime.toFixed(2)
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});