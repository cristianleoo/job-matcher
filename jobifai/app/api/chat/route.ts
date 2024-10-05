import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, supabaseUserId } = await req.json();

    if (!supabaseUserId) {
        console.log("Supabase user ID not found in request");
        return NextResponse.json({ error: 'Supabase user ID not found in request' }, { status: 400 });
    }

    try {
        // Fetch chat history from Supabase
        const { data: chatHistory, error: fetchError } = await supabase
            .from('chat_histories')
            .select('message, response')
            .eq('user_id', supabaseUserId)
            .order('timestamp', { ascending: true })
            .limit(10);

        if (fetchError) {
            console.error('Error fetching chat history:', fetchError);
            return NextResponse.json({ error: 'Error fetching chat history' }, { status: 500 });
        }

        // Prepare chat history for Gemini
        const history = chatHistory?.map(entry => [
            { role: "user", parts: [{ text: entry.message }] },
            { role: "model", parts: [{ text: entry.response }] }
        ]).flat() || [];

        // Start chat with history
        const chat = model.startChat({
            history: history,
            // generationConfig: {
            //     maxOutputTokens: 1000,
            // },
        });

        // Send message and get stream
        const result = await chat.sendMessageStream(message);

        // Prepare the stream response
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = '';
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullResponse += chunkText;
                    controller.enqueue(chunkText);
                }
                controller.close();

                // Sanitize the response before saving
                const sanitizedResponse = sanitizeUnicode(fullResponse);

                // Save the message and response to Supabase
                const { error: insertError } = await supabase
                    .from('chat_histories')
                    .insert({
                        user_id: supabaseUserId,
                        message: message,
                        response: sanitizedResponse
                    });

                if (insertError) {
                    console.error('Error saving chat history:', insertError);
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Function to sanitize Unicode escape sequences
function sanitizeUnicode(str: string): string {
    return str.replace(/\\u0000/g, '')  // Remove null characters
              .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/\\u/g, '\\\\u'); // Escape remaining Unicode sequences
}