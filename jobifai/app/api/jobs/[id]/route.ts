import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json({ error: 'Failed to fetch job application' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const updates = await request.json();

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json({ error: 'Failed to update job application' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json({ error: 'Failed to delete job application' }, { status: 500 });
  }
}