import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, resumeTitle } = await req.json();

  if (!userId || !resumeTitle) {
    return NextResponse.json({ error: 'Missing userId or resumeTitle' }, { status: 400 });
  }

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user_resumes')
      .download(resumeTitle);

    if (downloadError) {
      return NextResponse.json({ error: 'Error downloading resume' }, { status: 500 });
    }

    const pdfData = await fileData.arrayBuffer();
    const pdfContent = await pdfParse(Buffer.from(pdfData));

    return NextResponse.json({ text: pdfContent.text });
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json({ error: 'Error processing resume' }, { status: 500 });
  }
}