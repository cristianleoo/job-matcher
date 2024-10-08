import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  const { prompt, currentContent, section } = await req.json();

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful assistant that rewrites and improves resume content. Please provide only the improved content without any additional explanations or formatting." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll provide only the improved content for the resume section you specify, maintaining the expected format." }],
        },
      ],
    });

    let systemPrompt = "";
    switch (section) {
      case 'summary':
        systemPrompt = "Rewrite the following professional summary. Provide only the improved summary text:";
        break;
      case 'skills':
        systemPrompt = "Improve the following list of skills. Provide only a comma-separated list of skills:";
        break;
      case 'experience':
        systemPrompt = "Improve the following job description. Provide only bullet points, each starting with a bullet point character (•):";
        break;
      default:
        throw new Error("Invalid section specified");
    }

    const result = await chat.sendMessage(`${systemPrompt}\n\nCurrent content:\n${currentContent}\n\nImproved content:`);
    const response = await result.response;
    const generatedContent = response.text().trim();

    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Error generating content' }, { status: 500 });
  }
}
