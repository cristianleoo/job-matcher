import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jobPostingId, resumeId, coverLetterId } = await req.json();

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: userId,
        job_posting_id: jobPostingId,
        resume_id: resumeId,
        cover_letter_id: coverLetterId,
        status: 'applied',
        applied_date: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ message: 'Application submitted successfully', data });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}