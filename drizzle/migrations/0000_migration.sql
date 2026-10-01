CREATE TABLE public.questionnaire_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent text,
  answers jsonb NOT NULL,
  answers_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.questionnaire_submissions TO anon, authenticated;
GRANT ALL ON public.questionnaire_submissions TO service_role;
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit" ON public.questionnaire_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);