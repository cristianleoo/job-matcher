import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { supabaseUserId, jobId, content } = await request.json();

    if (!supabaseUserId || !jobId || !content) {
      return NextResponse.json({ error: 'Missing required information' }, { status: 400 });
    }

    // First, check if a resume already exists for this job application
    const { data: existingResume, error: fetchError } = await supabase
      .from('applications_resumes')
      .select('id, version')
      .eq('user_id', supabaseUserId)
      .eq('job_application_id', jobId)
      .order('version', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error checking existing resume:', fetchError);
      throw fetchError;
    }

    let newVersion = 1;
    let operation;

    if (existingResume && existingResume.length > 0) {
      // If a resume exists, increment the version
      newVersion = existingResume[0].version + 1;
      operation = supabase
        .from('applications_resumes')
        .upsert({
          user_id: supabaseUserId,
          job_application_id: jobId,
          content,
          version: newVersion,
          updated_at: new Date().toISOString(),
        });
    } else {
      // If no resume exists, insert a new one
      operation = supabase
        .from('applications_resumes')
        .insert({
          user_id: supabaseUserId,
          job_application_id: jobId,
          content,
          version: newVersion,
        });
    }

    const { data, error } = await operation.select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}