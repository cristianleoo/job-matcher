import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const resume = formData.get('resume') as File | null;

    // Update user profile in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        // ... other fields ...
      })
      .eq('clerk_id', userId);

    if (error) throw error;

    // Handle resume upload if a file was provided
    if (resume) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${userId}/resume.pdf`, resume);

      if (uploadError) throw uploadError;
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}