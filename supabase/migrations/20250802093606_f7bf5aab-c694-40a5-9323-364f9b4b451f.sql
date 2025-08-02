-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  location TEXT,
  skills TEXT[],
  experience TEXT,
  education TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_range TEXT,
  job_type TEXT NOT NULL, -- full-time, part-time, contract, internship
  experience_level TEXT NOT NULL, -- entry, mid, senior
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  application_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected, hired
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create career guidance content table
CREATE TABLE public.career_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  skills_required TEXT[],
  salary_info TEXT,
  growth_prospects TEXT,
  education_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job alerts table
CREATE TABLE public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keywords TEXT[],
  location TEXT,
  job_type TEXT,
  experience_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create policies for jobs (public read, admin write)
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);

-- Create policies for job applications
CREATE POLICY "Users can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own applications" ON public.job_applications FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create policies for saved jobs
CREATE POLICY "Users can view their saved jobs" ON public.saved_jobs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can save jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can remove saved jobs" ON public.saved_jobs FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for career guidance (public read)
CREATE POLICY "Anyone can view career guidance" ON public.career_guidance FOR SELECT USING (true);

-- Create policies for job alerts
CREATE POLICY "Users can view their own alerts" ON public.job_alerts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own alerts" ON public.job_alerts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own alerts" ON public.job_alerts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own alerts" ON public.job_alerts FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes
CREATE POLICY "Users can upload their own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample jobs data
INSERT INTO public.jobs (title, company, location, salary_range, job_type, experience_level, description, requirements, benefits, application_deadline, latitude, longitude) VALUES
('Frontend Developer', 'Tech Solutions Pvt Ltd', 'Bangalore, Karnataka', '4-8 LPA', 'full-time', 'entry', 'We are looking for a passionate Frontend Developer to join our dynamic team.', ARRAY['React', 'JavaScript', 'HTML/CSS', 'Git'], ARRAY['Health Insurance', 'Flexible Working Hours', 'Learning Budget'], '2024-12-31', 12.9716, 77.5946),
('Digital Marketing Intern', 'Growth Marketing Co', 'Mumbai, Maharashtra', '15-25k/month', 'internship', 'entry', 'Great opportunity for students to learn digital marketing.', ARRAY['Social Media', 'Content Creation', 'Basic Analytics'], ARRAY['Certificate', 'Mentorship', 'Flexible Schedule'], '2024-12-15', 19.0760, 72.8777),
('Java Developer', 'Enterprise Systems Ltd', 'Pune, Maharashtra', '6-12 LPA', 'full-time', 'mid', 'Join our backend development team working on enterprise solutions.', ARRAY['Java', 'Spring Boot', 'MySQL', 'REST APIs'], ARRAY['Health Insurance', 'Provident Fund', 'Annual Bonus'], '2024-12-20', 18.5204, 73.8567),
('UI/UX Designer', 'Creative Studio', 'Hyderabad, Telangana', '3-6 LPA', 'full-time', 'entry', 'Design beautiful and intuitive user experiences.', ARRAY['Figma', 'Adobe Creative Suite', 'User Research'], ARRAY['Creative Freedom', 'Latest Tools', 'Team Outings'], '2024-12-25', 17.3850, 78.4867),
('Data Analyst', 'Analytics Plus', 'Chennai, Tamil Nadu', '4-7 LPA', 'full-time', 'entry', 'Analyze data to drive business decisions.', ARRAY['Python', 'SQL', 'Excel', 'Power BI'], ARRAY['Training Programs', 'Health Coverage', 'Work from Home'], '2024-12-30', 13.0827, 80.2707);

-- Insert sample career guidance data
INSERT INTO public.career_guidance (title, category, content, skills_required, salary_info, growth_prospects, education_path) VALUES
('Software Developer', 'Technology', 'Software developers create applications, websites, and systems that power our digital world. This field offers excellent growth opportunities and the chance to work on innovative projects.', ARRAY['Programming Languages', 'Problem Solving', 'Debugging', 'Version Control'], 'Entry: 3-6 LPA, Mid: 8-15 LPA, Senior: 20+ LPA', 'High demand, multiple specializations available, remote work options, entrepreneurship opportunities', 'Computer Science/IT degree, Coding bootcamps, Online certifications, Self-learning'),
('Digital Marketing', 'Marketing', 'Digital marketers help businesses reach customers online through various channels like social media, search engines, and email campaigns.', ARRAY['Content Creation', 'Analytics', 'SEO/SEM', 'Social Media Management'], 'Entry: 2-4 LPA, Mid: 5-10 LPA, Senior: 15+ LPA', 'Growing field with digital transformation, diverse specializations, freelancing opportunities', 'Marketing degree, Digital marketing certifications, Portfolio building'),
('Data Science', 'Analytics', 'Data scientists analyze complex data to help organizations make informed decisions. One of the fastest-growing fields with high demand.', ARRAY['Python/R', 'Statistics', 'Machine Learning', 'Data Visualization'], 'Entry: 4-8 LPA, Mid: 10-20 LPA, Senior: 25+ LPA', 'Extremely high growth potential, applicable across industries, research opportunities', 'Statistics/Math/CS degree, Specialized data science courses, Kaggle competitions'),
('Graphic Design', 'Creative', 'Graphic designers create visual content for brands, websites, and marketing materials. Perfect for creative individuals.', ARRAY['Adobe Creative Suite', 'Typography', 'Color Theory', 'Branding'], 'Entry: 2-4 LPA, Mid: 4-8 LPA, Senior: 10+ LPA', 'Freelancing opportunities, diverse industries, portfolio-based growth', 'Design degree, Portfolio development, Design software certifications');

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();