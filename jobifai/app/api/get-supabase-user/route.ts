import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const { clerkUserId } = await request.json();

  console.log('Received request for Clerk User ID:', clerkUserId);

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Clerk user ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch Supabase user' }, { status: 500 });
    }

    if (!data) {
      console.log('No Supabase user found for Clerk ID:', clerkUserId);
      return NextResponse.json({ error: 'Supabase user not found' }, { status: 404 });
    }

    console.log('Found Supabase User ID:', data.id);
    return NextResponse.json({ supabaseUserId: data.id });
  } catch (error) {
    console.error('Error fetching Supabase user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}