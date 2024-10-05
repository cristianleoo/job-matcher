import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

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

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const supabaseUserId = searchParams.get('supabaseUserId');

  if (!supabaseUserId) {
    return NextResponse.json({ error: 'Supabase user ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', supabaseUserId);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}