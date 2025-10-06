-- Create job_analyses table for storing analyzed job postings
CREATE TABLE IF NOT EXISTS public.job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  position_title TEXT,
  job_description TEXT,
  job_url TEXT,
  classification TEXT NOT NULL CHECK (classification IN ('legitimate', 'fake', 'suspicious')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  detected_keywords TEXT[],
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.job_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_analyses
CREATE POLICY "Users can view their own job analyses"
  ON public.job_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job analyses"
  ON public.job_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job analyses"
  ON public.job_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job analyses"
  ON public.job_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_job_analyses_user_id ON public.job_analyses(user_id);
CREATE INDEX idx_job_analyses_created_at ON public.job_analyses(created_at DESC);

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_job_analyses_updated_at
  BEFORE UPDATE ON public.job_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();