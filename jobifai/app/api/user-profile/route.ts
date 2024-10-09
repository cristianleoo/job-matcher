import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabaseUserId = searchParams.get('supabaseUserId');

  if (!supabaseUserId) {
    return NextResponse.json({ error: 'Missing supabaseUserId' }, { status: 400 });
  }

  console.log('Fetching user profile for:', supabaseUserId);

  try {
    // Fetch user profile data from Supabase
    let experience, education, skills, projects;

    try {
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', supabaseUserId);
      if (error) throw error;
      experience = data;
    } catch (error) {
      console.error('Error fetching work experience:', error);
    }

    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', supabaseUserId);
      if (error) throw error;
      education = data;
    } catch (error) {
      console.error('Error fetching education:', error);
    }

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('skills:skill_id(name)')
        .eq('user_id', supabaseUserId);
      if (error) throw error;
      skills = data?.flatMap(skill => skill.skills?.map((s: any) => s.name) || []) || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', supabaseUserId);
      if (error) throw error;
      projects = data;
    } catch (error) {
      console.error('Error fetching projects:', error);
    }

    const userProfile = {
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      projects: projects || [],
    };

    console.log('User profile fetched successfully:', userProfile);

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}