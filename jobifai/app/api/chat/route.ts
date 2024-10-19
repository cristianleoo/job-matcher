import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { saveChatHistory, getChatHistory } from '@/lib/chatOperations';
import crypto from 'crypto';

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

    const { message, supabaseUserId, context, chatId, userData, resumeContent, section, sectionContent, is_chat_page_initialized } = await req.json();

    if (!is_chat_page_initialized) {
        const is_chat_page_initialized = false;
    }

    if (!supabaseUserId) {
        console.log("Supabase user ID not found in request");
        return NextResponse.json({ error: 'Supabase user ID not found in request' }, { status: 400 });
    }

    try {
        let chatData;
        const currentChatId = chatId || uuidv4(); // Use existing chatId or create a new one

        console.log(`Fetching or creating chat history for chatId: ${currentChatId}`);
        chatData = await getChatHistory(supabaseUserId, currentChatId, is_chat_page_initialized);
        if (!chatData) {
            console.log(`No existing chat found for chatId: ${currentChatId}. Creating a new chat.`);
            chatData = { messages: [] };
        }

        // Prepare chat history for Gemini
        const history = chatData.messages?.map((entry: { role: string; content: string }) => ({
            role: entry.role === "user" ? "user" : "model",
            parts: [{ text: entry.content }]
        })) || [];

        console.log('Prepared history for Gemini:', JSON.stringify(history).substring(0, 100) + '...');

        // Start chat with history
        const chat = model.startChat({
            history: history,
        });

        let fullMessage: string;

        if (context === 'resume' && resumeContent) {
            fullMessage = `You are an AI assistant helping a job seeker. The following text is the user's resume:
            Resume Content:
            ${resumeContent}

            Please keep this resume in mind when answering the following question from the user. Treat this resume as belonging to the person you're talking to.

            User question: ${message}`;
        } else if (context === 'section' && section && sectionContent) {
            fullMessage = `You are an AI assistant helping a job seeker. The following text is the user's resume:
            Resume Content:
            ${resumeContent}

            Please keep this resume in mind when answering the following question from the user. Treat this resume as belonging to the person you're talking to.
            Make sure to use the current content of the ${section} section of the resume.
            This is the current content of the ${section} section:
            ${sectionContent}

            User question: ${message}`;
        } else {
            fullMessage = message;
        }

        console.log("Full message:", fullMessage);
        console.log("Context:", context);
        console.log("Section:", section);
        console.log("Section content:", sectionContent);

        console.log("Sending message to AI:", fullMessage.substring(0, 200) + '...');

        // Send message and get stream
        const result = await chat.sendMessageStream(fullMessage);

        // Prepare the stream response
        const stream = new ReadableStream({
            async start(controller) {
                try {
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
                    chatData.messages.push(
                        { id: crypto.randomUUID(), role: 'user', content: message },
                        { id: crypto.randomUUID(), role: 'assistant', content: sanitizedResponse }
                    );

                    // Save the updated chat history
                    const title = chatData.messages[0]?.content?.substring(0, 50) || 'New Chat';
                    console.log("Saving chat history with is_chat_page_initialized:", is_chat_page_initialized || false);
                    await saveChatHistory(supabaseUserId, currentChatId, title, chatData, is_chat_page_initialized || false);
                } catch (streamError) {
                    console.error('Error in stream processing:', streamError);
                    controller.error(streamError);
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'X-Chat-ID': currentChatId,
            },
        });

    } catch (error) {
        console.error('Unexpected error in POST /api/chat:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Function to sanitize Unicode escape sequences
function sanitizeUnicode(str: string): string {
    return str.replace(/\\u0000/g, '')  // Remove null characters
              .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/\\u/g, '\\\\u'); // Escape remaining Unicode sequences
}
