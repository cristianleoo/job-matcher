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
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobData, jobUrl, supabaseUserId } = await request.json();

  if (!supabaseUserId) {
    return NextResponse.json({ error: 'Supabase user ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: supabaseUserId,
        status: 'applied',
        applied_date: new Date().toISOString(),
        notes: jobData.description,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        job_url: jobUrl
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding job:', error);
    return NextResponse.json({ error: `Failed to add job ${error}` }, { status: 500 });
  }
}

export const GET = async (request: Request) => {
  const { userId: clerkUserId } = auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First, fetch the Supabase user ID using the Clerk user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching Supabase user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    const supabaseUserId = userData.id;

    console.log('Fetching jobs for Supabase user:', supabaseUserId);
    const { data: jobsData, error: jobsError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', supabaseUserId);

    if (jobsError) {
      throw jobsError;
    }

    return NextResponse.json(jobsData);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
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