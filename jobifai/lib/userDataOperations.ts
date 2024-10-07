import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchUserData(userId: string) {
  // Fetch user's job applications
  const { data: jobApplications, error: jobApplicationsError } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId);

  if (jobApplicationsError) throw jobApplicationsError;

  // Fetch user's skills
  const { data: skills, error: skillsError } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId);

  if (skillsError) throw skillsError;

  // Fetch resume
  const { data: resumeData, error: resumeError } = await supabase
    .from('resumes')
    .select('title')
    .eq('user_id', userId)
    .single();

  if (resumeError) throw resumeError;

  return {
    jobApplications,
    skills,
    resumeTitle: resumeData?.title,
  };
}