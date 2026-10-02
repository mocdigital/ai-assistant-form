# Deploying to Vercel

Voice transcription needs a key that only exists on Lovable hosting, so the Vercel copy sends recordings to the **published Lovable app** for transcription.

1. **Publish the app on Lovable first** (Publish button). Note its URL, e.g. `https://your-app.lovable.app`. Keep it published.
2. Push this project to GitHub and import it in Vercel. Framework preset: **Other**. Build command: `bun run build` (or `npm run build`). Leave output directory empty.
3. Add these Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (from `.env`)
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (same values as the VITE_ ones)
   - `VITE_TRANSCRIBE_API_URL` = your published Lovable URL from step 1 (no trailing slash)
4. Redeploy (VITE_ variables are baked in at build time).

## Allowed origins
The Lovable transcription endpoint (`/api/public/transcribe`) accepts browser requests from any `*.vercel.app` and `*.lovable.app` address. If you use a custom domain on Vercel, add it as a Lovable Cloud secret named `ALLOWED_ORIGINS` (comma-separated, e.g. `https://forms.example.com`) and republish.

Submissions are stored in the `questionnaire_submissions` table and can be exported as CSV from Lovable Cloud.
