import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const location = searchParams.get('location');

  try {
    let jobQuery = supabase.from('job_postings').select('*');

    if (query) {
      jobQuery = jobQuery.ilike('title', `%${query}%`);
    }

    if (location) {
      jobQuery = jobQuery.ilike('location', `%${location}%`);
    }

    const { data, error } = await jobQuery;

    if (error) throw error;

    return NextResponse.json({ jobs: data });
  } catch (error) {
    console.error('Error in job search:', error);
    return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
  }
}