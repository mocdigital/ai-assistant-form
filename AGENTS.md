<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Voice answers are recorded in-browser and transcribed server-side via /api/transcribe (Lovable AI Gateway) — keeps the API key off the client.
- Questionnaire submissions are insert-only for the public (no reads via the API) — respondents need no login; admins export from the backend.
- vite.config.ts switches the nitro preset to "vercel" when the VERCEL env var is present — allows deploying to Vercel without affecting Lovable hosting.
