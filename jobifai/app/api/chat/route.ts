import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  
    // Use userId from Clerk directly for Supabase operations
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId);  // Assuming you have a column to store Clerk user IDs

  try {
    const { message, chatHistory, jobPostingId } = await req.json();

    // Fetch job posting details if jobPostingId is provided
    let jobDetails = null;
    if (jobPostingId) {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobPostingId)
        .single();

      if (error) throw error;
      jobDetails = data;
    }

    // Prepare the chat history and context for Gemini
    const chatContext = `You are an AI assistant for JobifAI, a job search platform. ${
      jobDetails ? `The user is currently looking at a job posting for ${jobDetails.title} at ${jobDetails.company}.` : ''
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: [
        { role: "system", parts: chatContext },
        ...chatHistory.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          parts: msg.content,
        })),
      ],
    });

    // Generate a response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Save the chat history to Supabase
    const { data, error } = await supabase
      .from('chat_histories')
      .insert({
        user_id: userId,
        message: message,
        response: aiResponse,
        timestamp: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}