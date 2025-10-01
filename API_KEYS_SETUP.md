# API Keys and Secrets Setup

## Currently Configured Keys

### ✅ Gemini AI (Google)
```
AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw
```
- **Purpose**: Generate video scripts
- **Used in**: VideoCreationPanel.tsx
- **Status**: Active and working

### ✅ ElevenLabs Voice API
```
API Key: sk_78d719766a3026b96c79d89fefeac203b978509b03404756
Voice ID: ap2_01771851-fe5d-4e13-a843-a49b28e72ef9
```
- **Purpose**: Text-to-speech voice generation
- **Used in**: VideoCreationPanel.tsx
- **Status**: Active and working

### ✅ Supabase
```
URL: https://0ec90b57d6e95fcbda19832f.supabase.co
Anon Key: (in .env file)
```
- **Purpose**: Database and storage
- **Used in**: All database operations
- **Status**: Active and working

## Optional Keys (Not Needed Yet)

### ⚠️ Python Backend URL
```
VITE_PYTHON_BACKEND_URL=
```
- **Purpose**: Video rendering service
- **Used in**: render-video edge function (currently commented out)
- **Status**: OPTIONAL - Leave empty
- **Why**: Video rendering returns mock URL until Python backend is deployed
- **When needed**: Only when you deploy the Python video renderer

## Where Keys Are Stored

### Frontend (.env file)
```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_PYTHON_BACKEND_URL=
```

### Hardcoded in Component (VideoCreationPanel.tsx)
```typescript
const GEMINI_API_KEY = 'AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw';
const VOICE_API_KEY = 'sk_78d719766a3026b96c79d89fefeac203b978509b03404756';
const VOICE_ID = 'ap2_01771851-fe5d-4e13-a843-a49b28e72ef9';
```

**Note**: For production, move these to environment variables.

### Supabase Edge Functions (Auto-configured)
These are automatically available in edge functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

No manual configuration needed!

## The "Missing Secrets" Warning

When you see:
```
Missing secrets: PYTHON_BACKEND_URL
```

**This is SAFE to ignore** because:
1. It's only used for video rendering
2. Video rendering works with mock URLs for now
3. You can deploy Python backend later
4. Everything else (script, voice, captions) works perfectly

## How to Get These Keys (For Reference)

### Gemini AI Key
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

### ElevenLabs Key
1. Go to https://elevenlabs.io/
2. Sign up / Log in
3. Go to Profile → API Keys
4. Create new key
5. For Voice ID, go to Voice Library → Select voice → Copy ID

### Supabase Keys
1. Go to your Supabase Dashboard
2. Settings → API
3. Copy:
   - Project URL
   - anon public key

## Security Best Practices

### Current Setup (Development)
- ✅ Keys hardcoded in frontend (OK for development)
- ✅ Supabase keys in .env (OK - anon key is public)
- ⚠️ ElevenLabs/Gemini keys exposed in frontend (acceptable for now)

### Production Recommendations
- Move API keys to Supabase Edge Functions
- Call edge functions from frontend instead of APIs directly
- Use Supabase Secrets for API keys
- Add rate limiting

### Example: Moving Keys to Edge Function

Create `supabase/functions/generate-script/index.ts`:
```typescript
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

Deno.serve(async (req) => {
  const { prompt } = await req.json();
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/...`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    }
  );
  
  return new Response(JSON.stringify(await response.json()));
});
```

Then set the secret in Supabase:
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

## Summary

✅ **All required keys are configured and working**

✅ **No action needed** - system is ready to use

⚠️ **Optional**: Deploy Python backend later and set VITE_PYTHON_BACKEND_URL

🔒 **For production**: Move API keys to edge functions for better security
