# Deploying to Vercel

1. Push this project to GitHub (Lovable: GitHub > Connect) and import it in Vercel.
2. Framework preset: **Other**. Build command: `bun run build` (or `npm run build`). Leave output directory empty — the build writes `.vercel/output` automatically when running on Vercel.
3. Add these Environment Variables in Vercel (copy values from the project's `.env` and the Lovable Cloud secrets):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (same values as the VITE_ ones)
   - `LOVABLE_API_KEY` (used for voice transcription)
4. Deploy.

Submissions are stored in the `questionnaire_submissions` table and can be exported as CSV from Lovable Cloud.
