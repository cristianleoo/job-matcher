import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  const { prompt, currentContent } = await req.json();

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful assistant that rewrites and improves resume content." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'm here to help rewrite and improve resume content. What would you like me to work on?" }],
        },
      ],
    });

    const result = await chat.sendMessage(`${prompt}\n\nCurrent content: ${currentContent}`);
    const response = await result.response;
    const generatedContent = response.text();

    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Error generating content' }, { status: 500 });
  }
}
