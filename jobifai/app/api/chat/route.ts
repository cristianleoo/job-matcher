import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { saveChatHistory, getChatHistory } from '@/lib/chatOperations';

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

    const { message, supabaseUserId, context, chatId } = await req.json();

    if (!supabaseUserId) {
        console.log("Supabase user ID not found in request");
        return NextResponse.json({ error: 'Supabase user ID not found in request' }, { status: 400 });
    }

    try {
        let chatData;
        let resumeContent = '';

        if (chatId) {
            chatData = await getChatHistory(supabaseUserId, chatId);
        } else {
            chatData = { messages: [] };
        }

        if (context === 'resume') {
            // Fetch resume content
            const { data: resumeData, error: resumeError } = await supabase
                .from('resumes')
                .select('content')
                .eq('user_id', supabaseUserId)
                .single();

            if (resumeError) {
                console.error('Error fetching resume:', resumeError);
                return NextResponse.json({ error: 'Error fetching resume' }, { status: 500 });
            }

            resumeContent = resumeData?.content || '';
        }

        // Prepare chat history for Gemini
        const history = chatData ? chatData.messages.map((entry: { role: string; content: string }) => {
            if (entry.role === "user") {
                return { role: "user", parts: [{ text: entry.content }] };
            } else {
                return { role: "model", parts: [{ text: entry.content }] };
            }
        }) : [];

        // Start chat with history and resume content if applicable
        const chat = model.startChat({
            history: history,
        });

        // If it's a resume context, add the resume content to the message
        const fullMessage = context === 'resume' 
            ? `Given the following resume content: ${resumeContent}\n\nUser question: ${message}`
            : message;

        // Send message and get stream
        const result = await chat.sendMessageStream(fullMessage);

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

                // Update chatData with new message and response
                if (chatData) {
                    chatData.messages.push({
                        role: 'user',
                        content: message
                    });
                }

                // Save the updated chat history
                const newChatId = chatId || uuidv4();
                if (chatData) {
                    const title = chatData.messages[0]?.content.substring(0, 50) || 'New Chat';
                    await saveChatHistory(supabaseUserId, newChatId, title, chatData);
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