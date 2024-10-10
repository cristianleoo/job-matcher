import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { useUserStore } from '@/lib/userStore';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const jobData = await request.json();
    // console.log('Received job data:', jobData); // Add this line for debugging

    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.location || !jobData.description || !jobData.supabaseUserId) {
      return NextResponse.json({ error: 'Missing required job information' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: jobData.supabaseUserId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        employment_type: jobData.employment_type,
        experience_level: jobData.experience_level,
        remote_type: jobData.remote_type,
        skills: jobData.skills,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        job_url: jobData.job_url,
        description: jobData.description,
        status: jobData.status,
        applied_date: jobData.applied_date,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error adding job:', error);
    return NextResponse.json({ error: 'Failed to add job application' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabaseUserId = searchParams.get('supabaseUserId');

  if (!supabaseUserId) {
    return NextResponse.json({ error: 'Missing supabaseUserId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', supabaseUserId);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch job applications' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId: clerkUserId } = auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  const supabaseUserId = url.searchParams.get('supabaseUserId');

  if (!jobId || !supabaseUserId) {
    return NextResponse.json({ error: 'Job ID and Supabase user ID are required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', jobId)
      .eq('user_id', supabaseUserId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job application' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { jobId, jobStatus, supabaseUserId } = await request.json();

  // Log the incoming request data
  // console.log('Incoming PATCH request data:', { jobId, jobStatus, supabaseUserId });

  // Validate required fields
  if (!jobId || !jobStatus || !supabaseUserId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: String(jobStatus) }) // Ensure this matches the actual column name in your database
      .eq('id', jobId) // Use 'id' here, not 'jobId'
      .eq('user_id', supabaseUserId)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: 'Status updated successfully', data: data[0] });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
  }
}